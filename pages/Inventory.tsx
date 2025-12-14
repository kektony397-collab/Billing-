import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Medicine } from '../types';
import { Plus, Search, Trash2, Edit2, Package } from 'lucide-react';
import { formatCurrency } from '../utils';

const Inventory = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  
  const initialFormState: Medicine = {
    name: '',
    packing: '',
    batchNo: '',
    expiryDate: '',
    hsn: '',
    manufacturer: '',
    mrp: 0,
    rate: 0,
    gstPercent: 12,
    stock: 0
  };

  const [formData, setFormData] = useState<Medicine>(initialFormState);

  const medicines = useLiveQuery(async () => {
    let collection = db.medicines.orderBy('name');
    if (search) {
      const lowerSearch = search.toLowerCase();
      return await collection.filter(m => 
        m.name.toLowerCase().includes(lowerSearch) || 
        m.batchNo.toLowerCase().includes(lowerSearch) ||
        m.hsn.includes(search)
      ).toArray();
    }
    return await collection.toArray();
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await db.medicines.update(editingId, formData);
      } else {
        await db.medicines.add(formData);
      }
      setShowForm(false);
      setFormData(initialFormState);
      setEditingId(null);
    } catch (error) {
      console.error("Failed to save medicine", error);
    }
  };

  const handleEdit = (medicine: Medicine) => {
    setFormData(medicine);
    setEditingId(medicine.id || null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      await db.medicines.delete(id);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-3xl font-bold text-gray-900">Inventory</h2>
           <p className="text-gray-500">Manage medicines and stock</p>
        </div>
        <button 
          onClick={() => { setShowForm(true); setEditingId(null); setFormData(initialFormState); }}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} /> Add Medicine
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold">{editingId ? 'Edit Medicine' : 'Add New Medicine'}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Medicine Name</label>
                <input 
                  required 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="e.g. Dolo 650mg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Packing</label>
                <input 
                  required 
                  type="text" 
                  value={formData.packing}
                  onChange={e => setFormData({...formData, packing: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="e.g. 15 Tabs"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch No</label>
                <input 
                  required 
                  type="text" 
                  value={formData.batchNo}
                  onChange={e => setFormData({...formData, batchNo: e.target.value.toUpperCase()})}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry (MM/YY)</label>
                <input 
                  required 
                  type="text" 
                  value={formData.expiryDate}
                  onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  placeholder="12/25"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HSN Code</label>
                <input 
                  required 
                  type="text" 
                  value={formData.hsn}
                  onChange={e => setFormData({...formData, hsn: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                <input 
                  type="text" 
                  value={formData.manufacturer}
                  onChange={e => setFormData({...formData, manufacturer: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">MRP</label>
                <input 
                  required 
                  type="number" 
                  min="0" step="0.01"
                  value={formData.mrp}
                  onChange={e => setFormData({...formData, mrp: parseFloat(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rate (Wholesale)</label>
                <input 
                  required 
                  type="number" 
                  min="0" step="0.01"
                  value={formData.rate}
                  onChange={e => setFormData({...formData, rate: parseFloat(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST %</label>
                <select 
                  value={formData.gstPercent}
                  onChange={e => setFormData({...formData, gstPercent: parseFloat(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                >
                  <option value={0}>0%</option>
                  <option value={5}>5%</option>
                  <option value={12}>12%</option>
                  <option value={18}>18%</option>
                  <option value={28}>28%</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Stock</label>
                <input 
                  required 
                  type="number" 
                  min="0"
                  value={formData.stock}
                  onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="md:col-span-3 flex justify-end gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-sm"
                >
                  {editingId ? 'Update Medicine' : 'Save Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, batch, or HSN..." 
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
                <th className="px-6 py-3">Product Name</th>
                <th className="px-6 py-3">Packing</th>
                <th className="px-6 py-3">Batch / Exp</th>
                <th className="px-6 py-3">MRP</th>
                <th className="px-6 py-3">Rate</th>
                <th className="px-6 py-3 text-center">GST %</th>
                <th className="px-6 py-3 text-center">Stock</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {medicines?.map((med) => (
                <tr key={med.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 font-medium text-gray-900">{med.name}
                  <div className="text-xs text-gray-400">{med.manufacturer}</div>
                  </td>
                  <td className="px-6 py-3">{med.packing}</td>
                  <td className="px-6 py-3">
                    <div className="font-mono text-xs text-gray-700">{med.batchNo}</div>
                    <div className="text-xs text-gray-400">{med.expiryDate}</div>
                  </td>
                  <td className="px-6 py-3">{formatCurrency(med.mrp)}</td>
                  <td className="px-6 py-3">{formatCurrency(med.rate)}</td>
                  <td className="px-6 py-3 text-center">
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">{med.gstPercent}%</span>
                  </td>
                  <td className="px-6 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${med.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {med.stock}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right space-x-2">
                    <button onClick={() => handleEdit(med)} className="text-teal-600 hover:text-teal-800 p-1"><Edit2 size={16} /></button>
                    <button onClick={() => med.id && handleDelete(med.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {medicines?.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    <Package size={48} className="mx-auto mb-2 opacity-20" />
                    No medicines found. Add some to get started.
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

export default Inventory;