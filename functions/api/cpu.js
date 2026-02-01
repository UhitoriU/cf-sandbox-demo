function clamp(n, min, max, fallback) {
  const x = Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.max(min, Math.min(max, x));
}

function burnSomeCpu(iterations) {
  // 做一点不可被完全优化的计算
  let x = 0;
  for (let i = 0; i < iterations; i++) {
    x = (x + Math.imul(i ^ 0x9e3779b1, 2654435761)) | 0;
  }
  return x;
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const ms = clamp(url.searchParams.get("ms"), 1, 10000, 200); // 最多 10s
  const chunkMs = clamp(url.searchParams.get("chunkMs"), 5, 50, 10); // 每段 10ms 左右
  const iterPerChunk = clamp(url.searchParams.get("iter"), 5_000, 500_000, 80_000);

  const start = Date.now();
  let chunks = 0;
  let acc = 0;

  while (Date.now() - start < ms) {
    acc ^= burnSomeCpu(iterPerChunk);
    chunks += 1;

    // 关键：让出事件循环，避免被当成“无休止占用 CPU”
    await Promise.resolve();
  }

  const elapsed = Date.now() - start;

  return Response.json({
    ok: true,
    route: "/api/cpu",
    mode: "yielding",
    requestedMs: ms,
    elapsedMs: elapsed,
    chunks,
    acc,
    now: new Date().toISOString(),
    colo: context.request.cf?.colo ?? null,
    note: "This probe yields to the event loop to better approximate realistic CPU work.",
  });
}
