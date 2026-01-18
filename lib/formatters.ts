const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("id-ID");

export const buildBudgetValue = (rawValue: string) => {
  const digitsOnly = rawValue.replace(/\D/g, "");
  if (!digitsOnly) {
    return { formatted: "", numeric: 0 };
  }
  const numeric = Number.parseInt(digitsOnly, 10);
  return {
    formatted: currencyFormatter.format(numeric),
    numeric,
  };
};

export const formatIdrValue = (value: string) => {
  const digitsOnly = value.replace(/\D/g, "");
  if (!digitsOnly) {
    return value;
  }
  const numeric = Number.parseInt(digitsOnly, 10);
  return currencyFormatter.format(numeric);
};

export const buildSalaryValue = (rawValue: string) => {
  const digitsOnly = rawValue.replace(/\D/g, "");
  if (!digitsOnly) {
    return { formatted: "", numeric: 0 };
  }
  const numeric = Number.parseInt(digitsOnly, 10);
  return {
    formatted: numberFormatter.format(numeric),
    numeric,
  };
};

export const formatCurrency = (value: number) =>
  currencyFormatter.format(value);
