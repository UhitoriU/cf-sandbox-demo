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

  const chunks = clampInt(url.searchParams.get("chunks"), 1, 200000, 50);
  const iter = clampInt(url.searchParams.get("iter"), 1000, 5_000_000, 30_000);

  // 防误操作：限制总工作量
  const MAX_WORK = 2e11; // 可按需要调整
  if (chunks * iter > MAX_WORK) {
    return Response.json(
      { ok: false, error: "work too large", chunks, iter, maxWork: MAX_WORK },
      { status: 400 }
    );
  }

  const t0 = performance.now();
  let acc = 0;

  for (let c = 0; c < chunks; c++) {
    acc ^= burn(iter);
    // 让出事件循环，避免被当成死循环
    if ((c & 31) === 0) await Promise.resolve();
  }

  const t1 = performance.now();

  return Response.json({
    ok: true,
    route: "/api/cpu",
    mode: "workload",
    chunks,
    iter,
    elapsedMs: Math.round((t1 - t0) * 1000) / 1000,
    acc,
    colo: context.request.cf?.colo ?? null,
    note: "Increase chunks/iter until you hit 503. Use MAX_WORK to prevent accidental overload.",
  });
}
