export const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const calculateQuotationTotals = (items = []) => {
  const subtotal = items.reduce((acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0);
  const gstRate = 0.18;
  const gstAmount = Math.round(subtotal * gstRate);
  const total = subtotal + gstAmount;

  return {
    subtotal,
    gstAmount,
    total,
    itemCount: items.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0)
  };
};
