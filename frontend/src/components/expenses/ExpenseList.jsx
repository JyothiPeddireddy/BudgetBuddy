import { useState } from "react";
import { deleteExpense, updateExpense } from "../../api/transactions";

export default function ExpenseList({ expenses, onDeleted, onUpdated }) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ category: "", amount: "", date: "", description: "" });

  const handleDelete = async (id) => {
    await deleteExpense(id);
    onDeleted();
  };

  const startEdit = (e) => {
    setEditingId(e.id);
    setEditData({
      category: e.category,
      amount: e.amount,
      date: e.date,
      description: e.description || "",
    });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = async (id) => {
    await updateExpense(id, {
      ...editData,
      amount: parseFloat(editData.amount),
    });
    setEditingId(null);
    onUpdated();
  };

  if (!expenses.length) {
    return <p className="text-sm text-slate">No expenses yet.</p>;
  }

  return (
    <ul className="font-mono text-sm">
      {expenses.map((e) =>
        editingId === e.id ? (
          <li key={e.id} className="py-3 space-y-2">
            <input
              className="border rounded px-2 py-1 w-full text-sm"
              value={editData.category}
              onChange={(ev) => setEditData({ ...editData, category: ev.target.value })}
            />
            <input
              type="number"
              className="border rounded px-2 py-1 w-full text-sm"
              value={editData.amount}
              onChange={(ev) => setEditData({ ...editData, amount: ev.target.value })}
            />
            <input
              type="date"
              className="border rounded px-2 py-1 w-full text-sm"
              value={editData.date}
              onChange={(ev) => setEditData({ ...editData, date: ev.target.value })}
            />
            <input
              className="border rounded px-2 py-1 w-full text-sm"
              placeholder="Description"
              value={editData.description}
              onChange={(ev) => setEditData({ ...editData, description: ev.target.value })}
            />
            <div className="flex gap-3">
              <button onClick={() => saveEdit(e.id)} className="text-xs text-emerald hover:underline">
                Save
              </button>
              <button onClick={cancelEdit} className="text-xs text-slate hover:underline">
                Cancel
              </button>
            </div>
          </li>
        ) : (
          <li key={e.id} className="flex justify-between items-center py-3">
            <div>
              <span className="text-ink">{e.category}</span>
              {e.description && <span className="text-slate"> — {e.description}</span>}
              <span className="block text-xs text-slate/60">{e.date}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-coral font-medium">-{e.amount.toFixed(2)}</span>
              <button
                onClick={() => startEdit(e)}
                className="text-xs px-2.5 py-1 rounded-md border border-slate/30 text-slate hover:border-ink hover:text-ink transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(e.id)}
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