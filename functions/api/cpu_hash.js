function clampInt(n, min, max, fallback) {
  const x = Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(x)));
}

export async function onRequest(context) {
  const url = new URL(context.request.url);

  const kb = clampInt(url.searchParams.get("kb"), 1, 16384, 256);      // up to 16MB
  const rounds = clampInt(url.searchParams.get("rounds"), 1, 2000, 5); // up to 2000

  // 防误操作：限制总 hash 量
  const MAX_TOTAL = 20_000_000; // kb * rounds
  if (kb * rounds > MAX_TOTAL) {
    return Response.json(
      { ok: false, error: "work too large", kb, rounds, maxTotal: MAX_TOTAL },
      { status: 400 }
    );
  }

  const data = new Uint8Array(kb * 1024);
  for (let i = 0; i < data.length; i += 4096) data[i] = (i / 4096) & 255;

  const t0 = performance.now();
  let last = null;

  for (let r = 0; r < rounds; r++) {
    last = await crypto.subtle.digest("SHA-256", data);
    if ((r & 31) === 0) await Promise.resolve();
  }

  const t1 = performance.now();

  return Response.json({
    ok: true,
    route: "/api/cpu_hash",
    kb,
    rounds,
    elapsedMs: Math.round((t1 - t0) * 1000) / 1000,
    lastDigestBytes: last ? last.byteLength : null,
    colo: context.request.cf?.colo ?? null,
    note: "Increase rounds/kb until you hit 503. MAX_TOTAL prevents accidental overload.",
  });
}
