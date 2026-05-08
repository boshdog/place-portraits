import { requireAdminAuth } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";
import { AdminRequestDetail } from "@/components/admin/AdminRequestDetail";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Request Detail — Place Portraits Admin",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminRequestDetailPage({ params }: PageProps) {
  await requireAdminAuth();

  const { id } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("preview_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-base font-medium text-gray-900">
            Place Portraits · Admin
          </h1>
        </div>
      </header>
      <AdminRequestDetail request={data} siteUrl={siteUrl} />
    </div>
  );
}
