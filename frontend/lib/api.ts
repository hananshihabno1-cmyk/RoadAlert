import { DashboardStats, RoadReport } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request failed (${res.status}): ${text || res.statusText}`);
  }
  return res.json();
}

function normalizeReport(r: any): RoadReport {
  return { ...r, status: r.status || "pending" };
}

export async function submitReport(params: {
  image: File;
  latitude: number;
  longitude: number;
}): Promise<RoadReport | { detected: false; message: string }> {
  const form = new FormData();
  form.append("image", params.image);
  form.append("latitude", String(params.latitude));
  form.append("longitude", String(params.longitude));

  // Backend endpoint: POST /reports/upload
  const res = await fetch(`${API_BASE}/reports/upload`, {
    method: "POST",
    body: form,
  });
  const data = await handle<any>(res);
  if (data && "detected" in data && data.detected === false) {
    return data;
  }
  return normalizeReport(data);
}

export async function fetchReports(): Promise<RoadReport[]> {
  // Backend endpoint: GET /reports/
  const res = await fetch(`${API_BASE}/reports/`, { cache: "no-store" });
  const list = await handle<any[]>(res);
  return list.map(normalizeReport);
}

export async function fetchReportById(id: string): Promise<RoadReport | null> {
  // Backend endpoint: GET /reports/{id}
  try {
    const res = await fetch(`${API_BASE}/reports/${id}`, { cache: "no-store" });
    if (res.ok) {
      const data = await handle<any>(res);
      return normalizeReport(data);
    }
  } catch {
    // swallow and fall through
  }

  // Fallback: fetch full list and find by id
  const all = await fetchReports();
  return all.find((r) => r.id === id) ?? null;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  // Backend endpoint: GET /dashboard
  const res = await fetch(`${API_BASE}/dashboard`, { cache: "no-store" });
  return handle<DashboardStats>(res);
}

export async function verifyRepair(params: {
  reportId: string;
  afterImage: File;
}): Promise<{ verified: boolean; status: string }> {
  const form = new FormData();
  form.append("report_id", params.reportId);
  form.append("after_image", params.afterImage);

  const res = await fetch(`${API_BASE}/verify`, {
    method: "POST",
    body: form,
  });
  return handle<{ verified: boolean; status: string }>(res);
}
