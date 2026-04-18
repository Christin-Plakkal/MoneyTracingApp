import React, { useState, useEffect } from 'react';
import { googleLogout } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { CONFIG } from './config';
import { 
  LogOut, 
  Wallet, 
  TrendingUp, 
  Heart, 
  Users,
  PlusCircle,
  RefreshCw
} from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import TransactionTable from './components/TransactionTable';
import TransactionModal from './components/TransactionModal';

const API = {
  getTransactions: async () => {
    const res = await fetch(`${CONFIG.APPS_SCRIPT_URL}?action=getTransactions`);
    return res.json();
  },
  getCategories: async () => {
    const res = await fetch(`${CONFIG.APPS_SCRIPT_URL}?action=getCategories`);
    return res.json();
  },
  addTransaction: async (data) => {
    const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'addTransaction', ...data })
    });
    return res.json();
  },
  addCategory: async (category) => {
    const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action: 'addCategory', category })
    });
    return res.json();
  }
};

function App() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const decoded = JSON.parse(savedUser);
      if (decoded.email === CONFIG.ALLOWED_EMAIL) {
        setUser(decoded);
      }
    }
  }, []);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [txData, catData] = await Promise.all([
        API.getTransactions(),
        API.getCategories()
      ]);
      setTransactions(Array.isArray(txData) ? txData : []);
      setCategories(Array.isArray(catData) ? catData : []);
      setError(null);
    } catch (err) {
      setError('Connection error: Check your Apps Script URL and CORS settings.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    if (decoded.email === CONFIG.ALLOWED_EMAIL) {
      setUser(decoded);
      localStorage.setItem('user', JSON.stringify(decoded));
      setError(null);
    } else {
      setError(`Unauthorized: ${decoded.email} is not permitted.`);
      googleLogout();
    }
  };

  const handleLogout = () => {
    googleLogout();
    setUser(null);
    localStorage.removeItem('user');
  };

  const handleSaveTransaction = async (data) => {
    try {
      await API.addTransaction(data);
      await loadData();
    } catch (err) {
      alert('Failed to save transaction');
    }
  };

  const handleAddCategory = async (category) => {
    try {
      await API.addCategory(category);
      await loadData();
    } catch (err) {
      alert('Failed to add category');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md text-center border border-slate-100">
          <div className="bg-blue-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Money Tracker</h1>
          <p className="text-slate-500 mb-10">Manage your finances with Google Sheets</p>
          
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={() => setError('Authentication failed')}
              useOneTap
            />
          </div>
          
          {error && (
            <div className="mt-8 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  const filteredTransactions = transactions.filter(tx => {
    if (!tx.Date) return false;
    const txDate = new Date(tx.Date);
    return txDate.getFullYear() === parseInt(selectedYear) && 
           (txDate.getMonth() + 1) === parseInt(selectedMonth);
  });

  const totals = filteredTransactions.reduce((acc, tx) => {
    const amt = parseFloat(tx.Amount || 0);
    const share = parseFloat(tx.MyShare || 0);
    if (tx.Type === 'Income') acc.income += amt;
    else if (tx.Type === 'Expense') acc.expense += amt;
    else if (tx.Type === 'Charity') acc.charity += amt;
    
    if (tx.GroupPayment === 'Y') {
      acc.groupTotal += amt;
      acc.groupShare += share;
    }
    return acc;
  }, { income: 0, expense: 0, charity: 0, groupTotal: 0, groupShare: 0 });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight">MONEY TRACKER</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <img src={user.picture} className="w-7 h-7 rounded-full border border-white" alt="" />
              <span className="text-sm font-bold text-slate-700 hidden sm:block">{user.given_name}</span>
              <button 
                onClick={handleLogout}
                className="p-1 text-slate-400 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Income', val: totals.income, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Total Spent', val: totals.expense, icon: LogOut, color: 'text-rose-600', bg: 'bg-rose-50', rotate: 'rotate-90' },
            { label: 'Charity Giving', val: totals.charity, icon: Heart, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className={`w-5 h-5 ${stat.rotate || ''}`} />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">{stat.label}</h3>
              </div>
              <p className="text-3xl font-black">${stat.val.toLocaleString()}</p>
            </div>
          ))}

          <div className="bg-blue-600 p-6 rounded-3xl shadow-lg shadow-blue-100 text-white relative overflow-hidden">
            <Users className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10" />
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-white/20 text-white">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-blue-100">Group Expense</h3>
            </div>
            <div className="flex justify-between items-end relative z-10">
              <div>
                <p className="text-xs text-blue-100 opacity-80 mb-1">Total Spent</p>
                <p className="text-2xl font-black">${totals.groupTotal.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-blue-100 opacity-80 mb-1">My Share</p>
                <p className="text-2xl font-black">${totals.groupShare.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 mb-8 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({length: 12}, (_, i) => (
                <option key={i+1} value={i+1}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </option>
              ))}
            </select>
            <button 
              onClick={loadData}
              className={`p-2.5 rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors ${loading ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 active:scale-95"
          >
            <PlusCircle className="w-5 h-5" />
            Add Transaction
          </button>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <TransactionTable transactions={filteredTransactions} loading={loading} />
        </div>
      </main>

      <TransactionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categories={categories}
        onSave={handleSaveTransaction}
        onAddCategory={handleAddCategory}
      />
    </div>
  );
}

export default App;
