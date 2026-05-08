import { requireAdminAuth } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";
import { AdminRequestTable } from "@/components/admin/AdminRequestTable";
import { adminLogoutAction } from "../actions";
import type { Metadata } from "next";
import type { PreviewStatus } from "@/types";

export const metadata: Metadata = {
  title: "Dashboard — Place Portraits Admin",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

const ALL_STATUSES: PreviewStatus[] = [
  "pending", "generating", "ready", "failed",
  "revision_requested", "ordered", "fulfilled", "cancelled",
];

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  await requireAdminAuth();

  const params = await searchParams;
  const filterStatus = params.status as PreviewStatus | undefined;

  const supabase = createAdminClient();
  let query = supabase
    .from("preview_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (filterStatus && ALL_STATUSES.includes(filterStatus)) {
    query = query.eq("status", filterStatus);
  }

  const { data: requests, error } = await query;

  // Count by status for filter badges
  const { data: counts } = await supabase
    .from("preview_requests")
    .select("status");

  const statusCounts = (counts ?? []).reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-base font-medium text-gray-900">
            Place Portraits · Admin
          </h1>
          <form action={adminLogoutAction}>
            <button
              type="submit"
              className="text-xs text-gray-500 hover:text-gray-800 underline"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Preview requests</h2>
          <span className="text-sm text-gray-500">
            {requests?.length ?? 0} shown
          </span>
        </div>

        {/* Status filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <a
            href="/admin/dashboard"
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              !filterStatus
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}
          >
            All ({counts?.length ?? 0})
          </a>
          {ALL_STATUSES.map((s) => (
            <a
              key={s}
              href={`/admin/dashboard?status=${s}`}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filterStatus === s
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {s} ({statusCounts[s] ?? 0})
            </a>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-sm bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            Failed to load requests: {error.message}
          </div>
        )}

        <AdminRequestTable requests={requests ?? []} />
      </div>
    </div>
  );
}
