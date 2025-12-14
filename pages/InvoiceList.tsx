import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { formatCurrency } from '../utils';
import { Search, Eye, FileText } from 'lucide-react';

const InvoiceList = () => {
  const [search, setSearch] = useState('');
  
  const invoices = useLiveQuery(async () => {
    let collection = db.invoices.orderBy('date').reverse();
    if (search) {
      const lowerSearch = search.toLowerCase();
      // Simple filtering in memory for now as Dexie complex query is verbose for this example
      const all = await collection.toArray();
      return all.filter(inv => 
        inv.invoiceNo.toLowerCase().includes(lowerSearch) || 
        inv.partyName.toLowerCase().includes(lowerSearch)
      );
    }
    return await collection.toArray();
  }, [search]);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-3xl font-bold text-gray-900">Invoice History</h2>
           <p className="text-gray-500">View and reprint past invoices</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Invoice No or Party Name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-100 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Invoice No</th>
                <th className="px-6 py-3">Party Name</th>
                <th className="px-6 py-3 text-right">Items</th>
                <th className="px-6 py-3 text-right">Total Amount</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices?.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3">{new Date(inv.date).toLocaleDateString('en-IN')}</td>
                  <td className="px-6 py-3 font-medium text-teal-700">{inv.invoiceNo}</td>
                  <td className="px-6 py-3 font-medium text-gray-900">{inv.partyName}</td>
                  <td className="px-6 py-3 text-right">{inv.items.length}</td>
                  <td className="px-6 py-3 text-right font-bold text-gray-900">{formatCurrency(inv.grandTotal)}</td>
                  <td className="px-6 py-3 text-right">
                    {/* In a real app, this would open the print view again. For now, simple placeholder */}
                    <button className="text-gray-500 hover:text-teal-600 flex items-center justify-end gap-1 w-full">
                        <Eye size={16} /> View
                    </button>
                  </td>
                </tr>
              ))}
              {invoices?.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    <FileText size={48} className="mx-auto mb-2 opacity-20" />
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoiceList;