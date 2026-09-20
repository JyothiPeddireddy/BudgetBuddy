import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { getAccounts, getBalanceTrend } from "../api/accounts";
import { useToast } from "../context/ToastContext";
import AccountForm from "../components/accounts/AccountForm";
import AccountTable from "../components/accounts/AccountTable";
import TotalBalanceCard from "../components/accounts/TotalBalanceCard";
import LineChart from "../components/charts/LineChart";
import Modal from "../components/common/Modal";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [editingAccount, setEditingAccount] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [bankFilter, setBankFilter] = useState("All Banks");
  const [typeFilter, setTypeFilter] = useState("All Accounts");
  const [trend, setTrend] = useState([]);
  const { showToast } = useToast();

  const load = async () => {
    const res = await getAccounts();
    setAccounts(res.data);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    getBalanceTrend(6).then((res) => setTrend(res.data));
  }, []);

  const handleAdded = async () => {
    await load();
    setModalOpen(false);
    showToast("Account added");
  };

  const handleUpdated = async () => {
    await load();
    setEditingAccount(null);
    setModalOpen(false);
    showToast("Account updated");
  };

  const handleDeleted = async () => {
    await load();
    showToast("Account deleted");
  };

  const openAdd = () => {
    setEditingAccount(null);
    setModalOpen(true);
  };

  const openEdit = (account) => {
    setEditingAccount(account);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingAccount(null);
  };

  const banks = ["All Banks", ...new Set(accounts.map((a) => a.bank_name).filter(Boolean))];
  const types = ["All Accounts", ...new Set(accounts.map((a) => a.account_type))];

  const filteredAccounts = accounts.filter((a) => {
    const bankMatch = bankFilter === "All Banks" || a.bank_name === bankFilter;
    const typeMatch = typeFilter === "All Accounts" || a.account_type === typeFilter;
    return bankMatch && typeMatch;
  });

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  const selectClass =
    "flex-1 sm:flex-none min-w-0 px-3 py-2.5 sm:py-2 rounded-lg border border-slate-200 text-sm font-semibold text-ink bg-white";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-5 sm:space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-6">
        <h1 className="font-display text-xl sm:text-2xl text-ink">Accounts</h1>

        <div className="flex items-center gap-2 sm:gap-3">
          <select value={bankFilter} onChange={(e) => setBankFilter(e.target.value)} className={selectClass}>
            {banks.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={selectClass}>
            {types.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* BALANCE + TREND: stacked on phone, side by side from tablet up */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <TotalBalanceCard totalBalance={totalBalance} />
        <div className="card p-4 sm:p-6 overflow-hidden">
          <p className="text-sm font-semibold text-ink mb-3">Monthly Trend</p>
          {trend.length > 0 ? (
            <LineChart data={trend} height={90} />
          ) : (
            <div className="h-24 flex items-center justify-center">
              <p className="text-xs text-slate">Not enough data yet.</p>
            </div>
          )}
        </div>
      </div>

      {/* ACCOUNTS LIST */}
      <div className="card p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="font-display text-base sm:text-lg text-ink">Your Accounts</h2>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 bg-emerald text-white px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity shrink-0"
          >
            <Plus size={16} strokeWidth={2.5} />
            Add Account
          </button>
        </div>

        {/* If the table is wider than the phone, it scrolls sideways inside the card */}
        <div className="overflow-x-auto">
          <AccountTable accounts={filteredAccounts} onDeleted={handleDeleted} onEdit={openEdit} />
        </div>
      </div>

      {modalOpen && (
        <Modal title={editingAccount ? "Edit Account" : "Add Account"} onClose={closeModal} maxWidth="max-w-md">
          <AccountForm
            onAdded={handleAdded}
            onUpdated={handleUpdated}
            editingAccount={editingAccount}
            onCancelEdit={closeModal}
          />
        </Modal>
      )}
    </div>
  );
}