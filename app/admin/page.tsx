import { isAdminAuthenticated } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import { AdminLoginForm } from "./AdminLoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Place Portraits",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const authed = await isAdminAuthenticated();
  if (authed) redirect("/admin/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-sm border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="mb-6 text-lg font-medium text-gray-900">
          Place Portraits · Admin
        </h1>
        <AdminLoginForm />
      </div>
    </div>
  );
}
