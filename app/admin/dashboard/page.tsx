import { requireAdminAuth } from "@/lib/admin-auth";
import { dbListPreviews, dbCountByStatus, getConfigStatus } from "@/lib/data";
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
  const config = getConfigStatus();

  const [requests, statusCounts] = await Promise.all([
    dbListPreviews(filterStatus && ALL_STATUSES.includes(filterStatus) ? filterStatus : undefined),
    dbCountByStatus(),
  ]);

  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-base font-medium text-gray-900">Place Portraits · Admin</h1>
          <div className="flex items-center gap-4">
            {config.devMode && (
              <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                Dev mode — in-memory store
              </span>
            )}
            <form action={adminLogoutAction}>
              <button type="submit" className="text-xs text-gray-500 underline hover:text-gray-800">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Config warnings */}
        {config.devMode && (
          <div className="mb-6 rounded-sm border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
            <strong>Dev mode:</strong> Running without Supabase — data is stored in memory and will reset on server restart.
            Add your Supabase credentials to <code className="font-mono">.env.local</code> for persistent storage.
          </div>
        )}
        {!config.gemini && (
          <div className="mb-4 rounded-sm border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <strong>Generation:</strong> No Gemini API key — using mock placeholder images.
            Set <code className="font-mono">GEMINI_API_KEY</code> in <code className="font-mono">.env.local</code> for real generation.
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Preview requests</h2>
          <span className="text-sm text-gray-500">{requests.length} shown</span>
        </div>

        {/* Status filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <a href="/admin/dashboard"
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              !filterStatus ? "bg-gray-900 text-white" : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
            }`}>
            All ({total})
          </a>
          {ALL_STATUSES.map(s => (
            <a key={s} href={`/admin/dashboard?status=${s}`}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filterStatus === s ? "bg-gray-900 text-white" : "border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
              }`}>
              {s} ({statusCounts[s] ?? 0})
            </a>
          ))}
        </div>

        <AdminRequestTable requests={requests} />
      </div>
    </div>
  );
}
