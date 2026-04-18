import React from 'react';
import { Trash2, Edit } from 'lucide-react';

export default function TransactionTable({ transactions, loading, onDelete }) {
  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Loading transactions...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No transactions found for the selected period.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
          <tr>
            <th className="px-6 py-3 border-b">Date</th>
            <th className="px-6 py-3 border-b">Category</th>
            <th className="px-6 py-3 border-b">Amount</th>
            <th className="px-6 py-3 border-b">Type</th>
            <th className="px-6 py-3 border-b text-center">Group</th>
            <th className="px-6 py-3 border-b">My Share</th>
            <th className="px-6 py-3 border-b">Notes</th>
            <th className="px-6 py-3 border-b text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {transactions.map((tx, idx) => (
            <tr key={idx} className="hover:bg-gray-50 transition-colors group">
              <td className="px-6 py-4 whitespace-nowrap">
                {new Date(tx.Date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 bg-gray-100 rounded-md text-sm">{tx.Category}</span>
              </td>
              <td className="px-6 py-4 font-semibold">
                ₹{parseFloat(tx.Amount).toLocaleString('en-IN')}
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  tx.Type === 'Income' ? 'bg-green-100 text-green-700' : 
                  tx.Type === 'Expense' ? 'bg-red-100 text-red-700' : 
                  'bg-purple-100 text-purple-700'
                }`}>
                  {tx.Type}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                {tx.GroupPayment === 'Y' ? (
                  <span className="text-blue-600 font-bold">Y</span>
                ) : '-'}
              </td>
              <td className="px-6 py-4">
                {tx.GroupPayment === 'Y' ? `₹${parseFloat(tx.MyShare).toLocaleString('en-IN')}` : '-'}
              </td>
              <td className="px-6 py-4 text-gray-500 text-sm max-w-xs truncate">
                {tx.Notes}
              </td>
              <td className="px-6 py-4 text-right">
                <button 
                  onClick={() => {
                    if(window.confirm('Delete this transaction?')) {
                      onDelete(tx);
                    }
                  }}
                  className="p-2 text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
