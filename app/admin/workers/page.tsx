"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MoreVertical, 
  ExternalLink,
  Phone,
  CreditCard,
  User,
  Loader2,
  AlertCircle
} from "lucide-react";
import { getAllWorkersServer, updateWorkerStatusServer } from "./actions";
import Image from "next/image";

export default function WorkersPage() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    setIsLoading(true);
    const data = await getAllWorkersServer();
    setWorkers(data);
    setIsLoading(false);
  };

  const handleStatusUpdate = async (userId: string, status: string) => {
    setUpdatingId(userId);
    const res = await updateWorkerStatusServer(userId, status);
    if (res.success) {
      setWorkers(workers.map(w => w.id === userId ? { ...w, status } : w));
    } else {
      alert("Error: " + res.error);
    }
    setUpdatingId(null);
  };

  const filteredWorkers = workers.filter(w => {
    const matchesSearch = w.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         w.phoneNumber?.includes(searchQuery);
    const matchesFilter = statusFilter === "all" || w.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit"><CheckCircle className="w-3.5 h-3.5" /> Active</span>;
      case "pending":
        return <span className="px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit"><Clock className="w-3.5 h-3.5" /> Pending</span>;
      case "blocked":
        return <span className="px-3 py-1 bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit"><XCircle className="w-3.5 h-3.5" /> Blocked</span>;
      default:
        return <span className="px-3 py-1 bg-zinc-100 text-zinc-700 dark:bg-zinc-500/10 dark:text-zinc-400 rounded-full text-xs font-bold w-fit">{status}</span>;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Workers Management
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Manage and track all registered workers</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-zinc-900 px-4 py-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-400">Total workers:</span>
            <span className="text-sm font-black text-zinc-900 dark:text-white">{workers.length}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-sm font-medium"
          />
        </div>
        
        <div className="flex gap-2 pb-2 md:pb-0 overflow-x-auto">
          {['all', 'pending', 'active', 'blocked'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-6 h-14 rounded-2xl text-xs font-black transition-all capitalize shadow-sm shrink-0 ${
                statusFilter === filter 
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-black shadow-lg" 
                  : "bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                <th className="px-6 py-5 text-xs font-black text-zinc-400">Worker details</th>
                <th className="px-6 py-5 text-xs font-black text-zinc-400">Registration info</th>
                <th className="px-6 py-5 text-xs font-black text-zinc-400">Financials</th>
                <th className="px-6 py-5 text-xs font-black text-zinc-400">Status</th>
                <th className="px-6 py-5 text-xs font-black text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-sm font-bold text-zinc-400">Loading workers...</p>
                  </td>
                </tr>
              ) : filteredWorkers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <Users className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                    <p className="text-sm font-bold text-zinc-400">No workers found</p>
                  </td>
                </tr>
              ) : (
                filteredWorkers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-zinc-900 dark:text-white leading-none mb-1">{worker.fullName}</p>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400"><Phone className="w-2.5 h-2.5" /> {worker.phoneNumber}</span>
                            <span className="text-[10px] text-zinc-400 font-bold capitalize">{worker.idType?.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                          <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
                            {worker.createdAt ? new Date(worker.createdAt).toLocaleDateString('en-GB') : 'N/A'}
                          </span>
                        </div>
                        <div className="text-[10px] font-black text-zinc-400">
                          Join date
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <CreditCard className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-sm font-black text-zinc-900 dark:text-white">ETB {worker.balance || 0}</span>
                        </div>
                        <p className="text-[10px] font-bold text-zinc-400">Withdrawal: ETB {worker.totalWithdrawal || 0}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {getStatusBadge(worker.status)}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {worker.status === "pending" && (
                          <button
                            disabled={updatingId === worker.id}
                            onClick={() => handleStatusUpdate(worker.id, "active")}
                            className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50"
                            title="Approve Worker"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        {worker.status !== "blocked" ? (
                          <button
                            disabled={updatingId === worker.id}
                            onClick={() => handleStatusUpdate(worker.id, "blocked")}
                            className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all disabled:opacity-50"
                            title="Block Worker"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        ) : (
                          <button
                            disabled={updatingId === worker.id}
                            onClick={() => handleStatusUpdate(worker.id, "active")}
                            className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all disabled:opacity-50"
                            title="Unblock Worker"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Card */}
      {!isLoading && (
        <div className="flex gap-4">
          <div className="flex-1 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-500/20 flex gap-4">
            <div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm flex items-center justify-center shrink-0">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-black text-blue-900 dark:text-blue-300 mb-1">Worker management info</h4>
              <p className="text-xs text-blue-700/70 dark:text-blue-400/70 font-medium leading-relaxed">
                Approve workers to allow them to start tasks and earn commissions. You can block any worker at any time to restrict their access to the platform.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
