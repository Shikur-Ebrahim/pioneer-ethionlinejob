"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  ClipboardList,
  Save,
  X,
  RefreshCw,
  Zap,
  Youtube,
  Instagram,
  Facebook,
  Globe,
  AlertTriangle,
} from "lucide-react";
import {
  getTasksServer,
  deleteTaskServer,
  toggleTaskStatusServer,
  updateTaskServer,
} from "./actions";
import Image from "next/image";

const platformIcons: Record<string, React.ReactNode> = {
  tiktok: <Zap className="w-4 h-4" />,
  youtube: <Youtube className="w-4 h-4" />,
  facebook: <Facebook className="w-4 h-4" />,
  instagram: <Instagram className="w-4 h-4" />,
  free: <Globe className="w-4 h-4" />,
};

const platformColors: Record<string, string> = {
  tiktok: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  youtube: "bg-red-500/10 text-red-400 border-red-500/20",
  facebook: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  instagram: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  free: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

function getCloudinaryUrl(publicId: string, mediaType: string) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const resourceType = mediaType === "video" ? "video" : "image";
  return `https://res.cloudinary.com/${cloudName}/${resourceType}/upload/${publicId}`;
}

function getCloudinaryLogoUrl(publicId: string) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
}

function MediaPreview({ task, className = "" }: { task: any; className?: string }) {
  if (!task?.mediaId) return null;
  const url = getCloudinaryUrl(task.mediaId, task.mediaType);
  const logoUrl = task.logoId ? getCloudinaryLogoUrl(task.logoId) : null;
  
  return (
    <div className={`relative rounded-2xl overflow-hidden bg-black ${className}`}>
      {task.mediaType === "video" ? (
        <video
          src={url}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <Image src={url} alt="Task media" fill className="object-cover" />
      )}
      
      {/* Logo Overlay */}
      <div className="absolute top-2 left-2">
        <div className="w-8 h-8 rounded-lg bg-white/90 dark:bg-black/90 backdrop-blur-md border border-white/20 dark:border-zinc-800/50 flex items-center justify-center overflow-hidden p-1 shadow-lg">
          {logoUrl ? (
            <Image src={logoUrl} alt="Logo" width={24} height={24} className="object-contain" />
          ) : task.platform === "free" ? (
            <Image src="/logo.png" alt="Free" width={24} height={24} className="object-contain" />
          ) : (
            <div className="text-zinc-400">{platformIcons[task.platform]}</div>
          )}
        </div>
      </div>

      <div className="absolute top-2 right-2">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${task.mediaType === "video" ? "bg-blue-500/80 text-white" : "bg-emerald-500/80 text-white"}`}>
          {task.mediaType}
        </span>
      </div>
    </div>
  );
}

export default function ManageTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ 
    adPrice: "", 
    workerPrice: "", 
    socialMediaPrice: "", 
    platform: "",
    totalViews: "",
    viewsUnit: "M" as "K" | "M" | "B",
    targetUsers: "",
    timeAchieved: "",
    timeUnit: "Hour" as "Min" | "Hour" | "Day"
  });
  const [isSaving, setIsSaving] = useState(false);

  // Toggle confirm
  const [toggleTarget, setToggleTarget] = useState<any | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const data = await getTasksServer();
      setTasks(data as any[]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleEdit = (task: any) => {
    setEditingTask(task);
    setEditForm({
      adPrice: String(task.adPrice ?? ""),
      workerPrice: String(task.workerPrice ?? ""),
      socialMediaPrice: String(task.socialMediaPrice ?? ""),
      platform: task.platform ?? "tiktok",
      totalViews: String(task.campaign?.totalViews ?? "").replace(/[KMB]/g, ""),
      viewsUnit: (String(task.campaign?.totalViews ?? "").match(/[KMB]/)?.[0] ?? "M") as any,
      targetUsers: String(task.campaign?.targetUsers ?? ""),
      timeAchieved: String(task.campaign?.timeAchieved ?? "").split(" ")[0],
      timeUnit: (String(task.campaign?.timeAchieved ?? "").split(" ")[1] ?? "Hour") as any,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingTask) return;
    setIsSaving(true);
    const totalViewsNum = (parseFloat(editForm.totalViews) || 0) * (
      editForm.viewsUnit === "K" ? 1000 : 
      editForm.viewsUnit === "M" ? 1000000 : 
      editForm.viewsUnit === "B" ? 1000000000 : 1
    );

    const updatedCountries = (editingTask.campaign?.targetCountries || []).map((c: any) => {
      const percentage = parseFloat(c.percentage || "0");
      const countryViews = (totalViewsNum * percentage) / 100;
      return {
        ...c,
        exactViews: countryViews.toLocaleString() + " Views"
      };
    });

    try {
      await updateTaskServer(editingTask.id, {
        adPrice: parseFloat(editForm.adPrice),
        workerPrice: parseFloat(editForm.workerPrice),
        socialMediaPrice: parseFloat(editForm.socialMediaPrice),
        platform: editForm.platform,
        campaign: {
          ...editingTask.campaign,
          totalViews: editForm.totalViews + editForm.viewsUnit,
          targetUsers: editForm.targetUsers,
          timeAchieved: editForm.timeAchieved + " " + editForm.timeUnit,
          targetCountries: updatedCountries
        }
      });
      setEditingTask(null);
      await fetchTasks();
    } catch {
      alert("Failed to update task.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmToggle = async () => {
    if (!toggleTarget) return;
    setIsToggling(true);
    try {
      await toggleTaskStatusServer(toggleTarget.id, toggleTarget.status);
      setToggleTarget(null);
      await fetchTasks();
    } catch {
      alert("Failed to update status.");
    } finally {
      setIsToggling(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteTaskServer(deleteTarget.id);
      setTasks((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      alert("Failed to delete task.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight mb-1 flex items-center gap-3">
            <ClipboardList className="h-10 w-10 text-emerald-500" />
            Manage Tasks
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">View, edit and manage all published tasks.</p>
        </div>
        <button onClick={fetchTasks} className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all font-bold text-sm">
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Task list */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem]">
          <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
          <span className="text-sm font-bold text-zinc-500">Loading tasks...</span>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem]">
          <ClipboardList className="h-16 w-16 text-zinc-300 dark:text-zinc-700 mb-4" />
          <p className="text-lg font-bold text-zinc-500">No tasks found</p>
          <p className="text-sm text-zinc-400 mt-1">Create a task using the Add Task page.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] shadow-md hover:shadow-lg transition-all relative overflow-hidden group">
              {/* Status bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-[2rem] ${task.status === "active" ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"}`} />

              <div className="pl-4 flex flex-col md:flex-row md:items-center gap-4 p-4">
                {/* Logo thumbnail */}
                <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden relative bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center p-2">
                  {task.logoId ? (
                    <Image src={getCloudinaryLogoUrl(task.logoId)} alt="Logo" width={48} height={48} className="object-contain" />
                  ) : task.platform === "free" ? (
                    <Image src="/logo.png" alt="Free" width={48} height={48} className="object-contain" />
                  ) : (
                    <div className="text-zinc-300 dark:text-zinc-700 scale-150">{platformIcons[task.platform]}</div>
                  )}
                </div>

                {/* Platform */}
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border ${platformColors[task.platform] ?? "bg-zinc-100 text-zinc-500 border-zinc-200"}`}>
                    {platformIcons[task.platform]}
                    {task.platform?.charAt(0).toUpperCase() + task.platform?.slice(1)}
                  </span>
                </div>

                {/* Pricing */}
                <div className="flex-1 grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-zinc-400 text-xs font-bold mb-1">Ad Price</p>
                    <p className="font-black text-zinc-900 dark:text-white">$ {task.adPrice != null ? Number(task.adPrice).toLocaleString() : "—"}</p>
                  </div>
                  <div>
                    <p className="text-zinc-400 text-xs font-bold mb-1">Worker Pay</p>
                    <p className="font-black text-emerald-500">Birr {task.workerPrice != null ? Number(task.workerPrice).toLocaleString() : "—"}</p>
                  </div>
                  <div>
                    <p className="text-zinc-400 text-xs font-bold mb-1">Social Pay</p>
                    <p className="font-black text-blue-400">$ {task.socialMediaPrice != null ? Number(task.socialMediaPrice).toLocaleString() : "—"}</p>
                  </div>
                </div>

                {/* Campaign Summary */}
                {task.campaign && (
                  <div className="flex-shrink-0 flex flex-wrap gap-2 max-w-[200px]">
                    {task.campaign.totalViews && (
                      <span className="px-2 py-1 rounded-lg bg-blue-500/5 text-blue-500 text-[10px] font-black border border-blue-500/10 whitespace-nowrap">
                        {task.campaign.totalViews} Views
                      </span>
                    )}
                    {task.campaign.targetCountries && task.campaign.targetCountries.length > 0 && (
                      <span className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-500 text-[10px] font-black border border-zinc-200 dark:border-zinc-800 whitespace-nowrap">
                        {task.campaign.targetCountries.length} Countries
                      </span>
                    )}
                    {task.campaign.targetUsers && (
                      <span className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-500 text-[10px] font-black border border-zinc-200 dark:border-zinc-800 whitespace-nowrap">
                        {task.campaign.targetUsers} Workers
                      </span>
                    )}
                    {task.campaign.timeAchieved && (
                      <span className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-500 text-[10px] font-black border border-zinc-200 dark:border-zinc-800 whitespace-nowrap">
                        {task.campaign.timeAchieved}
                      </span>
                    )}
                  </div>
                )}

                {/* Status label */}
                <div className="flex-shrink-0">
                  <span className={`text-xs font-black px-2 py-1 rounded-lg ${task.status === "active" ? "text-emerald-500 bg-emerald-500/10" : "text-zinc-400 bg-zinc-100 dark:bg-zinc-900"}`}>
                    {task.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => setToggleTarget(task)} title={task.status === "active" ? "Deactivate" : "Activate"}
                    className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all border ${task.status === "active" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20" : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-400"}`}>
                    {task.status === "active" ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleEdit(task)} title="Edit"
                    className="h-10 w-10 rounded-xl flex items-center justify-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteTarget(task)} title="Delete"
                    className="h-10 w-10 rounded-xl flex items-center justify-center bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/20 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Edit Modal ─── */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/5 blur-[60px] rounded-full" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white">Edit Task</h2>
                <button onClick={() => setEditingTask(null)} className="h-10 w-10 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Media preview */}
              <MediaPreview task={editingTask} className="w-full aspect-video mb-6" />

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-500 pl-1">Platform</label>
                  <select value={editForm.platform} onChange={(e) => setEditForm({ ...editForm, platform: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-zinc-900 dark:text-white focus:outline-none focus:border-emerald-500/50 transition-all font-bold">
                    {["tiktok", "youtube", "facebook", "instagram", "free"].map((p) => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>

                {[
                  { key: "adPrice", label: "Advertising Price", color: "text-zinc-400" },
                  { key: "workerPrice", label: "Worker Pay", color: "text-emerald-500" },
                  { key: "socialMediaPrice", label: "Pay for Social Media", color: "text-blue-400" },
                ].map(({ key, label, color }) => (
                  <div key={key} className="space-y-2">
                    <label className="text-xs font-black text-zinc-500 pl-1">{label}</label>
                    <div className="relative">
                      <span className={`absolute left-5 top-1/2 -translate-y-1/2 text-xs font-black ${color} select-none`}>$</span>
                      <input type="text" inputMode="decimal" value={(editForm as any)[key]}
                        onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                        placeholder="0.00"
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-14 pr-5 py-4 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-bold" />
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500 pl-1">Total Views</label>
                    <div className="flex gap-2">
                      <input type="text" value={editForm.totalViews} onChange={(e) => setEditForm({ ...editForm, totalViews: e.target.value })}
                        className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-4 text-zinc-900 dark:text-white focus:outline-none font-bold placeholder:text-zinc-400" placeholder="e.g. 1" />
                      <select value={editForm.viewsUnit} onChange={(e) => setEditForm({ ...editForm, viewsUnit: e.target.value as any })}
                        className="w-16 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-2 py-4 text-zinc-900 dark:text-white font-black cursor-pointer">
                        <option value="K">K</option>
                        <option value="M">M</option>
                        <option value="B">B</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500 pl-1">Target Workers</label>
                    <input type="text" value={editForm.targetUsers} onChange={(e) => setEditForm({ ...editForm, targetUsers: e.target.value })}
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-zinc-900 dark:text-white focus:outline-none font-bold" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-500 pl-1">Time Achievement</label>
                  <div className="flex gap-2">
                    <input type="text" value={editForm.timeAchieved} onChange={(e) => setEditForm({ ...editForm, timeAchieved: e.target.value })}
                      className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-zinc-900 dark:text-white focus:outline-none font-bold" placeholder="e.g. 48" />
                    <select value={editForm.timeUnit} onChange={(e) => setEditForm({ ...editForm, timeUnit: e.target.value as any })}
                      className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-3 py-4 text-zinc-900 dark:text-white font-black">
                      <option value="Min">Min</option>
                      <option value="Hour">Hour</option>
                      <option value="Day">Day</option>
                    </select>
                  </div>
                </div>

                <button onClick={handleSaveEdit} disabled={isSaving}
                  className="w-full mt-2 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-95">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Toggle Confirmation Modal ─── */}
      {toggleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
                  {toggleTarget.status === "active" ? "Deactivate Task?" : "Activate Task?"}
                </h2>
                <button onClick={() => setToggleTarget(null)} className="h-10 w-10 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <MediaPreview task={toggleTarget} className="w-full aspect-video" />

              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                This task will be marked as <strong className={toggleTarget.status === "active" ? "text-zinc-400" : "text-emerald-500"}>
                  {toggleTarget.status === "active" ? "Inactive" : "Active"}
                </strong>. You can change this at any time.
              </p>

              <div className="flex gap-3">
                <button onClick={() => setToggleTarget(null)} className="flex-1 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all">
                  Cancel
                </button>
                <button onClick={handleConfirmToggle} disabled={isToggling}
                  className={`flex-1 py-3 rounded-2xl font-black flex items-center justify-center gap-2 transition-all active:scale-95 ${toggleTarget.status === "active" ? "bg-zinc-700 hover:bg-zinc-600 text-white" : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950"}`}>
                  {isToggling ? <Loader2 className="w-5 h-5 animate-spin" /> : toggleTarget.status === "active" ? <XCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                  {toggleTarget.status === "active" ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ─── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-6 h-6 text-rose-500" />
                  Delete Task?
                </h2>
                <button onClick={() => setDeleteTarget(null)} className="h-10 w-10 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <MediaPreview task={deleteTarget} className="w-full aspect-video" />

              <p className="text-sm text-rose-400 font-medium">
                This action is <strong>permanent</strong> and cannot be undone. The task will be removed from Firestore.
              </p>

              <div className="flex gap-3">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all">
                  Cancel
                </button>
                <button onClick={handleConfirmDelete} disabled={isDeleting}
                  className="flex-1 py-3 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-rose-500/20">
                  {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                  Delete Forever
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
