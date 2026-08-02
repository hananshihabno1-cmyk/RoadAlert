export type Severity = "Low" | "Medium" | "High" | "low" | "medium" | "high" | "unclear";

export type DamageType = string; // backend returns YOLO class names e.g. "pothole", "crack"

export type ReportStatus = "pending" | "in_review" | "repairing" | "completed";

export interface RoadReport {
  id: string;
  image_url: string;
  latitude: number;
  longitude: number;
  damage_type: DamageType;
  severity: Severity;
  confidence: number;
  priority_score: number;
  reported_by?: string | null;
  created_at: string;

  // Extended fields — present only when added by the database teammate
  // Defaults applied in components to avoid runtime crashes
  status: ReportStatus;
  near_school?: boolean | null;
  near_hospital?: boolean | null;
  main_road?: boolean | null;
  is_duplicate?: boolean | null;
  after_image?: string | null;
}

export interface DashboardStats {
  total_reports: number;
  high_severity: number;
  pending: number;
  completed: number;
  avg_priority: number;
}
