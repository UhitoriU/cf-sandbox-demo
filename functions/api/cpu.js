export async function onRequest(context) {
  const url = new URL(context.request.url);
  const ms = Math.max(0, Math.min(15000, Number(url.searchParams.get("ms") ?? "200"))); // 上限 15s 防止你误点

  const start = Date.now();
  // busy loop
  while (Date.now() - start < ms) {
    // 做一点点计算避免被优化
    Math.imul(1234567, 7654321);
  }
  const elapsed = Date.now() - start;

  return Response.json({
    ok: true,
    route: "/api/cpu",
    requestedMs: ms,
    elapsedMs: elapsed,
    now: new Date().toISOString(),
    colo: context.request.cf?.colo ?? null,
  });
}
