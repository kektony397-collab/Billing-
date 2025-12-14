import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Parties from './pages/Parties';
import Billing from './pages/Billing';
import InvoiceList from './pages/InvoiceList';

// Wrapper to handle layout based on route or print state
// For the Billing page in print mode, we might want to hide the sidebar logic inside the component itself (handled via CSS @media print mostly)
const AppContent = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/parties" element={<Parties />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/invoices" element={<InvoiceList />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

export default App;