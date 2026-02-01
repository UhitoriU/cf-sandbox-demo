const out = document.querySelector("#out");

function show(obj) {
  out.textContent = typeof obj === "string" ? obj : JSON.stringify(obj, null, 2);
}

async function safeJson(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return await res.json();
  return { text: await res.text() };
}

async function run(req) {
  try {
    const res = await req;
    const data = await safeJson(res);
    show({
      url: res.url,
      status: res.status,
      headers: Object.fromEntries(res.headers.entries()),
      data,
    });
  } catch (e) {
    show({ error: String(e), stack: e?.stack });
  }
}

document.querySelector("#btnHello").onclick = () =>
  run(fetch("/api/hello"));

document.querySelector("#btnEcho").onclick = () =>
  run(
    fetch("/api/echo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ t: Date.now(), msg: "hello from browser" }),
    })
  );

document.querySelector("#btn500").onclick = () =>
  run(fetch("/api/hello?error=1"));

document.querySelector("#btnCapability").onclick = () =>
  run(fetch("/api/capability"));

document.querySelector("#btnInstance").onclick = () =>
  run(fetch("/api/instance"));

document.querySelector("#btnCounter").onclick = () =>
  run(fetch("/api/counter"));

document.querySelector("#btnCpu200").onclick = () =>
  run(fetch("/api/cpu?ms=200"));

document.querySelector("#btnCpu2000").onclick = () =>
  run(fetch("/api/cpu?ms=2000"));

document.querySelector("#btnOom64").onclick = () =>
  run(fetch("/api/oom?mb=64"));

document.querySelector("#btnFetch").onclic

document.querySelector("#btnFetchBurst").onclick = () =>
  run(fetch("/api/fetch_burst?url=https://example.com&n=20"));

document.querySelector("#btnPayload1m").onclick = async () => {
  const bytes = 1024 * 1024;
  const body = new Uint8Array(bytes);
  const r = await fetch("/api/payload?maxReadMb=10", {
    method: "POST",
    headers: { "content-type": "application/octet-stream" },
    body,
  });
  run(Promise.resolve(r));
};