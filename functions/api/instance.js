// 全局：同一个 isolate/实例内会保留（直到被回收）
const instanceId =
  (globalThis.__instanceId ??= crypto.randomUUID?.() ?? String(Math.random()));
const startedAt =
  (globalThis.__startedAt ??= new Date().toISOString());

export async function onRequest(context) {
  return Response.json({
    ok: true,
    route: "/api/instance",
    instanceId,
    startedAt,
    now: new Date().toISOString(),
    colo: context.request.cf?.colo ?? null,
    tip: "If instanceId changes across requests, you hit a different isolate or a cold start.",
  });
}
