function safeTypeof(name) {
  try {
    // eslint-disable-next-line no-eval
    return typeof eval(name);
  } catch {
    return "unavailable";
  }
}

function tryRequire(moduleName) {
  try {
    // 注意：require 可能不存在，这里用 eval 避免打包器静态分析
    // eslint-disable-next-line no-eval
    const req = eval("typeof require !== 'undefined' ? require : undefined");
    if (!req) return { ok: false, reason: "require is undefined" };
    req(moduleName);
    return { ok: true, note: "require succeeded (unexpected in most CF runtimes)" };
  } catch (e) {
    return { ok: false, error: { name: e?.name, message: e?.message } };
  }
}

export async function onRequest(context) {
  const result = {
    runtime: "cloudflare-pages-functions",
    now: new Date().toISOString(),
    webApis: {
      hasFetch: typeof fetch === "function",
      hasCrypto: typeof crypto !== "undefined",
      hasSubtle: typeof crypto?.subtle !== "undefined",
    },
    nodeLike: {
      typeofProcess: safeTypeof("process"),
      typeofRequire: safeTypeof("require"),
      processEnvKeys: null,
      requireNodeFs: null,
      requireChildProcess: null,
    },
    cf: {
      colo: context.request.cf?.colo ?? null,
      country: context.request.cf?.country ?? null,
      tlsVersion: context.request.cf?.tlsVersion ?? null,
    },
  };

  // process.env keys
  try {
    // eslint-disable-next-line no-eval
    const p = eval("typeof process !== 'undefined' ? process : undefined");
    result.nodeLike.processEnvKeys =
      p?.env ? Object.keys(p.env).slice(0, 20) : null;
  } catch (e) {
    result.nodeLike.processEnvKeys = { error: String(e) };
  }

  // 真正负面测试：require node:fs / node:child_process（预期失败）
  result.nodeLike.requireNodeFs = tryRequire("node:fs");
  result.nodeLike.requireChildProcess = tryRequire("node:child_process");

  return Response.json(result);
}
