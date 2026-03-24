export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

export const formatNumber = (num: number) => new Intl.NumberFormat("vi-VN").format(num);
