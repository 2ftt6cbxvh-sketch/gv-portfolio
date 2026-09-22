/**
 * Deterministic Client Hardware & Browser Fingerprinting
 * Combines WebGL GPU Unmasked Renderer, Canvas Antialiasing Signature,
 * Screen Metrics, CPU Concurrency, and Hardware Attributes into a SHA-256 hash.
 * 
 * Immune to:
 * - VPN switching (VPN does not alter GPU, screen, or hardware concurrency)
 * - Incognito / Private browsing (Canvas, WebGL, and screen metrics remain identical)
 */

export async function getDeviceFingerprint() {
  if (typeof window === "undefined") return "server_device";

  try {
    const components = [];

    // 1. Hardware Concurrency & Screen Resolution
    components.push(
      screen.width || 0,
      screen.height || 0,
      screen.colorDepth || 24,
      window.devicePixelRatio || 1,
      navigator.hardwareConcurrency || 4,
      navigator.maxTouchPoints || 0
    );

    // 2. OS Platform, Timezone, Language
    components.push(
      navigator.platform || "unknown",
      Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
      navigator.language || "en"
    );

    // 3. WebGL GPU Unmasked Renderer & Vendor (Unchanged by VPN or Incognito)
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (gl) {
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
          components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
        }
      }
    } catch (_) {}

    // 4. Canvas 2D Text Drawing Signature (Sub-pixel font antialiasing differs by OS & GPU)
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 240;
      canvas.height = 60;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial', sans-serif";
        ctx.fillStyle = "#f60";
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = "#069";
        ctx.fillText("gv_admin_security_shield_v8", 2, 15);
        ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
        ctx.fillText("gv_admin_security_shield_v8", 4, 17);
        components.push(canvas.toDataURL());
      }
    } catch (_) {}

    // 5. Generate deterministic SHA-256 hash
    const rawString = components.join("###");
    const msgUint8 = new TextEncoder().encode(rawString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    return `df_${hashHex.slice(0, 32)}`;
  } catch (err) {
    return "df_fallback_" + (typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 24) : "unknown");
  }
}
