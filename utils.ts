export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};

export const generateInvoiceNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${year}${month}-${random}`;
};

export const calculateItemTotals = (
  rate: number, 
  qty: number, 
  gstPercent: number, 
  discountPercent: number
) => {
  const baseAmount = rate * qty;
  const discountAmount = baseAmount * (discountPercent / 100);
  const taxableValue = baseAmount - discountAmount;
  const gstAmount = taxableValue * (gstPercent / 100);
  const totalAmount = taxableValue + gstAmount;

  return {
    taxableValue: Number(taxableValue.toFixed(2)),
    gstAmount: Number(gstAmount.toFixed(2)),
    totalAmount: Number(totalAmount.toFixed(2))
  };
};