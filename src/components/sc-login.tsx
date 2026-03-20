"use client";

import { useState, useEffect } from "react";
import { loginAction } from "@/app/actions";
import { useRouter } from "next/navigation";
import { Sun, Moon } from "lucide-react";

export interface ScCredentials {
  domain: string;
}

export function ScLogin({
  onLogin,
}: {
  onLogin?: (creds: ScCredentials) => void;
}) {
  const router = useRouter();
  const [domain, setDomain] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");

  useEffect(() => {
    const savedDomain = localStorage.getItem("sc-shopify-domain-remember");
    if (savedDomain) {
      setTimeout(() => setDomain(savedDomain), 0);
    }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain || !token) return;

    setError(null);
    setIsLoading(true);

    const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    localStorage.setItem("sc-shopify-domain-remember", cleanDomain);

    try {
      await loginAction(cleanDomain, token);

      if (onLogin) {
        onLogin({ domain: cleanDomain });
      }

      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
      setIsLoading(false);
    }
  };

  return (
    <div
      role="main"
      aria-label="Login"
      className="sc-flex sc-h-screen sc-w-full sc-items-center sc-justify-center sc-bg-gray-50 dark:sc-bg-gray-900"
    >
      <div className="sc-w-full sc-max-w-md sc-rounded-lg sc-bg-white dark:sc-bg-gray-800 sc-p-8 sc-shadow-md">
        <div className="sc-mb-6 sc-flex sc-items-center sc-justify-between">
          <h1 className="sc-text-2xl sc-font-bold sc-text-gray-900 dark:sc-text-white">
            Shopify Translator
          </h1>
          <button
            onClick={toggleTheme}
            type="button"
            className="sc-rounded-full sc-p-2 hover:sc-bg-gray-100 dark:hover:sc-bg-gray-700 sc-transition-colors sc-text-gray-600 dark:sc-text-gray-300"
            title="Toggle Dark Mode"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {error && (
          <div className="sc-mb-4 sc-rounded-md sc-bg-red-50 sc-p-4 dark:sc-bg-red-900/50">
            <p className="sc-text-sm sc-text-red-800 dark:sc-text-red-200">
              {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="sc-flex sc-flex-col sc-gap-4">
          <div>
            <label
              htmlFor="sc-domain"
              className="sc-mb-1 sc-block sc-text-sm sc-font-medium sc-text-black dark:sc-text-gray-300"
            >
              Shopify Domain (e.g. shop.myshopify.com)
            </label>
            <input
              id="sc-domain"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="sc-w-full sc-rounded-md sc-border sc-text-black dark:sc-text-white sc-border-gray-300 dark:sc-border-gray-600 dark:sc-bg-gray-700 sc-p-2 focus:sc-border-blue-500 focus:sc-outline-none focus:sc-ring-1 focus:sc-ring-blue-500"
              placeholder="my-shop.myshopify.com"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label
              htmlFor="sc-token"
              className="sc-mb-1 sc-block sc-text-sm sc-font-medium sc-text-black dark:sc-text-gray-300"
            >
              Admin Access Token (shpat_...)
            </label>
            <input
              id="sc-token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="sc-w-full sc-rounded-md sc-border sc-text-black dark:sc-text-white sc-border-gray-300 dark:sc-border-gray-600 dark:sc-bg-gray-700 sc-p-2 focus:sc-border-blue-500 focus:sc-outline-none focus:sc-ring-1 focus:sc-ring-blue-500"
              placeholder="shpat_..."
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`sc-mt-4 sc-w-full sc-rounded-md sc-p-2 sc-text-white sc-font-medium focus:sc-outline-none focus:sc-ring-2 focus:sc-ring-blue-500 focus:sc-ring-offset-2 ${
              isLoading
                ? "sc-bg-blue-400 sc-cursor-not-allowed"
                : "sc-bg-blue-600 hover:sc-bg-blue-700"
            }`}
          >
            {isLoading ? "Connecting..." : "Connect"}
          </button>
        </form>
      </div>
    </div>
  );
}
