import React, { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { formatCurrency } from '../utils';
import { TrendingUp, Users, Package, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, link }: any) => (
  <Link to={link} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  </Link>
);

const Dashboard = () => {
  const stats = useLiveQuery(async () => {
    const medicineCount = await db.medicines.count();
    const partyCount = await db.parties.count();
    const invoiceCount = await db.invoices.count();
    const lowStock = await db.medicines.where('stock').below(10).count();
    
    // Calculate total revenue
    const invoices = await db.invoices.toArray();
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

    return { medicineCount, partyCount, invoiceCount, lowStock, totalRevenue };
  });

  if (!stats) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 mt-1">Welcome back to Gopi Distributors</p>
        </div>
        <div className="text-right">
           <p className="text-sm text-gray-500">Today's Date</p>
           <p className="font-semibold">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(stats.totalRevenue)} 
          icon={TrendingUp} 
          color="bg-teal-500" 
          link="/invoices"
        />
        <StatCard 
          title="Total Parties" 
          value={stats.partyCount} 
          icon={Users} 
          color="bg-blue-500" 
          link="/parties"
        />
        <StatCard 
          title="Products" 
          value={stats.medicineCount} 
          icon={Package} 
          color="bg-indigo-500" 
          link="/inventory"
        />
        <StatCard 
          title="Low Stock Items" 
          value={stats.lowStock} 
          icon={AlertCircle} 
          color="bg-rose-500" 
          link="/inventory"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
                <Link to="/billing" className="p-4 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 flex flex-col items-center justify-center text-center group transition-colors">
                    <div className="bg-teal-100 p-3 rounded-full mb-3 group-hover:bg-teal-200 transition-colors">
                        <TrendingUp className="text-teal-700" size={24} />
                    </div>
                    <span className="font-medium text-gray-700">Create New Invoice</span>
                </Link>
                <Link to="/inventory" className="p-4 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 flex flex-col items-center justify-center text-center group transition-colors">
                    <div className="bg-indigo-100 p-3 rounded-full mb-3 group-hover:bg-indigo-200 transition-colors">
                        <Package className="text-indigo-700" size={24} />
                    </div>
                    <span className="font-medium text-gray-700">Add Medicine</span>
                </Link>
            </div>
        </div>
        
        <div className="bg-teal-900 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-teal-800 rounded-full opacity-50 blur-xl"></div>
            <div className="relative z-10">
                <h3 className="text-xl font-bold brand-font mb-2">Gopi Distributors</h3>
                <p className="text-teal-200 mb-6 text-sm">Committed to providing world-class pharmaceutical distribution services.</p>
                <div className="text-xs text-teal-400">
                    <p>Contact Support:</p>
                    <p>+91 98765 43210</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;