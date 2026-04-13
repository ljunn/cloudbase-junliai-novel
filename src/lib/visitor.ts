const VISITOR_KEY = "junli-vip-visitor";
const DEVICE_KEY = "junli-vip-device-id";

export const getVisitorId = () => {
  const existing = window.localStorage.getItem(VISITOR_KEY);

  if (existing) {
    return existing;
  }

  const generated =
    "visitor-" +
    Math.random().toString(36).slice(2, 10) +
    "-" +
    Date.now().toString(36);

  window.localStorage.setItem(VISITOR_KEY, generated);
  return generated;
};

export const getDeviceId = () => {
  const existing = window.localStorage.getItem(DEVICE_KEY);

  if (existing) {
    return existing;
  }

  const generated =
    "device-" +
    Math.random().toString(36).slice(2, 10) +
    "-" +
    Date.now().toString(36);

  window.localStorage.setItem(DEVICE_KEY, generated);
  return generated;
};
