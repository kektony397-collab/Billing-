import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { Party, STATES } from '../types';
import { Plus, Search, Trash2, Edit2, Users } from 'lucide-react';

const Parties = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  
  const initialFormState: Party = {
    name: '',
    address: '',
    gstin: '',
    dlNo: '',
    mobile: '',
    email: '',
    state: 'Maharashtra' // Default
  };

  const [formData, setFormData] = useState<Party>(initialFormState);

  const parties = useLiveQuery(async () => {
    let collection = db.parties.orderBy('name');
    if (search) {
      const lowerSearch = search.toLowerCase();
      return await collection.filter(p => 
        p.name.toLowerCase().includes(lowerSearch) || 
        p.gstin.toLowerCase().includes(lowerSearch)
      ).toArray();
    }
    return await collection.toArray();
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await db.parties.update(editingId, formData);
      } else {
        await db.parties.add(formData);
      }
      setShowForm(false);
      setFormData(initialFormState);
      setEditingId(null);
    } catch (error) {
      console.error("Failed to save party", error);
    }
  };

  const handleEdit = (party: Party) => {
    setFormData(party);
    setEditingId(party.id || null);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this party?')) {
      await db.parties.delete(id);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-3xl font-bold text-gray-900">Parties</h2>
           <p className="text-gray-500">Manage customers and suppliers</p>
        </div>
        <button 
          onClick={() => { setShowForm(true); setEditingId(null); setFormData(initialFormState); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} /> Add Party
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold">{editingId ? 'Edit Party' : 'Add New Party'}</h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Firm Name</label>
                <input 
                  required 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea 
                  required 
                  rows={2}
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                <input 
                  type="text" 
                  value={formData.gstin}
                  onChange={e => setFormData({...formData, gstin: e.target.value.toUpperCase()})}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Drug License No</label>
                <input 
                  type="text" 
                  value={formData.dlNo}
                  onChange={e => setFormData({...formData, dlNo: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile No</label>
                <input 
                  required 
                  type="tel" 
                  value={formData.mobile}
                  onChange={e => setFormData({...formData, mobile: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <select 
                  value={formData.state}
                  onChange={e => setFormData({...formData, state: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {STATES.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  {editingId ? 'Update Party' : 'Save Party'}
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
              placeholder="Search by name or GSTIN..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-100 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-6 py-3">Party Name</th>
                <th className="px-6 py-3">GSTIN / DL</th>
                <th className="px-6 py-3">Mobile</th>
                <th className="px-6 py-3">State</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {parties?.map((party) => (
                <tr key={party.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 font-medium text-gray-900">
                    <div>{party.name}</div>
                    <div className="text-xs text-gray-400 font-normal truncate max-w-xs">{party.address}</div>
                  </td>
                  <td className="px-6 py-3">
                    <div className="font-mono text-xs text-blue-700 bg-blue-50 inline-block px-1 rounded">{party.gstin || 'N/A'}</div>
                    <div className="text-xs text-gray-500 mt-1">DL: {party.dlNo || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-3">{party.mobile}</td>
                  <td className="px-6 py-3">{party.state}</td>
                  <td className="px-6 py-3 text-right space-x-2">
                    <button onClick={() => handleEdit(party)} className="text-blue-600 hover:text-blue-800 p-1"><Edit2 size={16} /></button>
                    <button onClick={() => party.id && handleDelete(party.id)} className="text-red-500 hover:text-red-700 p-1"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {parties?.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    <Users size={48} className="mx-auto mb-2 opacity-20" />
                    No parties found. Add your customers.
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

export default Parties;