import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Users, Package, FileText } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/billing', icon: ShoppingCart, label: 'New Billing' },
    { to: '/invoices', icon: FileText, label: 'Invoice History' },
    { to: '/inventory', icon: Package, label: 'Inventory (Medicines)' },
    { to: '/parties', icon: Users, label: 'Parties (Customers)' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 no-print z-10 shadow-xl">
      <div className="p-6 border-b border-slate-800 flex flex-col items-center">
        <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center mb-3">
            <span className="text-2xl font-bold">G</span>
        </div>
        <h1 className="text-xl font-bold brand-font text-center">Gopi Distributors</h1>
        <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Pharma Wholesale</p>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/50' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded-lg p-3 text-xs text-center text-slate-400">
          <p>Created By</p>
          <p className="text-white font-semibold mt-1">Yash K Pathak</p>
          <p className="mt-1 opacity-75">v1.0.0</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;