import { useEffect, useState } from "react";
import { BadgeCheck, Lock, User, Mail, Phone, Wallet, NotebookPen } from "lucide-react";
import { getMyProfile, updateMyProfile } from "../api/profile";
import { requestPremiumUpgrade } from "../api/subscription";
import { useToast } from "../context/ToastContext";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  // Editable fields, kept separate from `profile` so we don't overwrite
  // the read-only username/email while the form is being edited.
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [preferences, setPreferences] = useState("");

  // Subscription / Request Premium state
  const [requestingPremium, setRequestingPremium] = useState(false);
  const [premiumRequested, setPremiumRequested] = useState(false);

  const load = async () => {
    try {
      const res = await getMyProfile();
      setProfile(res.data);
      setFullName(res.data.full_name || "");
      setPhoneNumber(res.data.phone_number || "");
      setMonthlyIncome(res.data.monthly_income ?? "");
      setPreferences(res.data.financial_preferences || "");
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateMyProfile({
        full_name: fullName || null,
        phone_number: phoneNumber || null,
        monthly_income: monthlyIncome === "" ? null : Number(monthlyIncome),
        financial_preferences: preferences || null,
      });
      setProfile(res.data);
      showToast("Profile updated");
    } catch (err) {
      const detail = err.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail.map((d) => d.msg).join(", ")
        : detail || "Unable to update profile.";
      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleRequestPremium = async () => {
    setRequestingPremium(true);
    try {
      await requestPremiumUpgrade();
      setPremiumRequested(true);
      showToast("Request sent to admin for review");
    } catch (err) {
      const detail = err.response?.data?.detail;
      const message = typeof detail === "string" ? detail : "Unable to send request.";
      showToast(message, "error");
    } finally {
      setRequestingPremium(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-8 py-10">
        <div className="card p-10 text-center text-sm text-slate">Loading profile…</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-8 py-10 space-y-6">
      <div>
        <h1 className="font-display text-2xl text-ink">Profile</h1>
        <p className="text-sm text-slate mt-1">Your account details and preferences.</p>
      </div>

      {/* IDENTITY CARD — locked fields */}
      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-emerald text-white flex items-center justify-center text-xl font-semibold uppercase shrink-0">
            {profile?.username?.[0]}
          </div>
          <div>
            <p className="font-display text-lg text-ink">{profile?.username}</p>
            {profile?.is_verified ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald mt-0.5">
                <BadgeCheck size={14} />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-coral mt-0.5">
                Not verified
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate mb-1.5">
              <User size={13} /> Username
            </label>
            <div className="field bg-slate-50 text-slate flex items-center justify-between">
              {profile?.username}
              <Lock size={13} className="text-slate-300" />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate mb-1.5">
              <Mail size={13} /> Email
            </label>
            <div className="field bg-slate-50 text-slate flex items-center justify-between">
              {profile?.email}
              <Lock size={13} className="text-slate-300" />
            </div>
          </div>
        </div>
        <p className="text-xs text-slate mt-3">
          Username and email can't be changed since your email is verified.
        </p>
      </div>

      {/* SUBSCRIPTION CARD — only for non-premium, non-admin users */}
      {profile?.role === "user" && (
        <div className="card p-6">
          <h2 className="font-display text-lg text-ink mb-2">Subscription</h2>
          <p className="text-sm text-slate mb-4">
            You're currently on the free plan. Request Premium access and an admin will review it.
          </p>
          <button
            type="button"
            onClick={handleRequestPremium}
            disabled={requestingPremium || premiumRequested}
            className="bg-emerald text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {premiumRequested ? "Request Sent" : requestingPremium ? "Sending…" : "Request Premium Access"}
          </button>
        </div>
      )}

      {/* EDITABLE DETAILS */}
      <form onSubmit={handleSave} className="card p-6 space-y-5">
        <h2 className="font-display text-lg text-ink">Personal Details</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate mb-1.5">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              maxLength={100}
              className="field"
            />
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate mb-1.5">
              <Phone size={13} /> Phone Number <span className="text-slate-300 font-normal">(optional)</span>
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. 9876543210"
              className="field"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate mb-1.5">
            <Wallet size={13} /> Monthly Income <span className="text-slate-300 font-normal">(optional)</span>
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
            placeholder="e.g. 50000"
            className="field"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate mb-1.5">
            <NotebookPen size={13} /> Financial Preferences <span className="text-slate-300 font-normal">(optional)</span>
          </label>
          <textarea
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            placeholder="e.g. Prioritize saving over spending, avoid credit card debt…"
            rows={3}
            className="field resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-emerald text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}