export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("zh-CN").format(value);

export const formatSignedNumber = (value: number) => {
  const normalized = Number(value || 0);

  if (normalized === 0) {
    return "0";
  }

  return `${normalized > 0 ? "+" : ""}${formatNumber(normalized)}`;
};

export const formatDateTime = (value: string | null) => {
  if (!value) {
    return "暂无记录";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};
