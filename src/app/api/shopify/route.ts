import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const domain = cookieStore.get("sc-shopify-domain")?.value;
    const token = cookieStore.get("sc-shopify-token")?.value;

    if (!domain || !token) {
      return NextResponse.json(
        { error: "Unauthorized. Missing Shopify domain or token in secure cookies" },
        { status: 401 },
      );
    }

    if (!domain.endsWith(".myshopify.com")) {
      return NextResponse.json(
        { error: "Forbidden. Invalid Shopify domain format." },
        { status: 403 },
      );
    }

    const body = await request.json();

    const shopifyResponse = await fetch(
      `https://${domain}/admin/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": token,
        },
        body: JSON.stringify(body),
      },
    );

    const data = await shopifyResponse.json();
    return NextResponse.json(data, { status: shopifyResponse.status });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        error: "Failed to proxy request to Shopify",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
