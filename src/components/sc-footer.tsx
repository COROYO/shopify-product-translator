import { Github } from "lucide-react";

export function ScFooter() {
  return (
    <footer className="sc-bg-gray-100 dark:sc-bg-gray-900 sc-p-8">
      <div className="sc-container sc-flex sc-flex-col md:sc-flex-row sc-items-center sc-justify-center sc-gap-2 md:sc-gap-6 sc-text-sm sc-text-muted-foreground">
        <a
          href="https://coroyo.de/datenschutz"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          Datenschutz
        </a>
        <span className="hidden md:inline sc-text-border">|</span>
        <a
          href="https://coroyo.de/impressum/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          Impressum
        </a>
        <span className="hidden md:inline sc-text-border">|</span>
        <a
          href="https://shrymp-commerce.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:sc-text-foreground sc-transition-colors"
        >
          Shrymp Commerce 🦐
        </a>
        <span className="hidden md:inline sc-text-border">|</span>
        <a
          href="https://github.com/COROYO/shopify-product-translator.git"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:sc-text-foreground sc-transition-colors"
          title="Open Source on GitHub"
        >
          <Github className="h-4 w-4" />
        </a>
        <span className="hidden md:inline sc-text-border">|</span>
        <span className="sc-text-muted-foreground">
          v{process.env.NEXT_PUBLIC_APP_VERSION}
        </span>
      </div>
    </footer>
  );
}
