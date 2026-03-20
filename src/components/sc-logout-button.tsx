"use client";

import { useRouter } from "next/navigation";
import { logoutAction } from "@/app/actions";

export function ScLogoutButton({ domain }: { domain: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="sc-text-sm sc-text-gray-500 dark:sc-text-gray-400 hover:sc-text-gray-900 dark:hover:sc-text-white focus:sc-outline-none"
    >
      Logout ({domain})
    </button>
  );
}
