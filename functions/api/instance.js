// 注意：global scope 只做常量/简单赋值，不用随机/不设 timeout/不 fetch
globalThis.__bootTs ??= Date.now();      // Date.now 在这里通常没问题；若你想更稳，也可以挪到 handler
globalThis.__seq ??= 0;

export async function onRequest(context) {
  // 如果你担心 Date.now 也被算作不允许，可把 __bootTs 初始化也放到这里
  if (!globalThis.__bootTs) globalThis.__bootTs = Date.now();

  globalThis.__seq += 1;

  // 不用 random：用 bootTs + seq 组成“实例内稳定”的标识
  const instanceId = `boot-${globalThis.__bootTs}-seq-${globalThis.__seq}`;

  return Response.json({
    ok: true,
    route: "/api/instance",
    instanceId,
    bootTs: globalThis.__bootTs,
    hitSeq: globalThis.__seq,
    now: new Date().toISOString(),
    colo: context.request.cf?.colo ?? null,
    tip: "If bootTs changes, you hit a new isolate (cold start / different instance).",
  });
}
