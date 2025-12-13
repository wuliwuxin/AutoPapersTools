import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const hostname = req.hostname;
  const isLocal = LOCAL_HOSTS.has(hostname) || hostname === "127.0.0.1" || hostname === "::1";
  const isSecure = isSecureRequest(req);

  console.log('[Cookies] Setting cookie options:', {
    hostname,
    isLocal,
    isSecure,
    protocol: req.protocol,
  });

  return {
    httpOnly: true,
    path: "/",
    // 本地开发使用 lax，生产环境使用 none
    sameSite: isLocal ? "lax" : "none",
    // 本地开发不需要 secure，生产环境需要
    secure: isLocal ? false : isSecure,
  };
}
