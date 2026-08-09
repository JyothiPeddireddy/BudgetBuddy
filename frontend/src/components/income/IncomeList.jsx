import { useState } from "react";
import { deleteIncome, updateIncome } from "../../api/transactions";

export default function IncomeList({ incomes = [], onDeleted, onUpdated }) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ source: "", amount: "", date: "", notes: "" });

  const handleDelete = async (id) => {
    await deleteIncome(id);
    onDeleted();
  };

  const startEdit = (i) => {
    setEditingId(i.id);
    setEditData({
      source: i.source,
      amount: i.amount,
      date: i.date,
      notes: i.notes || "",
    });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id) => {
    await updateIncome(id, {
      ...editData,
      amount: parseFloat(editData.amount),
    });
    setEditingId(null);
    onUpdated();
  };

  if (!incomes.length) {
    return <p className="text-sm text-slate">No income entries yet.</p>;
  }

  return (
    <ul className="font-mono text-sm">
      {incomes.map((i) =>
        editingId === i.id ? (
          <li key={i.id} className="py-3 space-y-2">
            <input
              className="border rounded px-2 py-1 w-full text-sm"
              value={editData.source}
              onChange={(e) => setEditData({ ...editData, source: e.target.value })}
            />
            <input
              type="number"
              className="border rounded px-2 py-1 w-full text-sm"
              value={editData.amount}
              onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
            />
            <input
              type="date"
              className="border rounded px-2 py-1 w-full text-sm"
              value={editData.date}
              onChange={(e) => setEditData({ ...editData, date: e.target.value })}
            />
            <input
              className="border rounded px-2 py-1 w-full text-sm"
              placeholder="Notes"
              value={editData.notes}
              onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
            />
            <div className="flex gap-3">
              <button
                onClick={() => saveEdit(i.id)}
                className="text-xs text-emerald hover:underline"
              >
                Save
              </button>
              <button
                onClick={cancelEdit}
                className="text-xs text-slate hover:underline"
              >
                Cancel
              </button>
            </div>
          </li>
        ) : (
          <li key={i.id} className="flex justify-between items-center py-3">
            <div>
              <span className="text-ink">{i.source}</span>
              {i.notes && <span className="text-slate"> — {i.notes}</span>}
              <span className="block text-xs text-slate/60">{i.date}</span>
            </div>

           <div className="flex items-center gap-3">
             <span className="text-emerald">+{i.amount.toFixed(2)}</span>
             <button
               onClick={() => startEdit(i)}
               className="text-xs px-2.5 py-1 rounded-md border border-slate/30 text-slate hover:border-ink hover:text-ink transition-colors"
             >
             Edit
             </button>
             <button
               onClick={() => handleDelete(i.id)}
               className="text-xs px-2.5 py-1 rounded-md border border-coral/30 text-coral hover:bg-coral hover:text-white transition-colors"
             >
             Delete
             </button>
            </div>
          </li>
        )
      )}
    </ul>
  );
}