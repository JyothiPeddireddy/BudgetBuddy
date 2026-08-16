import { useEffect, useState } from "react";
import { getAccounts } from "../api/accounts";
import { useToast } from "../context/ToastContext";
import AccountForm from "../components/accounts/AccountForm";
import AccountList from "../components/accounts/AccountList";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [editingAccount, setEditingAccount] = useState(null);
  const { showToast } = useToast();

  const load = async () => {
    const res = await getAccounts();
    setAccounts(res.data);
  };

  useEffect(() => { load(); }, []);

  const handleAdded = async () => {
    await load();
    showToast("Account added");
  };

  const handleUpdated = async () => {
    await load();
    setEditingAccount(null);
    showToast("Account updated");
  };

  const handleDeleted = async () => {
    await load();
    showToast("Account deleted");
  };

  return (
    <div className="max-w-2xl mx-auto px-10 py-12 space-y-8">
      <div>
        <p className="eyebrow">Manage accounts</p>
        <h1 className="font-display text-3xl text-ink">Accounts</h1>
      </div>
      <div className="card p-6">
        <AccountForm
          onAdded={handleAdded}
          onUpdated={handleUpdated}
          editingAccount={editingAccount}
          onCancelEdit={() => setEditingAccount(null)}
        />
      </div>
      <div className="card p-6">
        <h2 className="font-display text-lg text-ink mb-4">Your accounts</h2>
        <AccountList accounts={accounts} onDeleted={handleDeleted} onEdit={setEditingAccount} />
      </div>
    </div>
  );
}