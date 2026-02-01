function clampInt(n, min, max, fallback) {
  const x = Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(x)));
}

export async function onRequest(context) {
  const url = new URL(context.request.url);

  const kb = clampInt(url.searchParams.get("kb"), 1, 4096, 256);     // 数据大小
  const rounds = clampInt(url.searchParams.get("rounds"), 1, 200, 5); // hash 次数

  const data = new Uint8Array(kb * 1024);
  // 不用 random，避免 global/运行时限制：填充固定模式
  for (let i = 0; i < data.length; i += 4096) data[i] = (i / 4096) & 255;

  const t0 = Date.now();
  let last = null;

  for (let r = 0; r < rounds; r++) {
    last = await crypto.subtle.digest("SHA-256", data);
    await Promise.resolve();
  }

  const t1 = Date.now();
  return Response.json({
    ok: true,
    route: "/api/cpu_hash",
    kb,
    rounds,
    elapsedMs: t1 - t0,
    lastDigestBytes: last ? last.byteLength : null,
    colo: context.request.cf?.colo ?? null,
    note: "Increase rounds/kb until you hit 503 to find practical crypto/CPU budget.",
  });
}
