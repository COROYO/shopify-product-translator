"use client";

import React, { useState, useEffect } from "react";
import { ScCredentials } from "./sc-login";
import {
  shopifyRequest,
  GET_LOCALES_QUERY,
  GET_PRODUCTS_TRANSLATIONS_QUERY,
  REGISTER_TRANSLATION_MUTATION,
} from "@/lib/shopify";
import { ScAiSettingsModal, AiSettings } from "./sc-ai-settings-modal";
import { aiTranslate } from "@/lib/ai-translate";
import { Settings, Bot, ChevronDown, ChevronUp, Moon, Sun } from "lucide-react";

interface Locale {
  locale: string;
  name: string;
  primary: boolean;
}

interface TranslatableItem {
  resourceId: string;
  key: string;
  sourceValue: string;
  digest: string;
  targetValue: string;
  originalTargetValue: string;
}

export function ScTranslationTable({
  credentials,
}: {
  credentials: ScCredentials;
}) {
  const [locales, setLocales] = useState<Locale[]>([]);
  const [targetLocale, setTargetLocale] = useState<string>("");

  const [items, setItems] = useState<TranslatableItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiSettings, setAiSettings] = useState<AiSettings>({
    provider: "none",
    apiKey: "",
  });

  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(
    new Set(),
  );

  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  const toggleProduct = (resourceId: string) => {
    setExpandedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(resourceId)) next.delete(resourceId);
      else next.add(resourceId);
      return next;
    });
  };

  useEffect(() => {
    fetchLocales();

    // Load AI settings from local storage
    const savedProvider = localStorage.getItem(
      "sc-ai-provider-remember",
    ) as AiSettings["provider"];
    if (savedProvider) {
      setTimeout(
        () => setAiSettings({ provider: savedProvider, apiKey: "" }),
        0,
      );
    }

    // Load theme
    const savedTheme = localStorage.getItem("sc-theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      setTheme(prefersDark ? "dark" : "light");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyTheme = (t: "light" | "dark") => {
    if (t === "dark") {
      document.documentElement.classList.add("sc-dark");
      document.documentElement.classList.remove("sc-light");
    } else {
      document.documentElement.classList.add("sc-light");
      document.documentElement.classList.remove("sc-dark");
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("sc-theme", nextTheme);
    applyTheme(nextTheme);
  };

  useEffect(() => {
    if (targetLocale) {
      fetchProducts(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetLocale]);

  const fetchLocales = async () => {
    try {
      const data = await shopifyRequest(credentials, GET_LOCALES_QUERY);
      const shopLocales = data.shopLocales || [];
      setLocales(shopLocales);

      const nonPrimary = shopLocales.find((l: Locale) => !l.primary);
      if (nonPrimary) {
        setTargetLocale(nonPrimary.locale);
      } else if (shopLocales.length > 0) {
        setTargetLocale(shopLocales[0].locale);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to fetch locales");
    }
  };

  const fetchProducts = async (afterCursor: string | null) => {
    setLoading(true);
    try {
      const data = await shopifyRequest(
        credentials,
        GET_PRODUCTS_TRANSLATIONS_QUERY,
        {
          first: 25,
          after: afterCursor,
          locale: targetLocale,
        },
      );

      const edges = data.translatableResources?.edges || [];
      const pageInfo = data.translatableResources?.pageInfo || {};

      const parsedItems: TranslatableItem[] = [];

      edges.forEach(
        (edge: {
          node: {
            resourceId: string;
            translatableContent: {
              key: string;
              value: string;
              digest: string;
            }[];
            translations: { key: string; value: string }[];
          };
        }) => {
          const node = edge.node;
          const resourceId = node.resourceId;
          const translatableContent = node.translatableContent || [];
          const translations = node.translations || [];

          translatableContent.forEach((content) => {
            // Find matching translation
            const translation = translations.find((t) => t.key === content.key);
            parsedItems.push({
              resourceId,
              key: content.key,
              sourceValue: content.value,
              digest: content.digest,
              targetValue: translation ? translation.value : "",
              originalTargetValue: translation ? translation.value : "",
            });
          });
        },
      );

      setItems(parsedItems);
      setHasNextPage(pageInfo.hasNextPage);
      setCursor(pageInfo.endCursor);

      if (afterCursor && !history.includes(afterCursor)) {
        setHistory([...history, afterCursor]);
      } else if (!afterCursor) {
        setHistory([]);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (index: number, val: string) => {
    const newItems = [...items];
    newItems[index].targetValue = val;
    setItems(newItems);
  };

  const [translatingId, setTranslatingId] = useState<string | null>(null);

  const handleAutoTranslate = async (index: number, item: TranslatableItem) => {
    if (aiSettings.provider === "none") {
      alert("Please configure AI settings first");
      setIsAiModalOpen(true);
      return;
    }

    setTranslatingId(`${item.resourceId}-${item.key}`);
    try {
      const result = await aiTranslate(
        item.sourceValue,
        targetLocale,
        aiSettings.provider
      );
      handleValueChange(index, result);
    } catch (err: unknown) {
      console.error(err);
      alert(
        "Translation failed: " +
          (err instanceof Error ? err.message : String(err)),
      );
    } finally {
      setTranslatingId(null);
    }
  };

  const saveTranslation = async (item: TranslatableItem) => {
    setSavingId(`${item.resourceId}-${item.key}`);
    try {
      const variables = {
        resourceId: item.resourceId,
        translations: [
          {
            key: item.key,
            value: item.targetValue,
            locale: targetLocale,
            translatableContentDigest: item.digest,
          },
        ],
      };
      const data = await shopifyRequest(
        credentials,
        REGISTER_TRANSLATION_MUTATION,
        variables,
      );
      const userErrors = data.translationsRegister?.userErrors || [];
      if (userErrors.length > 0) {
        alert(
          "Error: " +
            userErrors.map((e: { message: string }) => e.message).join(", "),
        );
      } else {
        // Update original to match new
        const newItems = items.map((i) => {
          if (i.resourceId === item.resourceId && i.key === item.key) {
            return { ...i, originalTargetValue: i.targetValue };
          }
          return i;
        });
        setItems(newItems);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save translation");
    } finally {
      setSavingId(null);
    }
  };

  const groupedItems = items.reduce(
    (acc, item, index) => {
      if (!acc[item.resourceId]) acc[item.resourceId] = [];
      acc[item.resourceId].push({ item, index });
      return acc;
    },
    {} as Record<string, { item: TranslatableItem; index: number }[]>,
  );

  const renderFieldRow = (
    item: TranslatableItem,
    idx: number,
    isMain: boolean,
    totalOtherFields: number,
    isExpanded: boolean,
    productTitle: string | null,
  ) => {
    const isDirty = item.targetValue !== item.originalTargetValue;
    const isSaving = savingId === `${item.resourceId}-${item.key}`;
    const isTranslating = translatingId === `${item.resourceId}-${item.key}`;

    return (
      <tr
        key={`${item.resourceId}-${item.key}`}
        className={
          isMain
            ? "sc-bg-gray-50/30 dark:sc-bg-gray-700/30"
            : "sc-bg-white dark:sc-bg-gray-800"
        }
      >
        <td className="sc-px-6 sc-py-4 sc-text-sm sc-font-medium sc-text-gray-900 dark:sc-text-gray-100 sc-break-words sc-align-top">
          {isMain && productTitle && (
            <div className="sc-mb-3 sc-text-base sc-font-bold sc-text-gray-900 dark:sc-text-white">
              {productTitle}
            </div>
          )}
          <div
            className={
              isMain
                ? "sc-font-medium sc-text-gray-600 dark:sc-text-gray-300"
                : ""
            }
          >
            {item.key}
          </div>
          {isMain && (
            <div className="sc-text-xs sc-text-gray-400 dark:sc-text-gray-500 sc-break-all sc-mt-1">
              ID: {item.resourceId.split("/").pop()}
            </div>
          )}
          {isMain && totalOtherFields > 0 && (
            <button
              onClick={() => toggleProduct(item.resourceId)}
              className="sc-mt-4 sc-text-xs sc-text-blue-600 dark:sc-text-blue-400 hover:sc-text-blue-800 dark:hover:sc-text-blue-300 sc-font-medium sc-flex sc-items-center sc-gap-1"
            >
              {isExpanded ? (
                <>
                  <ChevronUp size={14} /> Weniger anzeigen
                </>
              ) : (
                <>
                  <ChevronDown size={14} /> {totalOtherFields} weitere Felder
                  aufklappen
                </>
              )}
            </button>
          )}
        </td>
        <td className="sc-px-6 sc-py-4 sc-text-sm sc-text-gray-500 dark:sc-text-gray-400 sc-align-top">
          <div className="sc-max-h-32 sc-overflow-y-auto sc-whitespace-pre-wrap">
            {item.sourceValue}
          </div>
        </td>
        <td className="sc-px-6 sc-py-4 sc-relative sc-align-top">
          <div className="sc-flex sc-items-start sc-gap-2">
            <textarea
              className="sc-w-full sc-rounded-md sc-border sc-border-gray-300 dark:sc-border-gray-600 dark:sc-bg-gray-700 dark:sc-text-white sc-p-2 focus:sc-border-blue-500 focus:sc-ring-blue-500 sm:sc-text-sm sc-min-h-[80px]"
              value={item.targetValue}
              onChange={(e) => handleValueChange(idx, e.target.value)}
              disabled={isTranslating}
            />
            {aiSettings.provider !== "none" && (
              <button
                onClick={() => handleAutoTranslate(idx, item)}
                disabled={isTranslating}
                title="Auto Translate"
                className="sc-p-2 sc-text-gray-500 dark:sc-text-gray-400 hover:sc-text-blue-600 dark:hover:sc-text-blue-400 focus:sc-outline-none"
              >
                <Bot
                  size={20}
                  className={
                    isTranslating ? "sc-animate-pulse sc-text-blue-500" : ""
                  }
                />
              </button>
            )}
          </div>
        </td>
        <td className="sc-px-6 sc-py-4 sc-text-right sc-text-sm sc-font-medium sc-align-top">
          <button
            onClick={() => saveTranslation(item)}
            disabled={!isDirty || isSaving}
            className={`sc-px-3 sc-py-1 sc-rounded-md sc-text-white sc-transition-colors ${
              !isDirty || isSaving
                ? "sc-bg-gray-300 dark:sc-bg-gray-600 sc-cursor-not-allowed"
                : "sc-bg-blue-600 hover:sc-bg-blue-700"
            }`}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </td>
      </tr>
    );
  };

  return (
    <div className="sc-flex sc-flex-col sc-gap-4">
      <div className="sc-flex sc-items-center sc-gap-4 sc-bg-white dark:sc-bg-gray-800 sc-p-4 sc-rounded-lg sc-shadow">
        <div>
          <label className="sc-block sc-text-sm sc-font-medium sc-text-gray-700 dark:sc-text-gray-300">
            Target Language
          </label>
          <select
            value={targetLocale}
            onChange={(e) => setTargetLocale(e.target.value)}
            className="sc-mt-1 sc-block sc-w-48 sc-rounded-md sc-border-gray-300 dark:sc-border-gray-600 dark:sc-bg-gray-700 dark:sc-text-white sc-py-2 sc-pl-3 sc-pr-10 sc-text-base focus:sc-border-blue-500 focus:sc-outline-none focus:sc-ring-blue-500 sm:sc-text-sm"
          >
            {locales.map((l) => (
              <option key={l.locale} value={l.locale}>
                {l.name} ({l.locale})
              </option>
            ))}
          </select>
        </div>
        <div className="sc-ml-auto sc-flex sc-items-center sc-gap-2">
          <button
            onClick={toggleTheme}
            className="sc-flex sc-items-center sc-justify-center sc-gap-2 sc-rounded-md sc-bg-gray-100 dark:sc-bg-gray-700 sc-p-2 sc-text-gray-700 dark:sc-text-gray-300 hover:sc-bg-gray-200 dark:hover:sc-bg-gray-600"
            title="Toggle Light/Dark Mode"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {/*
          <button
            onClick={() => setIsAiModalOpen(true)}
            className="sc-flex sc-items-center sc-gap-2 sc-rounded-md sc-bg-gray-100 dark:sc-bg-gray-700 sc-px-3 sc-py-2 sc-text-sm sc-font-medium sc-text-gray-700 dark:sc-text-gray-300 hover:sc-bg-gray-200 dark:hover:sc-bg-gray-600"
          >
            <Settings size={16} />
            AI Settings
          </button>
          */}
        </div>
      </div>

      <ScAiSettingsModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onSave={(settings) => setAiSettings(settings)}
      />

      <div className="sc-bg-white dark:sc-bg-gray-800 sc-rounded-lg sc-shadow sc-overflow-hidden">
        <table className="sc-min-w-full sc-divide-y sc-divide-gray-200 dark:sc-divide-gray-700 sc-table-fixed">
          <thead className="sc-bg-gray-50 dark:sc-bg-gray-900">
            <tr>
              <th className="sc-w-[15%] sc-px-6 sc-py-3 sc-text-left sc-text-xs sc-font-medium sc-text-gray-500 dark:sc-text-gray-400 sc-uppercase sc-tracking-wider">
                Field
              </th>
              <th className="sc-w-[35%] sc-px-6 sc-py-3 sc-text-left sc-text-xs sc-font-medium sc-text-gray-500 dark:sc-text-gray-400 sc-uppercase sc-tracking-wider">
                Source (Read Only)
              </th>
              <th className="sc-w-[35%] sc-px-6 sc-py-3 sc-text-left sc-text-xs sc-font-medium sc-text-gray-500 dark:sc-text-gray-400 sc-uppercase sc-tracking-wider">
                Target ({targetLocale})
              </th>
              <th className="sc-w-[15%] sc-px-6 sc-py-3 sc-text-right sc-text-xs sc-font-medium sc-text-gray-500 dark:sc-text-gray-400 sc-uppercase sc-tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="sc-bg-white dark:sc-bg-gray-800 sc-divide-y sc-divide-gray-200 dark:sc-divide-gray-700">
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="sc-px-6 sc-py-4 sc-text-center dark:sc-text-gray-300"
                >
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="sc-px-6 sc-py-4 sc-text-center dark:sc-text-gray-300"
                >
                  No translatable products found.
                </td>
              </tr>
            ) : (
              Object.values(groupedItems).map((group) => {
                const resourceId = group[0].item.resourceId;
                const isExpanded = expandedProducts.has(resourceId);

                const titleField = group.find((g) => g.item.key === "title");
                const productTitle = titleField
                  ? titleField.item.sourceValue
                  : null;

                // Priority: body_html -> title -> first available
                const bodyHtmlIdx = group.findIndex(
                  (g) => g.item.key === "body_html",
                );
                const titleIdx = group.findIndex((g) => g.item.key === "title");

                let mainFieldIndex = 0;
                if (bodyHtmlIdx !== -1) mainFieldIndex = bodyHtmlIdx;
                else if (titleIdx !== -1) mainFieldIndex = titleIdx;

                const mainField = group[mainFieldIndex];
                const otherFields = group.filter(
                  (_, i) => i !== mainFieldIndex,
                );

                return (
                  <React.Fragment key={resourceId}>
                    {renderFieldRow(
                      mainField.item,
                      mainField.index,
                      true,
                      otherFields.length,
                      isExpanded,
                      productTitle,
                    )}
                    {isExpanded &&
                      otherFields.map((f) =>
                        renderFieldRow(f.item, f.index, false, 0, false, null),
                      )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="sc-bg-white dark:sc-bg-gray-800 sc-px-4 sc-py-3 sc-flex sc-items-center sc-justify-between sc-border-t sc-border-gray-200 dark:sc-border-gray-700 sm:sc-px-6">
          <div className="sc-flex-1 sc-flex sc-justify-between">
            <button
              onClick={() => {
                if (history.length > 1) {
                  const newHistory = [...history];
                  newHistory.pop(); // remove current
                  const prev = newHistory[newHistory.length - 1];
                  setHistory(newHistory);
                  fetchProducts(prev === "START" ? null : prev);
                } else if (history.length === 1) {
                  setHistory([]);
                  fetchProducts(null);
                }
              }}
              disabled={history.length === 0}
              className="sc-relative sc-inline-flex sc-items-center sc-px-4 sc-py-2 sc-border sc-border-gray-300 dark:sc-border-gray-600 sc-text-sm sc-font-medium sc-rounded-md sc-text-gray-700 dark:sc-text-gray-300 sc-bg-white dark:sc-bg-gray-800 hover:sc-bg-gray-50 dark:hover:sc-bg-gray-700 disabled:sc-bg-gray-100 dark:disabled:sc-bg-gray-900 disabled:sc-text-gray-400 dark:disabled:sc-text-gray-600"
            >
              Previous
            </button>
            <button
              onClick={() => fetchProducts(cursor)}
              disabled={!hasNextPage}
              className="sc-relative sc-inline-flex sc-items-center sc-px-4 sc-py-2 sc-border sc-border-gray-300 dark:sc-border-gray-600 sc-text-sm sc-font-medium sc-rounded-md sc-text-gray-700 dark:sc-text-gray-300 sc-bg-white dark:sc-bg-gray-800 hover:sc-bg-gray-50 dark:hover:sc-bg-gray-700 disabled:sc-bg-gray-100 dark:disabled:sc-bg-gray-900 disabled:sc-text-gray-400 dark:disabled:sc-text-gray-600"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
