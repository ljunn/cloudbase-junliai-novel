import { appConfig } from "./config.mjs";

export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const authBaseUrl = `https://${appConfig.envId}.api.tcloudbasegateway.com`;

const getBearerToken = (req) => {
  const header = req.get("authorization");

  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }

  return header.slice("Bearer ".length).trim();
};

const normalizeGroups = (groups) =>
  Array.isArray(groups)
    ? groups
        .map((group) =>
          typeof group === "string"
            ? group
            : typeof group?.id === "string"
              ? group.id
              : "",
        )
        .filter(Boolean)
    : [];

const getDisplayName = (profile) =>
  String(
    profile.name ||
      profile.nickname ||
      profile.username ||
      profile.email ||
      profile.phone_number ||
      `作者 ${String(profile.sub || "").slice(-6)}`,
  ).trim();

export const resolveCurrentUser = async (req) => {
  const accessToken = getBearerToken(req);

  if (!accessToken) {
    throw new HttpError(401, "请先登录");
  }

  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };

  const deviceId = String(req.get("x-device-id") || "").trim();

  if (deviceId) {
    headers["x-device-id"] = deviceId;
  }

  const response = await fetch(`${authBaseUrl}/auth/v1/user/me`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new HttpError(401, "登录状态已失效，请重新登录");
  }

  const profile = await response.json();
  const uid = String(profile.sub || profile.uid || "").trim();

  if (!uid) {
    throw new HttpError(401, "当前登录身份无效");
  }

  return {
    accessToken,
    profile,
    uid,
    displayName: getDisplayName(profile),
    groups: normalizeGroups(profile.groups),
    isAdmin: Boolean(
      String(profile.internal_user_type || "")
        .trim()
        .toLowerCase() === "administrator",
    ),
  };
};
