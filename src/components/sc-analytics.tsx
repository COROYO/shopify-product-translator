"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

export function ScAnalytics() {
  const [showBanner, setShowBanner] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsMounted(true);
      const consent = localStorage.getItem("sc-cookie-consent");
      if (!consent) {
        setShowBanner(true);
      } else if (consent === "accepted") {
        setHasConsent(true);
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("sc-cookie-consent", "accepted");
    setHasConsent(true);
    setShowBanner(false);
  };

  const denyCookies = () => {
    localStorage.setItem("sc-cookie-consent", "denied");
    setShowBanner(false);
  };

  if (!isMounted) return null;

  return (
    <>
      {/* Google Analytics Script - Only injected if consent is given */}
      {hasConsent && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID || "G-1ZRZRETPF8"}`}
            strategy="lazyOnload"
          />
          <Script id="sc-google-analytics" strategy="lazyOnload">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID || "G-1ZRZRETPF8"}');
            `}
          </Script>
        </>
      )}

      {/* Cookie Banner */}
      {showBanner && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="sc-cookie-banner-title"
          id="sc-cookie-banner"
          className="sc-fixed sc-bottom-0 sc-left-0 sc-right-0 sc-bg-white sc-text-gray-800 sc-p-5 sc-shadow-[0_-2px_10px_rgba(0,0,0,0.1)] sc-flex sc-flex-col md:sc-flex-row sc-items-center md:sc-justify-between sc-gap-4 sc-z-[9999] sc-font-sans"
        >
          <p className="sc-text-center md:sc-text-left sc-text-sm sc-m-0 sc-leading-relaxed">
            Wir nutzen Cookies, um unsere Website für Sie optimal zu gestalten
            und Zugriffe zu analysieren. Weitere Informationen finden Sie in
            unserer{" "}
            <a
              href="https://coroyo.de/datenschutz"
              className="sc-underline sc-font-semibold sc-text-gray-800"
              target="_blank"
              rel="noopener noreferrer"
            >
              Datenschutzerklärung
            </a>
            .
          </p>
          <div className="sc-flex sc-gap-3 sc-shrink-0">
            <button
              id="sc-cookie-btn-deny"
              onClick={denyCookies}
              className="sc-border-none sc-px-5 sc-py-2.5 sc-rounded sc-cursor-pointer sc-text-sm sc-font-semibold sc-transition-opacity hover:sc-opacity-80 sc-bg-gray-200 sc-text-gray-800"
            >
              Ablehnen
            </button>
            <button
              id="sc-cookie-btn-accept"
              onClick={acceptCookies}
              className="sc-border-none sc-px-5 sc-py-2.5 sc-rounded sc-cursor-pointer sc-text-sm sc-font-semibold sc-transition-opacity hover:sc-opacity-80 sc-bg-black sc-text-white"
            >
              Annehmen
            </button>
          </div>
        </div>
      )}
    </>
  );
}
