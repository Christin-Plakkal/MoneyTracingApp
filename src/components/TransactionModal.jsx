import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

export default function TransactionModal({ isOpen, onClose, categories, onSave, onAddCategory }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    amount: '',
    type: 'Expense',
    groupPayment: 'N',
    myShare: '',
    notes: ''
  });
  const [newCat, setNewCat] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleAddCat = async () => {
    if (!newCat) return;
    await onAddCategory(newCat);
    setFormData({ ...formData, category: newCat });
    setNewCat('');
    setShowAddCat(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">Add Transaction</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Date</label>
              <input 
                type="date" 
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Type</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Expense">Expense</option>
                <option value="Income">Income</option>
                <option value="Charity">Charity</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Category</label>
            <div className="flex gap-2">
              <select 
                required
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="flex-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button 
                type="button"
                onClick={() => setShowAddCat(!showAddCat)}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            {showAddCat && (
              <div className="flex gap-2 mt-2">
                <input 
                  placeholder="New category name"
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  className="flex-1 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button 
                  type="button"
                  onClick={handleAddCat}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm"
                >
                  Add
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Amount</label>
              <input 
                type="number" 
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Group Payment?</label>
              <select 
                value={formData.groupPayment}
                onChange={(e) => setFormData({...formData, groupPayment: e.target.value})}
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="N">No</option>
                <option value="Y">Yes</option>
              </select>
            </div>
          </div>

          {formData.groupPayment === 'Y' && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">My Actual Share</label>
              <input 
                type="number" 
                step="0.01"
                required
                value={formData.myShare}
                onChange={(e) => setFormData({...formData, myShare: e.target.value})}
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Notes</label>
            <textarea 
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 h-24"
              placeholder="Add optional notes..."
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors mt-4"
          >
            Save Transaction
          </button>
        </form>
      </div>
    </div>
  );
}
