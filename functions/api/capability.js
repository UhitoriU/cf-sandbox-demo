function errToObj(e) {
  return { name: e?.name, message: e?.message, stack: e?.stack };
}

export async function onRequest(context) {
  const result = {
    runtime: "cloudflare-pages-functions",
    hasProcess: typeof process !== "undefined",
    processEnvKeys: null,
    fsImport: null,
    childProcessImport: null,
    now: new Date().toISOString(),
  };

  // process.env（在 CF 通常不可用/不可读）
  try {
    if (typeof process !== "undefined" && process?.env) {
      result.processEnvKeys = Object.keys(process.env).slice(0, 20);
    } else {
      result.processEnvKeys = null;
    }
  } catch (e) {
    result.processEnvKeys = { error: errToObj(e) };
  }

  // 尝试导入 node 模块（应失败）
  try {
    await import("node:fs");
    result.fsImport = "unexpectedly succeeded";
  } catch (e) {
    result.fsImport = { expectedFail: true, error: errToObj(e) };
  }

  try {
    await import("node:child_process");
    result.childProcessImport = "unexpectedly succeeded";
  } catch (e) {
    result.childProcessImport = { expectedFail: true, error: errToObj(e) };
  }

  // 简单确认 Web 标准 API
  result.webApis = {
    hasFetch: typeof fetch === "function",
    hasCrypto: typeof crypto !== "undefined",
    hasSubtle: typeof crypto?.subtle !== "undefined",
  };

  // CF request.cf 观察
  result.cf = {
    colo: context.request.cf?.colo ?? null,
    country: context.request.cf?.country ?? null,
    tlsVersion: context.request.cf?.tlsVersion ?? null,
  };

  return Response.json(result);
}
