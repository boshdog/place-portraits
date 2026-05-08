"use server";

import { setAdminSession, clearAdminSession } from "@/lib/admin-auth";
import { redirect } from "next/navigation";

export async function adminLoginAction(
  _prev: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  const adminEmail = (process.env.ADMIN_EMAIL ?? "").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";

  if (!adminEmail || !adminPassword) {
    return { error: "Admin credentials are not configured." };
  }

  if (email !== adminEmail || password !== adminPassword) {
    // Short delay to slow brute force
    await new Promise((r) => setTimeout(r, 600));
    return { error: "Incorrect email or password." };
  }

  await setAdminSession();
  redirect("/admin/dashboard");
}

export async function adminLogoutAction() {
  await clearAdminSession();
  redirect("/admin");
}
