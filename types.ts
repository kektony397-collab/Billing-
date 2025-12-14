export interface Medicine {
  id?: number;
  name: string;
  packing: string;
  batchNo: string;
  expiryDate: string; // MM/YY or YYYY-MM-DD
  hsn: string;
  manufacturer: string;
  mrp: number;
  rate: number; // Wholesale Rate
  gstPercent: number;
  stock: number;
}

export interface Party {
  id?: number;
  name: string;
  address: string;
  gstin: string;
  dlNo: string; // Drug License No
  mobile: string;
  email?: string;
  state: string;
}

export interface InvoiceItem extends Medicine {
  qty: number;
  freeQty: number;
  discountPercent: number;
  taxableValue: number;
  gstAmount: number;
  totalAmount: number;
}

export interface Invoice {
  id?: number;
  invoiceNo: string;
  date: string;
  partyId: number;
  partyName: string; // Denormalized for easier display
  items: InvoiceItem[];
  subTotal: number;
  totalGst: number;
  totalAmount: number;
  roundOff: number;
  grandTotal: number;
}

export const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal", "Delhi"
];