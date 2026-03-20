"use client";

import { useState, useEffect } from "react";
import { saveAiSettingsAction } from "@/app/actions";
import { trackScEvent } from "@/lib/sc-tracking";

export interface AiSettings {
  provider: "openai" | "gemini" | "none";
  apiKey: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: AiSettings) => void;
}

export function ScAiSettingsModal({ isOpen, onClose, onSave }: Props) {
  const [provider, setProvider] = useState<"openai" | "gemini" | "none">(
    "none",
  );
  const [apiKey, setApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const savedProvider = localStorage.getItem("sc-ai-provider-remember") as
        | "openai"
        | "gemini"
        | "none";
      if (savedProvider) {
        setTimeout(() => setProvider(savedProvider), 0);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem("sc-ai-provider-remember", provider);
      await saveAiSettingsAction(provider, apiKey);
      trackScEvent("ai_settings_saved", { provider });
      onSave({ provider, apiKey });
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save settings securely");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="sc-fixed sc-inset-0 sc-z-50 sc-flex sc-items-center sc-justify-center sc-bg-black/50">
      <div className="sc-w-full sc-max-w-md sc-rounded-lg sc-bg-white dark:sc-bg-gray-800 sc-p-6 sc-shadow-xl">
        <h2 className="sc-mb-4 sc-text-xl sc-font-bold sc-text-gray-900 dark:sc-text-white">
          AI Translation Settings
        </h2>

        <div className="sc-mb-4">
          <label className="sc-mb-1 sc-block sc-text-sm sc-font-medium sc-text-gray-700 dark:sc-text-gray-300">
            Provider
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as AiSettings['provider'])}
            className="sc-w-full sc-rounded-md sc-border sc-border-gray-300 dark:sc-border-gray-600 dark:sc-bg-gray-700 dark:sc-text-white sc-p-2 focus:sc-border-blue-500 focus:sc-ring-blue-500"
            disabled={isSaving}
          >
            <option value="none">Manual Translation Only</option>
            <option value="openai">OpenAI</option>
            <option value="gemini">Google Gemini</option>
          </select>
        </div>

        {provider !== "none" && (
          <div className="sc-mb-6">
            <label className="sc-mb-1 sc-block sc-text-sm sc-font-medium sc-text-gray-700 dark:sc-text-gray-300">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Enter your ${provider === "openai" ? "OpenAI" : "Gemini"} API key`}
              className="sc-w-full sc-rounded-md sc-border sc-border-gray-300 dark:sc-border-gray-600 dark:sc-bg-gray-700 dark:sc-text-white sc-p-2 focus:sc-border-blue-500 focus:sc-ring-blue-500"
              disabled={isSaving}
            />
            <p className="sc-mt-1 sc-text-xs sc-text-gray-500 dark:sc-text-gray-400">
              Key is securely stored in an HttpOnly cookie.
            </p>
          </div>
        )}

        <div className="sc-flex sc-justify-end sc-gap-3">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="sc-rounded-md sc-px-4 sc-py-2 sc-text-sm sc-font-medium sc-text-gray-700 dark:sc-text-gray-300 hover:sc-bg-gray-100 dark:hover:sc-bg-gray-700 disabled:sc-opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="sc-rounded-md sc-bg-blue-600 sc-px-4 sc-py-2 sc-text-sm sc-font-medium sc-text-white hover:sc-bg-blue-700 disabled:sc-opacity-50"
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
