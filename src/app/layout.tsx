import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { ScAnalytics } from "@/components/sc-analytics";

const montserrat = Montserrat({
  variable: "--sc-font-montserrat",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Shopify Translator",
  description: "Translate your Shopify products with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${montserrat.variable} sc-h-full sc-antialiased`}
    >
      <body className="sc-min-h-full sc-flex sc-flex-col sc-font-sans sc-bg-background sc-text-foreground">
        {children}
        <ScAnalytics />
      </body>
    </html>
  );
}
