import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 ml-64 transition-all duration-300 print:ml-0 print:w-full">
        {children}
      </main>
    </div>
  );
};

export default Layout;