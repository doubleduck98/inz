export interface ApiError {
  detail: string;
  status: number;
  title: string;
  traceId: string;
  type: string;
}
