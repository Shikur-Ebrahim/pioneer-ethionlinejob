"use client";

import { useEffect, useState } from "react";
import { 
  ClipboardCheck, 
  User, 
  Phone, 
  Image as ImageIcon, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Maximize2
} from "lucide-react";
import { getPendingWorkersServer, approveRegistrationServer, rejectRegistrationServer } from "./actions";
import Image from "next/image";

export default function RegistrationsPage() {
  const [pendingWorkers, setPendingWorkers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string, name: string, type: 'approve' | 'reject' } | null>(null);

  useEffect(() => {
    loadPending();
  }, []);

  const loadPending = async () => {
    setIsLoading(true);
    const data = await getPendingWorkersServer();
    setPendingWorkers(data);
    setIsLoading(false);
  };

  const handleApprove = async (userId: string) => {
    setActionId(userId);
    const res = await approveRegistrationServer(userId);
    if (res.success) {
      setPendingWorkers(pendingWorkers.filter(w => w.id !== userId));
      setConfirmAction(null);
    } else {
      alert("Error: " + res.error);
    }
    setActionId(null);
  };

  const handleReject = async (userId: string) => {
    setActionId(userId);
    const res = await rejectRegistrationServer(userId);
    if (res.success) {
      setPendingWorkers(pendingWorkers.filter(w => w.id !== userId));
      setConfirmAction(null);
    } else {
      alert("Error: " + res.error);
    }
    setActionId(null);
  };

  const getCloudinaryUrl = (publicId: string) => {
    return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${publicId}`;
  };

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white flex items-center gap-3">
            <ClipboardCheck className="w-7 h-7 md:w-8 md:h-8 text-amber-500" />
            Pending Registrations
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-medium text-sm md:text-base">Review and verify new worker applications</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-amber-50 dark:bg-amber-500/10 px-4 py-2 rounded-2xl border border-amber-100 dark:border-amber-500/20 shadow-sm flex items-center gap-2">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 italic">Waiting review:</span>
            <span className="text-sm font-black text-amber-700 dark:text-amber-400">{pendingWorkers.length}</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 opacity-50">
          <Loader2 className="w-12 h-12 text-zinc-900 dark:text-white animate-spin mb-4" />
          <p className="text-sm font-bold text-zinc-400 leading-none">Loading applicants...</p>
        </div>
      ) : pendingWorkers.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-[2rem] md:rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-12 md:p-20 text-center shadow-sm">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 md:w-10 md:h-10 text-zinc-300 dark:text-zinc-600" />
          </div>
          <h3 className="text-lg md:text-xl font-black text-zinc-900 dark:text-white mb-2 leading-none tracking-tight">All caught up!</h3>
          <p className="text-sm text-zinc-500 font-medium">No pending registrations to review right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {pendingWorkers.map((worker) => (
            <div key={worker.id} className="group bg-white dark:bg-zinc-900 rounded-[2rem] md:rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300">
              {/* Header Info */}
              <div className="p-5 md:p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 group-hover:bg-amber-50 group-hover:text-amber-500 dark:group-hover:bg-amber-500/10 transition-colors">
                    <User className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-zinc-900 dark:text-white leading-none mb-1">{worker.fullName}</h4>
                    <span className="text-[10px] md:text-xs font-bold text-zinc-400 flex items-center gap-1.5"><Clock className="w-3 h-3" /> {new Date(worker.createdAt).toLocaleDateString('en-GB')}</span>
                  </div>
                </div>
                <div className="px-2 py-1 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                  <span className="text-[10px] font-black text-amber-600 dark:text-amber-400">Pending</span>
                </div>
              </div>

              {/* Data Section */}
              <div className="p-5 md:p-6 space-y-4 md:space-y-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-bold">Phone number</span>
                  <span className="font-black text-zinc-900 dark:text-white flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-blue-500" /> {worker.phoneNumber}</span>
                </div>

                <div className="space-y-2 md:space-y-3">
                  <span className="text-[10px] md:text-xs font-bold text-zinc-400 block mb-1">Payment proof screenshot</span>
                  <div className="relative aspect-[4/3] rounded-2xl md:rounded-3xl overflow-hidden bg-zinc-50 dark:bg-zinc-800 border-2 border-zinc-100 dark:border-zinc-800 group/img">
                    {worker.paymentProof ? (
                      <>
                        <Image
                          src={getCloudinaryUrl(worker.paymentProof)}
                          alt="Payment Proof"
                          fill
                          className="object-cover"
                        />
                        <button 
                          onClick={() => setSelectedImage(getCloudinaryUrl(worker.paymentProof))}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                        >
                          <Maximize2 className="w-8 h-8 text-white" />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-zinc-300">
                        <ImageIcon className="w-10 h-10 mb-2" />
                        <span className="text-[10px] font-bold">No screenshot found</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-5 md:p-6 bg-zinc-50/50 dark:bg-zinc-800/30 flex flex-col sm:flex-row gap-3">
                <button
                  disabled={actionId === worker.id}
                  onClick={() => setConfirmAction({ id: worker.id, name: worker.fullName, type: 'reject' })}
                  className="w-full sm:flex-1 h-12 md:h-14 rounded-xl md:rounded-2xl border-2 border-rose-100 dark:border-rose-950 text-rose-600 font-black text-xs md:text-sm hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4 md:w-5 md:h-5" /> Reject
                </button>
                <button
                  disabled={actionId === worker.id}
                  onClick={() => setConfirmAction({ id: worker.id, name: worker.fullName, type: 'approve' })}
                  className="w-full sm:flex-[2] h-12 md:h-14 rounded-xl md:rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black font-black text-xs md:text-sm shadow-xl active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> Accept Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => setConfirmAction(null)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 border border-zinc-200 dark:border-zinc-800">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
              confirmAction.type === 'approve' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
            }`}>
              {confirmAction.type === 'approve' ? <CheckCircle2 className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
            </div>
            
            <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2 leading-tight">
              {confirmAction.type === 'approve' ? 'Approve Registration?' : 'Reject Registration?'}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mb-8">
              {confirmAction.type === 'approve' 
                ? `Confirming the payment proof for ${confirmAction.name}. This will activate their worker status.`
                : `Are you sure you want to permanently delete the registration for ${confirmAction.name}? This action cannot be undone.`}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
              >
                Cancel
              </button>
              <button
                disabled={actionId === confirmAction.id}
                onClick={() => confirmAction.type === 'approve' ? handleApprove(confirmAction.id) : handleReject(confirmAction.id)}
                className={`h-12 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 transition-all ${
                  confirmAction.type === 'approve' ? 'bg-zinc-900 dark:bg-white dark:text-black' : 'bg-rose-600'
                }`}
              >
                {actionId === confirmAction.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Proceed'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedImage(null)} />
          <div className="relative w-full max-w-4xl aspect-[4/3] rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <Image
              src={selectedImage}
              alt="Payment Proof FullView"
              fill
              className="object-contain"
            />
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 md:top-8 md:right-8 w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition-all"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Helper Card */}
      {!isLoading && pendingWorkers.length > 0 && (
        <div className="p-6 bg-emerald-50 dark:bg-emerald-500/10 rounded-[2rem] md:rounded-[2.5rem] border border-emerald-100 dark:border-emerald-500/20 flex flex-col sm:flex-row gap-4">
          <div className="w-12 h-12 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-300 mb-1">Reviewing instructions</h4>
            <p className="text-[11px] md:text-xs text-emerald-700/70 dark:text-emerald-400/70 font-medium leading-relaxed">
              Verify the payment screenshot carefully. If "Accepted", the worker status becomes **Verified** and their registration **Fee** status maps to **Active**. If "Rejected", all their verification data will be permanently deleted.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
