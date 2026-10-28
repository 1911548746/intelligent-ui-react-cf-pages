export type RuntimeEnv = {
  LLM_BASE_URL?: string;
  LLM_MODEL?: string;
  LLM_API_KEY?: string;
};

export type PagesContext<Env = RuntimeEnv> = {
  request: Request;
  env: Env;
  params: Record<string, string | string[]>;
  waitUntil(promise: Promise<unknown>): void;
  next(): Promise<Response>;
  functionPath: string;
};

export function json(data: unknown, init?: ResponseInit) {
  return Response.json(data, init);
}
