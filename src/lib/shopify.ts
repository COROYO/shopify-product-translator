import { ScCredentials } from "@/components/sc-login";

export async function shopifyRequest(
  credentials: ScCredentials,
  query: string,
  variables: Record<string, unknown> = {},
) {
  // The token and domain are now securely stored in HttpOnly cookies
  // We no longer need to pass them in headers here
  const response = await fetch("/api/shopify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();
  if (json.errors) {
    throw new Error(json.errors[0]?.message || "GraphQL Error");
  }
  return json.data;
}

// Queries
export const GET_LOCALES_QUERY = `
  query getLocales {
    shopLocales {
      locale
      name
      primary
      published
    }
  }
`;

export const GET_PRODUCTS_TRANSLATIONS_QUERY = `
  query getProductsTranslations($first: Int!, $after: String, $locale: String!) {
    translatableResources(first: $first, after: $after, resourceType: PRODUCT) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          resourceId
          translatableContent {
            key
            value
            digest
            locale
          }
          translations(locale: $locale) {
            key
            value
            locale
            outdated
          }
        }
      }
    }
  }
`;

export const REGISTER_TRANSLATION_MUTATION = `
  mutation translationsRegister($resourceId: ID!, $translations: [TranslationInput!]!) {
    translationsRegister(resourceId: $resourceId, translations: $translations) {
      userErrors {
        message
        field
      }
      translations {
        key
        value
        locale
      }
    }
  }
`;
