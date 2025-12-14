import React, { useState, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Party, Medicine, InvoiceItem, Invoice } from '../types';
import { Plus, Search, Trash2, Save, Printer, ArrowLeft } from 'lucide-react';
import { formatCurrency, generateInvoiceNumber, calculateItemTotals } from '../utils';
import { useNavigate } from 'react-router-dom';

const Billing = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1); // 1: Select Party, 2: Add Items
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [partySearch, setPartySearch] = useState('');
  
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [medicineSearch, setMedicineSearch] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceNo, setInvoiceNo] = useState(generateInvoiceNumber());
  const [showPrintView, setShowPrintView] = useState(false);

  // Queries
  const parties = useLiveQuery(() => {
     if (!partySearch) return db.parties.toArray();
     return db.parties.filter(p => p.name.toLowerCase().includes(partySearch.toLowerCase())).toArray();
  }, [partySearch]);

  const medicines = useLiveQuery(() => {
    if (!medicineSearch) return [];
    return db.medicines.filter(m => m.name.toLowerCase().includes(medicineSearch.toLowerCase())).limit(10).toArray();
  }, [medicineSearch]);

  // Calculations
  const subTotal = items.reduce((sum, item) => sum + item.taxableValue, 0);
  const totalGst = items.reduce((sum, item) => sum + item.gstAmount, 0);
  const rawTotal = subTotal + totalGst;
  const roundOff = Math.round(rawTotal) - rawTotal;
  const grandTotal = Math.round(rawTotal);

  const addItem = (medicine: Medicine) => {
    const newItem: InvoiceItem = {
      ...medicine,
      qty: 1,
      freeQty: 0,
      discountPercent: 0,
      ...calculateItemTotals(medicine.rate, 1, medicine.gstPercent, 0)
    };
    setItems([...items, newItem]);
    setMedicineSearch('');
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: number) => {
    const newItems = [...items];
    const item = newItems[index];
    
    // @ts-ignore
    item[field] = value;

    // Recalculate totals for this item
    const totals = calculateItemTotals(item.rate, item.qty, item.gstPercent, item.discountPercent);
    item.taxableValue = totals.taxableValue;
    item.gstAmount = totals.gstAmount;
    item.totalAmount = totals.totalAmount;

    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSaveInvoice = async () => {
    if (!selectedParty || items.length === 0) return;

    const invoice: Invoice = {
      invoiceNo,
      date: invoiceDate,
      partyId: selectedParty.id!,
      partyName: selectedParty.name,
      items,
      subTotal,
      totalGst,
      totalAmount: rawTotal,
      roundOff,
      grandTotal
    };

    // Update stock
    for (const item of items) {
      if (item.id) {
         const currentMed = await db.medicines.get(item.id);
         if (currentMed) {
           await db.medicines.update(item.id, { stock: currentMed.stock - (item.qty + item.freeQty) });
         }
      }
    }

    await db.invoices.add(invoice);
    setShowPrintView(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleClosePrint = () => {
      setShowPrintView(false);
      navigate('/'); // Go back to dashboard or invoice list
  };

  if (showPrintView && selectedParty) {
    return (
      <div className="bg-white min-h-screen p-8 text-black">
        {/* Actions for Web View only */}
        <div className="no-print fixed top-4 right-4 flex gap-4 z-50">
           <button onClick={handlePrint} className="bg-teal-600 text-white px-6 py-2 rounded-lg shadow hover:bg-teal-700 flex items-center gap-2">
             <Printer size={20}/> Print Invoice
           </button>
           <button onClick={handleClosePrint} className="bg-gray-800 text-white px-6 py-2 rounded-lg shadow hover:bg-gray-900">
             Close
           </button>
        </div>

        {/* Invoice Paper Design */}
        <div className="max-w-[210mm] mx-auto bg-white p-[10mm] shadow-none print:shadow-none print:w-full">
           {/* Header */}
           <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
              <h1 className="text-3xl font-bold font-serif uppercase tracking-wider">Gopi Distributors</h1>
              <p className="text-sm text-gray-600">Wholesale Chemist & Druggist</p>
              <p className="text-xs">123, Pharma Market, Main Road, City - 400001, Maharashtra</p>
              <p className="text-xs">Mob: +91 98765 43210 | Email: billing@gopidistributors.com</p>
              <p className="text-xs font-bold mt-1">DL No: 20B/12345, 21B/12345 | GSTIN: 27ABCDE1234F1Z5</p>
           </div>

           {/* Party & Invoice Details */}
           <div className="flex justify-between mb-6 text-sm border-b border-gray-300 pb-4">
              <div className="w-1/2 pr-4">
                 <p className="font-bold text-gray-500 uppercase text-xs">Billed To:</p>
                 <p className="font-bold text-lg">{selectedParty.name}</p>
                 <p className="whitespace-pre-wrap">{selectedParty.address}</p>
                 <p>GSTIN: {selectedParty.gstin}</p>
                 <p>DL No: {selectedParty.dlNo}</p>
              </div>
              <div className="w-1/2 pl-4 text-right">
                 <div className="flex justify-end gap-2 mb-1">
                    <span className="font-bold text-gray-500">Invoice No:</span>
                    <span className="font-mono font-bold">{invoiceNo}</span>
                 </div>
                 <div className="flex justify-end gap-2 mb-1">
                    <span className="font-bold text-gray-500">Date:</span>
                    <span>{new Date(invoiceDate).toLocaleDateString('en-IN')}</span>
                 </div>
                 <div className="flex justify-end gap-2">
                    <span className="font-bold text-gray-500">State:</span>
                    <span>Maharashtra (27)</span>
                 </div>
              </div>
           </div>

           {/* Table */}
           <table className="w-full text-xs text-left mb-6">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="py-2">#</th>
                  <th className="py-2">Product Name</th>
                  <th className="py-2">HSN</th>
                  <th className="py-2">Batch</th>
                  <th className="py-2">Exp</th>
                  <th className="py-2 text-right">Qty</th>
                  <th className="py-2 text-right">Free</th>
                  <th className="py-2 text-right">MRP</th>
                  <th className="py-2 text-right">Rate</th>
                  <th className="py-2 text-right">Disc%</th>
                  <th className="py-2 text-right">GST%</th>
                  <th className="py-2 text-right">Taxable</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map((item, idx) => (
                   <tr key={idx}>
                      <td className="py-1">{idx + 1}</td>
                      <td className="py-1 font-semibold">{item.name}</td>
                      <td className="py-1">{item.hsn}</td>
                      <td className="py-1">{item.batchNo}</td>
                      <td className="py-1">{item.expiryDate}</td>
                      <td className="py-1 text-right">{item.qty}</td>
                      <td className="py-1 text-right">{item.freeQty > 0 ? item.freeQty : '-'}</td>
                      <td className="py-1 text-right">{item.mrp}</td>
                      <td className="py-1 text-right">{item.rate}</td>
                      <td className="py-1 text-right">{item.discountPercent > 0 ? item.discountPercent : '-'}</td>
                      <td className="py-1 text-right">{item.gstPercent}</td>
                      <td className="py-1 text-right">{item.taxableValue.toFixed(2)}</td>
                      <td className="py-1 text-right font-medium">{item.totalAmount.toFixed(2)}</td>
                   </tr>
                ))}
              </tbody>
           </table>

           {/* Totals Section */}
           <div className="flex border-t-2 border-black pt-4 print-break-inside-avoid">
              <div className="w-2/3 pr-8 text-xs">
                 <p className="font-bold mb-1">Terms & Conditions:</p>
                 <ul className="list-disc pl-4 space-y-1 text-gray-600">
                   <li>Goods once sold will not be taken back.</li>
                   <li>Interest @ 18% p.a. will be charged if bill is not paid within due date.</li>
                   <li>Subject to local jurisdiction.</li>
                 </ul>
                 <div className="mt-8">
                    <p className="font-bold">Amount in Words:</p>
                    <p className="italic text-gray-700 capitalize">
                       {/* Simple placeholder, complex number to words lib is too big for this snippet */}
                       (Check Grand Total)
                    </p>
                 </div>
              </div>
              <div className="w-1/3 bg-gray-50 p-4 rounded-lg print:bg-transparent">
                 <div className="flex justify-between mb-1 text-sm">
                   <span>Sub Total:</span>
                   <span>{subTotal.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between mb-1 text-sm">
                   <span>Total GST:</span>
                   <span>{totalGst.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between mb-1 text-sm">
                   <span>Round Off:</span>
                   <span>{roundOff.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between mt-2 pt-2 border-t border-black text-xl font-bold">
                   <span>Grand Total:</span>
                   <span>{formatCurrency(grandTotal)}</span>
                 </div>
              </div>
           </div>

           {/* Footer Signatures */}
           <div className="flex justify-between mt-12 pt-8 print-break-inside-avoid">
              <div className="text-center">
                 <p className="border-t border-gray-400 px-8 pt-1 text-xs">Receiver's Signature</p>
              </div>
              <div className="text-center">
                 <p className="font-bold text-sm mb-8">For Gopi Distributors</p>
                 <p className="border-t border-gray-400 px-8 pt-1 text-xs">Authorized Signatory</p>
              </div>
           </div>
           
           <div className="text-center text-[10px] text-gray-400 mt-8 print:fixed print:bottom-4 print:left-0 print:w-full">
              Created By Yash K Pathak
           </div>
        </div>
      </div>
    );
  }

  // --- Main Billing UI ---
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-screen flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-2xl font-bold text-gray-900">New Invoice</h2>
           <p className="text-gray-500 text-sm">Create a professional GST invoice</p>
        </div>
        <div className="flex gap-2">
           <span className="px-3 py-1 bg-gray-100 rounded text-sm font-mono">{invoiceDate}</span>
           <span className="px-3 py-1 bg-gray-100 rounded text-sm font-mono font-bold">{invoiceNo}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
        {/* Left Side: Party & Item Selection */}
        <div className="w-full md:w-2/3 flex flex-col gap-4 overflow-y-auto pr-2">
            
            {/* Party Selector */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
               {selectedParty ? (
                 <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-teal-700">{selectedParty.name}</h3>
                      <p className="text-sm text-gray-600">{selectedParty.address}</p>
                      <p className="text-xs mt-1 text-gray-500">GSTIN: {selectedParty.gstin}</p>
                    </div>
                    <button onClick={() => setSelectedParty(null)} className="text-sm text-red-500 hover:underline">Change</button>
                 </div>
               ) : (
                 <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Party / Customer</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                      <input 
                        type="text"
                        placeholder="Search party..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                        value={partySearch}
                        onChange={e => setPartySearch(e.target.value)}
                      />
                    </div>
                    {partySearch && (
                      <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-xl z-20 max-h-48 overflow-y-auto">
                        {parties?.map(p => (
                          <div 
                            key={p.id} 
                            onClick={() => { setSelectedParty(p); setPartySearch(''); }}
                            className="p-3 hover:bg-teal-50 cursor-pointer border-b border-gray-50 last:border-none"
                          >
                             <div className="font-medium">{p.name}</div>
                             <div className="text-xs text-gray-500">{p.gstin}</div>
                          </div>
                        ))}
                      </div>
                    )}
                 </div>
               )}
            </div>

            {/* Item Entry */}
            <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex-1 ${!selectedParty ? 'opacity-50 pointer-events-none' : ''}`}>
               <h3 className="font-bold text-gray-800 mb-4">Add Medicines</h3>
               <div className="relative mb-6">
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input 
                    type="text"
                    placeholder="Search medicines to add..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                    value={medicineSearch}
                    onChange={e => setMedicineSearch(e.target.value)}
                  />
                  {medicineSearch && medicines && medicines.length > 0 && (
                      <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-xl z-20 max-h-60 overflow-y-auto">
                        {medicines.map(m => (
                          <div 
                            key={m.id} 
                            onClick={() => addItem(m)}
                            className="p-3 hover:bg-teal-50 cursor-pointer border-b border-gray-50 last:border-none flex justify-between items-center"
                          >
                             <div>
                               <div className="font-medium">{m.name}</div>
                               <div className="text-xs text-gray-500">Batch: {m.batchNo} | Exp: {m.expiryDate}</div>
                             </div>
                             <div className="text-right">
                               <div className="font-bold text-teal-700">{formatCurrency(m.rate)}</div>
                               <div className="text-xs text-gray-500">Stock: {m.stock}</div>
                             </div>
                          </div>
                        ))}
                      </div>
                  )}
               </div>

               {/* Items Table */}
               <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                   <thead className="text-xs text-gray-500 bg-gray-50 uppercase">
                     <tr>
                       <th className="px-2 py-2">Item</th>
                       <th className="px-2 py-2 w-16">Qty</th>
                       <th className="px-2 py-2 w-16">Free</th>
                       <th className="px-2 py-2 w-20">Rate</th>
                       <th className="px-2 py-2 w-16">Disc%</th>
                       <th className="px-2 py-2 w-16">Tax</th>
                       <th className="px-2 py-2 text-right">Total</th>
                       <th className="px-2 py-2"></th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                     {items.map((item, idx) => (
                       <tr key={idx}>
                         <td className="px-2 py-2">
                           <div className="font-medium">{item.name}</div>
                           <div className="text-[10px] text-gray-400">{item.batchNo}</div>
                         </td>
                         <td className="px-2 py-2">
                           <input 
                             type="number" min="1" 
                             className="w-full border rounded px-1 py-1 text-center"
                             value={item.qty}
                             onChange={e => updateItem(idx, 'qty', parseInt(e.target.value) || 0)}
                           />
                         </td>
                         <td className="px-2 py-2">
                           <input 
                             type="number" min="0" 
                             className="w-full border rounded px-1 py-1 text-center"
                             value={item.freeQty}
                             onChange={e => updateItem(idx, 'freeQty', parseInt(e.target.value) || 0)}
                           />
                         </td>
                         <td className="px-2 py-2">
                           <input 
                             type="number" min="0" step="0.01"
                             className="w-full border rounded px-1 py-1 text-center"
                             value={item.rate}
                             onChange={e => updateItem(idx, 'rate', parseFloat(e.target.value) || 0)}
                           />
                         </td>
                         <td className="px-2 py-2">
                           <input 
                             type="number" min="0" max="100"
                             className="w-full border rounded px-1 py-1 text-center"
                             value={item.discountPercent}
                             onChange={e => updateItem(idx, 'discountPercent', parseFloat(e.target.value) || 0)}
                           />
                         </td>
                         <td className="px-2 py-2 text-center text-xs text-gray-500">
                           {item.gstPercent}%
                         </td>
                         <td className="px-2 py-2 text-right font-medium">
                           {item.totalAmount.toFixed(2)}
                         </td>
                         <td className="px-2 py-2 text-center">
                            <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
                 {items.length === 0 && (
                   <div className="text-center py-8 text-gray-400 text-sm">No items added yet</div>
                 )}
               </div>
            </div>
        </div>

        {/* Right Side: Summary & Actions */}
        <div className="w-full md:w-1/3 flex flex-col gap-4">
           <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
              <h3 className="text-lg font-semibold mb-4 border-b border-slate-700 pb-2">Invoice Summary</h3>
              <div className="space-y-3">
                 <div className="flex justify-between text-slate-300">
                   <span>Total Items</span>
                   <span>{items.length}</span>
                 </div>
                 <div className="flex justify-between text-slate-300">
                   <span>Sub Total (Taxable)</span>
                   <span>{formatCurrency(subTotal)}</span>
                 </div>
                 <div className="flex justify-between text-slate-300">
                   <span>Total GST</span>
                   <span>{formatCurrency(totalGst)}</span>
                 </div>
                 <div className="flex justify-between text-slate-300">
                   <span>Round Off</span>
                   <span>{roundOff.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between text-2xl font-bold pt-4 border-t border-slate-700 text-teal-400">
                   <span>Grand Total</span>
                   <span>{formatCurrency(grandTotal)}</span>
                 </div>
              </div>

              <button 
                onClick={handleSaveInvoice}
                disabled={items.length === 0 || !selectedParty}
                className="w-full mt-8 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-teal-500/20"
              >
                <Save size={20} /> Save & Print Invoice
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;