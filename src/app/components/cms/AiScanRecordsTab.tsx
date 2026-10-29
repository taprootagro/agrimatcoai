import { useCallback, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { edgeFnAuth } from "./edgeFnAuth";
import type { CmsTabProps } from "./cmsTab";

type ScanRow = {
  job_id: string;
  user_id: string;
  display_name: string;
  phone: string;
  created_at: string;
  finished_at: string | null;
  status: string;
  route: string;
  latitude: number | null;
  longitude: number | null;
  accuracy_m: number | null;
  analysis: string | null;
  provider: string | null;
  model: string | null;
  error: string | null;
};

function formatLocalTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function userLabel(row: ScanRow): string {
  const name = (row.display_name || "").trim();
  if (name) return name;
  const phone = (row.phone || "").trim();
  if (phone) return phone;
  return row.user_id.slice(0, 8);
}

function gpsCell(row: ScanRow, ct: CmsTabProps["ct"]): string {
  if (row.latitude == null || row.longitude == null) return "—";
  const acc =
    row.accuracy_m != null && Number.isFinite(row.accuracy_m)
      ? ` ±${Math.round(row.accuracy_m)}m`
      : "";
  return `${row.latitude}, ${row.longitude}${acc}`;
}

export function AiScanRecordsTab({
  workingConfig,
  ct,
}: Pick<CmsTabProps, "workingConfig" | "ct">) {
  const [q, setQ] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [includeFollowUps, setIncludeFollowUps] = useState(false);
  const [rows, setRows] = useState<ScanRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const fetchPage = useCallback(
    async (mode: "replace" | "append", before?: string) => {
      const auth = await edgeFnAuth(workingConfig);
      if (!auth?.token) {
        setLoadError(ct("请先登录 Supabase 会话", "Sign in with Supabase first"));
        return;
      }
      setLoading(true);
      setLoadError(null);
      try {
        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        if (fromDate) params.set("from", new Date(`${fromDate}T00:00:00`).toISOString());
        if (toDate) params.set("to", new Date(`${toDate}T23:59:59.999`).toISOString());
        params.set("route", includeFollowUps ? "all" : "analysis");
        params.set("limit", "200");
        if (before) params.set("before", before);

        const res = await fetch(`${auth.base}/admin/ai-scan-records?${params}`, {
          headers: { apikey: auth.anon, Authorization: `Bearer ${auth.token}` },
        });
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          error?: string;
          rows?: ScanRow[];
        };
        if (!res.ok || !data.ok) {
          setLoadError(data.error || res.statusText);
          return;
        }
        const next = data.rows ?? [];
        setRows((prev) => (mode === "append" ? [...prev, ...next] : next));
      } finally {
        setLoading(false);
      }
    },
    [workingConfig, q, fromDate, toDate, includeFollowUps, ct],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, ScanRow[]>();
    for (const row of rows) {
      const key = row.user_id;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(row);
    }
    return [...map.entries()].map(([userId, list]) => ({
      userId,
      label: userLabel(list[0]!),
      rows: list,
    }));
  }, [rows]);

  const oldestCursor = rows.length > 0 ? rows[rows.length - 1]!.created_at : undefined;

  return (
    <div className="p-4 max-w-5xl space-y-4">
      <p className="text-sm text-gray-600">
        {ct(
          "按用户查看云端识图记录：时间、模糊 GPS（约 1 公里）、分析结果。",
          "Cloud scan records by user: time, blurred GPS (~1 km), and analysis text.",
        )}
      </p>

      <div className="flex flex-wrap gap-3 items-end bg-gray-50 border border-gray-200 rounded-lg p-3">
        <label className="flex flex-col gap-1 text-sm">
          <span>{ct("姓名 / 手机 / UUID", "Name / phone / UUID")}</span>
          <input
            className="border rounded px-2 py-1.5 min-w-[12rem]"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={ct("搜索", "Search")}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>{ct("起始日期", "From")}</span>
          <input
            type="date"
            className="border rounded px-2 py-1.5"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>{ct("结束日期", "To")}</span>
          <input
            type="date"
            className="border rounded px-2 py-1.5"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </label>
        <label className="flex items-center gap-2 text-sm pb-1">
          <input
            type="checkbox"
            checked={includeFollowUps}
            onChange={(e) => setIncludeFollowUps(e.target.checked)}
          />
          {ct("含追问", "Include follow-ups")}
        </label>
        <button
          type="button"
          disabled={loading}
          onClick={() => void fetchPage("replace")}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : ct("查询", "Search")}
        </button>
      </div>

      {loadError && <p className="text-sm text-red-600">{loadError}</p>}

      {grouped.length === 0 && !loading && (
        <p className="text-sm text-gray-500">{ct("暂无记录，请先查询。", "No records yet. Run a search.")}</p>
      )}

      <div className="space-y-6">
        {grouped.map((group) => (
          <section key={group.userId} className="border border-gray-200 rounded-lg overflow-hidden">
            <header className="bg-gray-100 px-3 py-2 text-sm font-medium flex justify-between">
              <span>{group.label}</span>
              <span className="text-gray-500">{group.rows.length}</span>
            </header>
            <ul className="divide-y divide-gray-100">
              {group.rows.map((row) => {
                const preview =
                  (row.analysis || row.error || "").trim().slice(0, 120) ||
                  ct("(无正文)", "(no text)");
                const isOpen = expanded[row.job_id];
                const mapsUrl =
                  row.latitude != null && row.longitude != null
                    ? `https://www.google.com/maps?q=${row.latitude},${row.longitude}`
                    : null;
                return (
                  <li key={row.job_id} className="px-3 py-2 text-sm space-y-1">
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-700">
                      <span>{formatLocalTime(row.created_at)}</span>
                      <span className="capitalize">{row.status}</span>
                      {row.route !== "analysis" && (
                        <span className="text-gray-500">{row.route}</span>
                      )}
                      {mapsUrl ? (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 underline"
                        >
                          {gpsCell(row, ct)}
                        </a>
                      ) : (
                        <span>{gpsCell(row, ct)}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="text-left text-gray-800 hover:text-emerald-800 w-full"
                      onClick={() =>
                        setExpanded((e) => ({ ...e, [row.job_id]: !e[row.job_id] }))
                      }
                    >
                      {isOpen ? row.analysis || row.error || preview : `${preview}${(row.analysis || "").length > 120 ? "…" : ""}`}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      {rows.length >= 200 && oldestCursor && (
        <button
          type="button"
          disabled={loading}
          className="text-sm text-emerald-700 underline disabled:opacity-50"
          onClick={() => void fetchPage("append", oldestCursor)}
        >
          {ct("加载更多", "Load more")}
        </button>
      )}
    </div>
  );
}

export default AiScanRecordsTab;
