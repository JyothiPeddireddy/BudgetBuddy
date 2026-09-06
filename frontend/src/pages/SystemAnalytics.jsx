// import { useEffect, useState } from "react";
// import { Navigate } from "react-router-dom";
// import {
//   Users,
//   Wallet,
//   TrendingDown,
//   Wallet2,
//   Target,
//   CheckCircle2,
//   PieChart as PieChartIcon,
//   ShieldCheck,
// } from "lucide-react";

// import { useAuth } from "../context/AuthContext";
// import {
//   getSystemAnalytics,
//   listAllUsers,
//   approvePremium,
//   rejectPremium,
// } from "../api/admin";
// import { getCategoryMeta } from "../utils/categoryIcons";
// import DonutChart from "../components/charts/DonutChart";

// const ROLE_STYLES = {
//   admin: "bg-purple-100 text-purple-700",
//   premium: "bg-emerald-soft text-emerald",
//   user: "bg-slate-100 text-slate",
// };

// export default function SystemAnalytics() {
//   const { user } = useAuth();

//   const [stats, setStats] = useState(null);
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [roleUpdating, setRoleUpdating] = useState(null);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!user || user.role !== "admin") return;

//     let cancelled = false;
//     setLoading(true);
//     setError("");

//     Promise.allSettled([getSystemAnalytics(), listAllUsers()])
//       .then(([statsRes, usersRes]) => {
//         if (cancelled) return;

//         setStats(
//           statsRes.status === "fulfilled"
//             ? statsRes.value.data
//             : null
//         );

//         setUsers(
//           usersRes.status === "fulfilled" &&
//             Array.isArray(usersRes.value.data)
//             ? usersRes.value.data
//             : []
//         );

//         if (statsRes.status === "rejected") {
//           console.error(
//             "Failed to load system analytics:",
//             statsRes.reason
//           );
//         }

//         if (usersRes.status === "rejected") {
//           console.error(
//             "Failed to load users:",
//             usersRes.reason
//           );
//         }

//         if (
//           statsRes.status === "rejected" &&
//           usersRes.status === "rejected"
//         ) {
//           setError("Failed to load admin data.");
//         }
//       })
//       .finally(() => {
//         if (!cancelled) setLoading(false);
//       });

//     return () => {
//       cancelled = true;
//     };
//   }, [user]);

//   // Client-side guard.
//   // Real security enforcement is done by the backend.
//   if (user && user.role !== "admin") {
//     return <Navigate to="/dashboard" replace />;
//   }

//   // NEW: exclude the logged-in admin's own account from the manageable
//   // users list -- an admin can't approve/reject/upgrade themselves, so
//   // their own row was just noise in this table.
//   //const manageableUsers = users.filter((u) => u.id !== user?.id);
//   const manageableUsers = users.filter((u) => u.role !== "admin");

//   const handleApprovePremium = async (userId) => {
//     setError("");
//     setRoleUpdating(userId);

//     try {
//       const res = await approvePremium(userId);

//       setUsers((prev) =>
//         prev.map((u) =>
//           u.id === userId
//             ? {
//                 ...u,
//                 role: res.data.role || "premium",
//                 premium_requested: false,
//               }
//             : u
//         )
//       );

//       setStats((prev) =>
//         prev
//           ? {
//               ...prev,
//               pending_premium_requests: Math.max(
//                 0,
//                 (prev.pending_premium_requests ?? 1) - 1
//               ),
//             }
//           : prev
//       );
//     } catch (err) {
//       setError(
//         err.response?.data?.detail ||
//           "Failed to approve Premium request."
//       );
//     } finally {
//       setRoleUpdating(null);
//     }
//   };

//   const handleRejectPremium = async (userId) => {
//     setError("");
//     setRoleUpdating(userId);

//     try {
//       await rejectPremium(userId);

//       setUsers((prev) =>
//         prev.map((u) =>
//           u.id === userId
//             ? {
//                 ...u,
//                 premium_requested: false,
//               }
//             : u
//         )
//       );

//       setStats((prev) =>
//         prev
//           ? {
//               ...prev,
//               pending_premium_requests: Math.max(
//                 0,
//                 (prev.pending_premium_requests ?? 1) - 1
//               ),
//             }
//           : prev
//       );
//     } catch (err) {
//       setError(
//         err.response?.data?.detail ||
//           "Failed to reject Premium request."
//       );
//     } finally {
//       setRoleUpdating(null);
//     }
//   };

//   const rolesBreakdown = stats
//     ? Object.entries(stats.users_by_role || {}).map(
//         ([role, count], i) => ({
//           label:
//             role.charAt(0).toUpperCase() +
//             role.slice(1),
//           value: count,
//           color: [
//             "#10b981",
//             "#6366f1",
//             "#8b5cf6",
//           ][i % 3],
//         })
//       )
//     : [];

//   const topCategoriesData = stats
//     ? (stats.top_categories_system_wide || []).map(
//         (c) => {
//           const meta = getCategoryMeta(c.category);

//           return {
//             label: c.category,
//             value: c.total,
//             color: meta.color,
//           };
//         }
//       )
//     : [];

//   return (
//     <div className="max-w-6xl mx-auto px-8 py-10 space-y-6">

//       {/* HEADER */}
//       <div>
//         <h1 className="flex items-center gap-2 font-display text-2xl text-ink">
//           <ShieldCheck
//             size={22}
//             className="text-purple-600"
//           />
//           System Analytics
//         </h1>

//         <p className="text-sm text-slate mt-1">
//           Aggregated stats across every account. No
//           per-user personal data shown here.
//         </p>
//       </div>

//       {loading ? (
//         <div className="card p-10 text-center text-sm text-slate">
//           Loading system analytics…
//         </div>
//       ) : (
//         <>
//           {/* SYSTEM STAT CARDS */}
//           <div className="grid grid-cols-5 gap-4">

//             <StatCard
//               label="Total Users"
//               value={stats?.total_users ?? 0}
//               icon={Users}
//               color="indigo"
//               isCount
//             />

//             <StatCard
//               label="Total Income (All Users)"
//               value={`₹${(
//                 stats?.total_income_all_users ?? 0
//               ).toLocaleString("en-IN")}`}
//               icon={Wallet}
//               color="emerald"
//             />

//             <StatCard
//               label="Total Expenses (All Users)"
//               value={`₹${(
//                 stats?.total_expenses_all_users ?? 0
//               ).toLocaleString("en-IN")}`}
//               icon={TrendingDown}
//               color="coral"
//             />

//             <StatCard
//               label="Net (All Users)"
//               value={`₹${(
//                 stats?.net_all_users ?? 0
//               ).toLocaleString("en-IN")}`}
//               icon={Wallet2}
//               color="indigo"
//             />

//             <StatCard
//               label="Total Balance (All Users)"
//               value={`₹${(
//                 stats?.total_balance_all_users ?? 0
//               ).toLocaleString("en-IN")}`}
//               icon={Wallet2}
//               color="emerald"
//             />

//           </div>

//           {/* ROW 1 */}
//           <div className="grid grid-cols-2 gap-5 items-start">

//             {/* USERS BY ROLE */}
//             <div className="card p-6">
//               <h2 className="flex items-center gap-2 font-display text-lg text-ink mb-1">
//                 <Users
//                   size={17}
//                   className="text-indigo"
//                 />
//                 Users by Role
//               </h2>

//               <p className="text-xs text-slate mb-4">
//                 Account distribution
//               </p>

//               {rolesBreakdown.length > 0 ? (
//                 <DonutChart
//                   data={rolesBreakdown}
//                   size={220}
//                   thickness={20}
//                   centerLabel={stats?.total_users ?? 0}
//                   centerSubLabel="Total Users"
//                 />
//               ) : (
//                 <p className="text-sm text-slate">
//                   No users found.
//                 </p>
//               )}
//             </div>

//             {/* TOP CATEGORIES */}
//             <div className="card p-6">
//               <h2 className="flex items-center gap-2 font-display text-lg text-ink mb-1">
//                 <PieChartIcon
//                   size={17}
//                   className="text-purple-600"
//                 />
//                 Top Categories (System-Wide)
//               </h2>

//               <p className="text-xs text-slate mb-4">
//                 Top 5 spending categories across all
//                 users
//               </p>

//               {topCategoriesData.length > 0 ? (
//                 <DonutChart
//                   data={topCategoriesData}
//                   size={220}
//                   thickness={20}
//                   centerLabel={`₹${topCategoriesData
//                     .reduce(
//                       (s, d) => s + d.value,
//                       0
//                     )
//                     .toLocaleString("en-IN")}`}
//                   centerSubLabel="Combined Spend"
//                 />
//               ) : (
//                 <p className="text-sm text-slate">
//                   No expense data yet.
//                 </p>
//               )}
//             </div>

//           </div>

//           {/* GOALS SUMMARY */}
//           <div className="card p-5 flex items-center gap-8">

//             <div className="flex items-center gap-3">
//               <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
//                 <Target
//                   size={16}
//                   className="text-orange-600"
//                   strokeWidth={2.2}
//                 />
//               </div>

//               <div>
//                 <p className="text-xs font-semibold text-slate">
//                   Total Goals
//                 </p>

//                 <p className="font-mono text-lg font-bold text-ink">
//                   {stats?.total_goals ?? 0}
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-center gap-3">
//               <div className="w-9 h-9 rounded-lg bg-emerald-soft flex items-center justify-center">
//                 <CheckCircle2
//                   size={16}
//                   className="text-emerald"
//                   strokeWidth={2.2}
//                 />
//               </div>

//               <div>
//                 <p className="text-xs font-semibold text-slate">
//                   Completed Goals
//                 </p>

//                 <p className="font-mono text-lg font-bold text-emerald">
//                   {stats?.completed_goals ?? 0}
//                 </p>
//               </div>
//             </div>

//             {/* PENDING PREMIUM REQUESTS */}
//             <div className="flex items-center gap-3">
//               <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
//                 <ShieldCheck
//                   size={16}
//                   className="text-purple-600"
//                   strokeWidth={2.2}
//                 />
//               </div>

//               <div>
//                 <p className="text-xs font-semibold text-slate">
//                   Premium Requests
//                 </p>

//                 <p className="font-mono text-lg font-bold text-purple-600">
//                   {stats?.pending_premium_requests ?? 0}
//                 </p>
//               </div>
//             </div>

//           </div>

//           {/* USER MANAGEMENT TABLE */}
//           <div className="card p-6">

//             <h2 className="font-display text-lg text-ink mb-1">
//               User Management
//             </h2>

//             <p className="text-xs text-slate mb-4">
//               Only users who have requested Premium can
//               be approved.
//             </p>

//             {error && (
//               <p className="text-xs text-coral font-semibold mb-3">
//                 {error}
//               </p>
//             )}

//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">

//                 <thead>
//                   <tr className="text-left text-[11px] font-semibold text-slate border-b border-slate-200">

//                     <th className="pb-2 pr-4">
//                       Username
//                     </th>

//                     <th className="pb-2 pr-4">
//                       Email
//                     </th>

//                     <th className="pb-2 pr-4">
//                       Verified
//                     </th>

//                     <th className="pb-2 pr-4">
//                       Role
//                     </th>

//                     <th className="pb-2 pr-4">
//                       Premium Request
//                     </th>

//                     <th className="pb-2">
//                       Action
//                     </th>

//                   </tr>
//                 </thead>

//                 <tbody>
//                   {manageableUsers.map((u) => (

//                     <tr
//                       key={u.id}
//                       className="border-b border-slate-100 last:border-b-0"
//                     >

//                       <td className="py-3 pr-4 font-semibold text-ink">
//                         {u.username}
//                       </td>

//                       <td className="py-3 pr-4 text-slate">
//                         {u.email}
//                       </td>

//                       <td className="py-3 pr-4">
//                         {u.is_verified ? (
//                           <span className="text-emerald text-xs font-semibold">
//                             Yes
//                           </span>
//                         ) : (
//                           <span className="text-slate text-xs">
//                             No
//                           </span>
//                         )}
//                       </td>

//                       <td className="py-3 pr-4">
//                         <span
//                           className={`px-2 py-1 rounded-full text-[11px] font-semibold ${
//                             ROLE_STYLES[u.role] ||
//                             ROLE_STYLES.user
//                           }`}
//                         >
//                           {u.role}
//                         </span>
//                       </td>

//                       <td className="py-3 pr-4">
//                         {u.role === "admin" ? (
//                           <span className="text-slate text-xs">—</span>
//                         ) : u.role === "premium" ? (
//                           <span className="text-emerald text-xs font-semibold">
//                             Approved
//                           </span>
//                         ) : u.premium_requested ? (
//                           <span className="text-purple-600 text-xs font-semibold">
//                             Pending
//                           </span>
//                         ) : (
//                           <span className="text-slate text-xs">
//                             No Request
//                           </span>
//                         )}
//                       </td>

//                       <td className="py-3">

//                         {u.role === "admin" ? (

//                           <span className="text-xs text-slate">
//                             Admin
//                           </span>

//                         ) : u.role === "premium" ? (

//                           <span className="text-xs font-semibold text-emerald">
//                             Premium
//                           </span>

//                         ) : u.premium_requested ? (

//                           <div className="flex items-center gap-2">

//                             <button
//                               type="button"
//                               disabled={
//                                 roleUpdating === u.id
//                               }
//                               onClick={() =>
//                                 handleApprovePremium(
//                                   u.id
//                                 )
//                               }
//                               className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-200 text-emerald hover:bg-emerald-soft transition-colors disabled:opacity-50"
//                             >
//                               {roleUpdating === u.id
//                                 ? "…"
//                                 : "Approve"}
//                             </button>

//                             <button
//                               type="button"
//                               disabled={
//                                 roleUpdating === u.id
//                               }
//                               onClick={() =>
//                                 handleRejectPremium(
//                                   u.id
//                                 )
//                               }
//                               className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-ink hover:border-coral hover:text-coral transition-colors disabled:opacity-50"
//                             >
//                               {roleUpdating === u.id
//                                 ? "…"
//                                 : "Reject"}
//                             </button>

//                           </div>

//                         ) : (

//                           <span className="text-xs text-slate">
//                             No request
//                           </span>

//                         )}

//                       </td>

//                     </tr>

//                   ))}

//                   {manageableUsers.length === 0 && (
//                     <tr>
//                       <td
//                         colSpan="6"
//                         className="py-8 text-center text-sm text-slate"
//                       >
//                         No users found.
//                       </td>
//                     </tr>
//                   )}

//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// /* ============================================================
//    STAT CARD
// ============================================================ */

// function StatCard({
//   label,
//   value,
//   icon: Icon,
//   color,
//   isCount = false,
// }) {
//   const styles = {
//     emerald: {
//       bg: "bg-emerald-soft",
//       text: "text-emerald",
//     },
//     coral: {
//       bg: "bg-coral-soft",
//       text: "text-coral",
//     },
//     indigo: {
//       bg: "bg-indigo-soft",
//       text: "text-indigo",
//     },
//     purple: {
//       bg: "bg-purple-100",
//       text: "text-purple-600",
//     },
//   }[color];

//   return (
//     <div className="card p-5">

//       <div className="flex items-center gap-3 mb-3">

//         <div
//           className={`w-9 h-9 rounded-xl ${styles.bg} flex items-center justify-center`}
//         >
//           <Icon
//             size={16}
//             className={styles.text}
//             strokeWidth={2.2}
//           />
//         </div>

//         <p className="text-xs font-semibold text-ink">
//           {label}
//         </p>

//       </div>

//       <p
//         className={`font-mono ${
//           isCount ? "text-2xl" : "text-xl"
//         } font-bold ${styles.text}`}
//       >
//         {value}
//       </p>

//     </div>
//   );
// }







import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  Users,
  Wallet,
  TrendingDown,
  Wallet2,
  Target,
  CheckCircle2,
  PieChart as PieChartIcon,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import {
  getSystemAnalytics,
  listAllUsers,
  approvePremium,
  rejectPremium,
  downgradePremium,
} from "../api/admin";
import { getCategoryMeta } from "../utils/categoryIcons";
import DonutChart from "../components/charts/DonutChart";

const ROLE_STYLES = {
  admin: "bg-purple-100 text-purple-700",
  premium: "bg-emerald-soft text-emerald",
  user: "bg-slate-100 text-slate",
};

export default function SystemAnalytics() {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleUpdating, setRoleUpdating] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "admin") return;

    let cancelled = false;
    setLoading(true);
    setError("");

    Promise.allSettled([getSystemAnalytics(), listAllUsers()])
      .then(([statsRes, usersRes]) => {
        if (cancelled) return;

        setStats(
          statsRes.status === "fulfilled"
            ? statsRes.value.data
            : null
        );

        setUsers(
          usersRes.status === "fulfilled" &&
            Array.isArray(usersRes.value.data)
            ? usersRes.value.data
            : []
        );

        if (statsRes.status === "rejected") {
          console.error(
            "Failed to load system analytics:",
            statsRes.reason
          );
        }

        if (usersRes.status === "rejected") {
          console.error(
            "Failed to load users:",
            usersRes.reason
          );
        }

        if (
          statsRes.status === "rejected" &&
          usersRes.status === "rejected"
        ) {
          setError("Failed to load admin data.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Client-side guard.
  // Real security enforcement is done by the backend.
  if (user && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // Exclude the logged-in admin's own account from the manageable
  // users list -- an admin can't approve/reject/upgrade/downgrade
  // themselves, so their own row was just noise in this table.
  const manageableUsers = users.filter((u) => u.role !== "admin");

  const handleApprovePremium = async (userId) => {
    setError("");
    setRoleUpdating(userId);

    try {
      const res = await approvePremium(userId);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                role: res.data.role || "premium",
                premium_requested: false,
              }
            : u
        )
      );

      setStats((prev) =>
        prev
          ? {
              ...prev,
              pending_premium_requests: Math.max(
                0,
                (prev.pending_premium_requests ?? 1) - 1
              ),
            }
          : prev
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to approve Premium request."
      );
    } finally {
      setRoleUpdating(null);
    }
  };

  const handleRejectPremium = async (userId) => {
    setError("");
    setRoleUpdating(userId);

    try {
      await rejectPremium(userId);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                premium_requested: false,
              }
            : u
        )
      );

      setStats((prev) =>
        prev
          ? {
              ...prev,
              pending_premium_requests: Math.max(
                0,
                (prev.pending_premium_requests ?? 1) - 1
              ),
            }
          : prev
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to reject Premium request."
      );
    } finally {
      setRoleUpdating(null);
    }
  };

  const handleDowngradePremium = async (userId) => {
    setError("");
    setRoleUpdating(userId);

    try {
      const res = await downgradePremium(userId);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                role: res.data.role || "user",
                premium_requested: false,
              }
            : u
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to downgrade user."
      );
    } finally {
      setRoleUpdating(null);
    }
  };

  const rolesBreakdown = stats
    ? Object.entries(stats.users_by_role || {}).map(
        ([role, count], i) => ({
          label:
            role.charAt(0).toUpperCase() +
            role.slice(1),
          value: count,
          color: [
            "#10b981",
            "#6366f1",
            "#8b5cf6",
          ][i % 3],
        })
      )
    : [];

  const topCategoriesData = stats
    ? (stats.top_categories_system_wide || []).map(
        (c) => {
          const meta = getCategoryMeta(c.category);

          return {
            label: c.category,
            value: c.total,
            color: meta.color,
          };
        }
      )
    : [];

  return (
    <div className="max-w-6xl mx-auto px-8 py-10 space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl text-ink">
          <ShieldCheck
            size={22}
            className="text-purple-600"
          />
          System Analytics
        </h1>

        <p className="text-sm text-slate mt-1">
          Aggregated stats across every account. No
          per-user personal data shown here.
        </p>
      </div>

      {loading ? (
        <div className="card p-10 text-center text-sm text-slate">
          Loading system analytics…
        </div>
      ) : (
        <>
          {/* SYSTEM STAT CARDS */}
          <div className="grid grid-cols-5 gap-4">

            <StatCard
              label="Total Users"
              value={stats?.total_users ?? 0}
              icon={Users}
              color="indigo"
              isCount
            />

            <StatCard
              label="Total Income (All Users)"
              value={`₹${(
                stats?.total_income_all_users ?? 0
              ).toLocaleString("en-IN")}`}
              icon={Wallet}
              color="emerald"
            />

            <StatCard
              label="Total Expenses (All Users)"
              value={`₹${(
                stats?.total_expenses_all_users ?? 0
              ).toLocaleString("en-IN")}`}
              icon={TrendingDown}
              color="coral"
            />

            <StatCard
              label="Net (All Users)"
              value={`₹${(
                stats?.net_all_users ?? 0
              ).toLocaleString("en-IN")}`}
              icon={Wallet2}
              color="indigo"
            />

            <StatCard
              label="Total Balance (All Users)"
              value={`₹${(
                stats?.total_balance_all_users ?? 0
              ).toLocaleString("en-IN")}`}
              icon={Wallet2}
              color="emerald"
            />

          </div>

          {/* ROW 1 */}
          <div className="grid grid-cols-2 gap-5 items-start">

            {/* USERS BY ROLE */}
            <div className="card p-6">
              <h2 className="flex items-center gap-2 font-display text-lg text-ink mb-1">
                <Users
                  size={17}
                  className="text-indigo"
                />
                Users by Role
              </h2>

              <p className="text-xs text-slate mb-4">
                Account distribution
              </p>

              {rolesBreakdown.length > 0 ? (
                <DonutChart
                  data={rolesBreakdown}
                  size={220}
                  thickness={20}
                  centerLabel={stats?.total_users ?? 0}
                  centerSubLabel="Total Users"
                />
              ) : (
                <p className="text-sm text-slate">
                  No users found.
                </p>
              )}
            </div>

            {/* TOP CATEGORIES */}
            <div className="card p-6">
              <h2 className="flex items-center gap-2 font-display text-lg text-ink mb-1">
                <PieChartIcon
                  size={17}
                  className="text-purple-600"
                />
                Top Categories (System-Wide)
              </h2>

              <p className="text-xs text-slate mb-4">
                Top 5 spending categories across all
                users
              </p>

              {topCategoriesData.length > 0 ? (
                <DonutChart
                  data={topCategoriesData}
                  size={220}
                  thickness={20}
                  centerLabel={`₹${topCategoriesData
                    .reduce(
                      (s, d) => s + d.value,
                      0
                    )
                    .toLocaleString("en-IN")}`}
                  centerSubLabel="Combined Spend"
                />
              ) : (
                <p className="text-sm text-slate">
                  No expense data yet.
                </p>
              )}
            </div>

          </div>

          {/* GOALS SUMMARY */}
          <div className="card p-5 flex items-center gap-8">

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center">
                <Target
                  size={16}
                  className="text-orange-600"
                  strokeWidth={2.2}
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate">
                  Total Goals
                </p>

                <p className="font-mono text-lg font-bold text-ink">
                  {stats?.total_goals ?? 0}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-soft flex items-center justify-center">
                <CheckCircle2
                  size={16}
                  className="text-emerald"
                  strokeWidth={2.2}
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate">
                  Completed Goals
                </p>

                <p className="font-mono text-lg font-bold text-emerald">
                  {stats?.completed_goals ?? 0}
                </p>
              </div>
            </div>

            {/* PENDING PREMIUM REQUESTS */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                <ShieldCheck
                  size={16}
                  className="text-purple-600"
                  strokeWidth={2.2}
                />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate">
                  Premium Requests
                </p>

                <p className="font-mono text-lg font-bold text-purple-600">
                  {stats?.pending_premium_requests ?? 0}
                </p>
              </div>
            </div>

          </div>

          {/* USER MANAGEMENT TABLE */}
          <div className="card p-6">

            <h2 className="font-display text-lg text-ink mb-1">
              User Management
            </h2>

            <p className="text-xs text-slate mb-4">
              Approve or reject Premium requests, or
              downgrade an existing Premium user back to
              standard access at any time.
            </p>

            {error && (
              <p className="text-xs text-coral font-semibold mb-3">
                {error}
              </p>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">

                <thead>
                  <tr className="text-left text-[11px] font-semibold text-slate border-b border-slate-200">

                    <th className="pb-2 pr-4">
                      Username
                    </th>

                    <th className="pb-2 pr-4">
                      Email
                    </th>

                    <th className="pb-2 pr-4">
                      Verified
                    </th>

                    <th className="pb-2 pr-4">
                      Role
                    </th>

                    <th className="pb-2 pr-4">
                      Premium Request
                    </th>

                    <th className="pb-2">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>
                  {manageableUsers.map((u) => (

                    <tr
                      key={u.id}
                      className="border-b border-slate-100 last:border-b-0"
                    >

                      <td className="py-3 pr-4 font-semibold text-ink">
                        {u.username}
                      </td>

                      <td className="py-3 pr-4 text-slate">
                        {u.email}
                      </td>

                      <td className="py-3 pr-4">
                        {u.is_verified ? (
                          <span className="text-emerald text-xs font-semibold">
                            Yes
                          </span>
                        ) : (
                          <span className="text-slate text-xs">
                            No
                          </span>
                        )}
                      </td>

                      <td className="py-3 pr-4">
                        <span
                          className={`px-2 py-1 rounded-full text-[11px] font-semibold ${
                            ROLE_STYLES[u.role] ||
                            ROLE_STYLES.user
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3 pr-4">
                        {u.role === "admin" ? (
                          <span className="text-slate text-xs">—</span>
                        ) : u.role === "premium" ? (
                          <span className="text-emerald text-xs font-semibold">
                            Approved
                          </span>
                        ) : u.premium_requested ? (
                          <span className="text-purple-600 text-xs font-semibold">
                            Pending
                          </span>
                        ) : (
                          <span className="text-slate text-xs">
                            No Request
                          </span>
                        )}
                      </td>

                      <td className="py-3">

                        {u.role === "admin" ? (

                          <span className="text-xs text-slate">
                            Admin
                          </span>

                        ) : u.role === "premium" ? (

                          <button
                            type="button"
                            disabled={roleUpdating === u.id}
                            onClick={() => handleDowngradePremium(u.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-ink hover:border-coral hover:text-coral transition-colors disabled:opacity-50"
                          >
                            {roleUpdating === u.id ? "…" : "Downgrade to User"}
                          </button>

                        ) : u.premium_requested ? (

                          <div className="flex items-center gap-2">

                            <button
                              type="button"
                              disabled={
                                roleUpdating === u.id
                              }
                              onClick={() =>
                                handleApprovePremium(
                                  u.id
                                )
                              }
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-200 text-emerald hover:bg-emerald-soft transition-colors disabled:opacity-50"
                            >
                              {roleUpdating === u.id
                                ? "…"
                                : "Approve"}
                            </button>

                            <button
                              type="button"
                              disabled={
                                roleUpdating === u.id
                              }
                              onClick={() =>
                                handleRejectPremium(
                                  u.id
                                )
                              }
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-ink hover:border-coral hover:text-coral transition-colors disabled:opacity-50"
                            >
                              {roleUpdating === u.id
                                ? "…"
                                : "Reject"}
                            </button>

                          </div>

                        ) : (

                          <span className="text-xs text-slate">
                            No request
                          </span>

                        )}

                      </td>

                    </tr>

                  ))}

                  {manageableUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan="6"
                        className="py-8 text-center text-sm text-slate"
                      >
                        No users found.
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  isCount = false,
}) {
  const styles = {
    emerald: {
      bg: "bg-emerald-soft",
      text: "text-emerald",
    },
    coral: {
      bg: "bg-coral-soft",
      text: "text-coral",
    },
    indigo: {
      bg: "bg-indigo-soft",
      text: "text-indigo",
    },
    purple: {
      bg: "bg-purple-100",
      text: "text-purple-600",
    },
  }[color];

  return (
    <div className="card p-5">

      <div className="flex items-center gap-3 mb-3">

        <div
          className={`w-9 h-9 rounded-xl ${styles.bg} flex items-center justify-center`}
        >
          <Icon
            size={16}
            className={styles.text}
            strokeWidth={2.2}
          />
        </div>

        <p className="text-xs font-semibold text-ink">
          {label}
        </p>

      </div>

      <p
        className={`font-mono ${
          isCount ? "text-2xl" : "text-xl"
        } font-bold ${styles.text}`}
      >
        {value}
      </p>

    </div>
  );
}