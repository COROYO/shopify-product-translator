"use server";

import { cookies } from "next/headers";

export async function loginAction(domain: string, token: string) {
  const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  
  if (!cleanDomain.endsWith(".myshopify.com")) {
    throw new Error("Invalid domain. Must be a .myshopify.com domain.");
  }
  
  if (!token.startsWith("shpat_")) {
    throw new Error("Invalid token. Must start with shpat_.");
  }

  const cookieStore = await cookies();
  
  cookieStore.set("sc-shopify-domain", cleanDomain, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  
  cookieStore.set("sc-shopify-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  
  return { success: true };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("sc-shopify-domain");
  cookieStore.delete("sc-shopify-token");
  return { success: true };
}

export async function saveAiSettingsAction(provider: string, apiKey: string) {
  const cookieStore = await cookies();
  
  cookieStore.set("sc-ai-provider", provider, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  
  if (apiKey) {
    cookieStore.set("sc-ai-key", apiKey, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  } else {
    cookieStore.delete("sc-ai-key");
  }
  
  return { success: true };
}
