export type MetricDef = {
  key: string;
  label: string;
  unit: string;
  kind: "gauge" | "rate";
  accent: string;
  hint: string;
  statistic?: string;
};

export const METRIC_DEFS: MetricDef[] = [
  {
    key: "website_response_time",
    label: "Website response time",
    unit: "ms",
    kind: "gauge",
    accent: "#a256bb",
    hint: "Measured from the live homepage probe.",
    statistic: "median",
  },
  {
    key: "api_latency",
    label: "API latency",
    unit: "ms",
    kind: "gauge",
    accent: "#004dff",
    hint: "Measured from real API request timings.",
    statistic: "p75",
  },
  {
    key: "database_response_time",
    label: "Database response time",
    unit: "ms",
    kind: "gauge",
    accent: "#008026",
    hint: "Measured from the live database probe.",
    statistic: "median",
  },
  {
    key: "api_request_volume",
    label: "API request volume",
    unit: "req/s",
    kind: "gauge",
    accent: "#ff8c00",
    hint: "Not yet instrumented — wire up request logging to populate this chart.",
    statistic: "rate",
  },
  {
    key: "api_error_rate",
    label: "API error rate",
    unit: "%",
    kind: "rate",
    accent: "#e40303",
    hint: "Not yet instrumented — wire up error tracking to populate this chart.",
    statistic: "rate",
  },
  {
    key: "auth_success_rate",
    label: "Authentication success rate",
    unit: "%",
    kind: "rate",
    accent: "#750787",
    hint: "Not yet instrumented — capture login outcomes to populate this chart.",
    statistic: "rate",
  },
];

export const METRIC_KEYS = METRIC_DEFS.map((m) => m.key);

export type MetricPoint = {
  value: number;
  recordedAt: Date;
  status: string;
};

export type MetricSeries = {
  def: MetricDef;
  points: MetricPoint[];
};
