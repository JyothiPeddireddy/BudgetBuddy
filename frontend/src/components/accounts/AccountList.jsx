import { deleteAccount } from "../../api/accounts";

export default function AccountList({ accounts, onDeleted }) {
  const handleDelete = async (id) => {
    await deleteAccount(id);
    onDeleted();
  };

  if (!accounts.length) {
    return <p className="text-sm text-slate">No accounts yet — add one above.</p>;
  }

  return (
    <ul className="space-y-3">
      {accounts.map((a) => (
        <li key={a.id} className="flex justify-between items-center">
          <div>
            <span className="text-ink">{a.account_name}</span>
            <span className="text-slate text-sm"> — {a.account_type}{a.bank_name ? ` · ${a.bank_name}` : ""}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-sm text-indigo">{a.balance.toFixed(2)}</span>
            <button onClick={() => handleDelete(a.id)} className="text-xs text-slate hover:text-brick">
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}