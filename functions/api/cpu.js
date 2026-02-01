function clampInt(n, min, max, fallback) {
  const x = Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(x)));
}

function burn(iterations) {
  let x = 0;
  for (let i = 0; i < iterations; i++) {
    x = (x + Math.imul(i ^ 0x9e3779b1, 2654435761)) | 0;
  }
  return x;
}

export async function onRequest(context) {
  const url = new URL(context.request.url);

  // 关键：用“工作量”而不是“目标毫秒”
  const chunks = clampInt(url.searchParams.get("chunks"), 1, 2000, 50);
  const iter = clampInt(url.searchParams.get("iter"), 1000, 2_000_000, 30_000);

  const t0 = Date.now();
  let acc = 0;

  // 每个 chunk 做一点计算，并 yield 一下（防止被当成死循环）
  for (let c = 0; c < chunks; c++) {
    acc ^= burn(iter);
    await Promise.resolve();
  }

  const t1 = Date.now();
  return Response.json({
    ok: true,
    route: "/api/cpu",
    mode: "workload",
    chunks,
    iter,
    elapsedMs: t1 - t0,
    acc,
    colo: context.request.cf?.colo ?? null,
    note: "Increase chunks/iter until you hit 503 to find practical CPU budget.",
  });
}
