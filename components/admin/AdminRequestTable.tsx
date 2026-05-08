import Link from "next/link";
import { clsx } from "clsx";
import type { PreviewRequest } from "@/types";
import { getStyleLabel } from "@/lib/styles";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  generating: "bg-blue-100 text-blue-800",
  ready: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  revision_requested: "bg-orange-100 text-orange-800",
  ordered: "bg-purple-100 text-purple-800",
  fulfilled: "bg-gray-100 text-gray-700",
  cancelled: "bg-gray-100 text-gray-500",
};

interface AdminRequestTableProps {
  requests: PreviewRequest[];
}

export function AdminRequestTable({ requests }: AdminRequestTableProps) {
  if (requests.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-gray-500">
        No requests found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {[
              "Customer",
              "Style",
              "Status",
              "Quality",
              "Created",
              "",
            ].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {requests.map((req) => (
            <tr key={req.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <p className="font-medium text-gray-900">{req.customer_name}</p>
                <p className="text-xs text-gray-500">{req.customer_email}</p>
              </td>
              <td className="px-4 py-3 text-gray-700">
                {getStyleLabel(req.style)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={clsx(
                    "rounded-full px-2 py-0.5 text-xs font-medium",
                    STATUS_COLORS[req.status] ?? "bg-gray-100 text-gray-600"
                  )}
                >
                  {req.status}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-gray-500">
                {req.quality_status ?? "—"}
              </td>
              <td className="px-4 py-3 text-xs text-gray-500">
                {new Date(req.created_at).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/requests/${req.id}`}
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
