import dynamic from "next/dynamic";
import { cookies } from "next/headers";
import { ScLogin } from "@/components/sc-login";
import { ScLogoutButton } from "@/components/sc-logout-button";
import { ScFooter } from "@/components/sc-footer";

const ScTranslationTable = dynamic(
  () =>
    import("@/components/sc-translation-table").then(
      (m) => m.ScTranslationTable,
    ),
  {
    ssr: true,
    loading: () => (
      <div
        className="sc-animate-pulse sc-h-40 sc-rounded-lg sc-bg-gray-200 dark:sc-bg-gray-700"
        aria-hidden
      />
    ),
  },
);

export default async function Home() {
  const cookieStore = await cookies();
  const domain = cookieStore.get("sc-shopify-domain")?.value;
  const token = cookieStore.get("sc-shopify-token")?.value;

  if (!domain || !token) {
    return (
      <>
        <ScLogin />
        <ScFooter />
      </>
    );
  }

  const credentials = { domain };

  return (
    <>
      <div className="sc-min-h-screen sc-bg-gray-100 dark:sc-bg-gray-900 sc-p-8">
        <div className="sc-mx-auto sc-max-w-7xl">
          <div className="sc-mb-8 sc-flex sc-items-center sc-justify-between">
            <h1 className="sc-text-3xl sc-font-bold sc-text-gray-900 dark:sc-text-white">
              Shopify Translator
            </h1>
            <ScLogoutButton domain={domain} />
          </div>

          <ScTranslationTable credentials={credentials} />
        </div>
      </div>
      <ScFooter />
    </>
  );
}
