"use client";

import { useState, useEffect } from "react";
import {
  getWorkflowStepsServer,
  addWorkflowStepServer,
  deleteWorkflowStepServer,
  updateWorkflowStepServer
} from "./actions";
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  ChevronUp,
  ChevronDown,
  Workflow,
  AlertCircle,
  CheckCircle2,
  Loader2,
  TextCursorInput
} from "lucide-react";

export default function WorkflowPage() {
  const [steps, setSteps] = useState<any[]>([]);
  const [newStepText, setNewStepText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchSteps();
  }, []);

  const fetchSteps = async () => {
    setIsLoading(true);
    const data = await getWorkflowStepsServer();
    setSteps(data);
    setIsLoading(false);
  };

  const handleAddStep = async () => {
    if (!newStepText.trim()) return;
    setIsSubmitting(true);
    const order = steps.length + 1;
    const result = await addWorkflowStepServer(newStepText, order);
    if (result.success) {
      setNewStepText("");
      await fetchSteps();
      setMessage({ type: "success", text: "New step added!" });
    } else {
      setMessage({ type: "error", text: result.error || "Failed to add step" });
    }
    setIsSubmitting(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDeleteStep = async (id: string) => {
    if (!confirm("Are you sure you want to delete this workflow step?")) return;
    const result = await deleteWorkflowStepServer(id);
    if (result.success) {
      await fetchSteps();
      setMessage({ type: "success", text: "Workflow step deleted!" });
    } else {
      setMessage({ type: "error", text: result.error || "Failed to delete step" });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const startEditing = (step: any) => {
    setEditingId(step.id);
    setEditText(step.text);
  };

  const handleUpdateStep = async () => {
    if (!editingId || !editText.trim()) return;
    setIsSubmitting(true);
    const result = await updateWorkflowStepServer(editingId, editText);
    if (result.success) {
      setEditingId(null);
      await fetchSteps();
      setMessage({ type: "success", text: "Workflow step updated!" });
    } else {
      setMessage({ type: "error", text: result.error || "Failed to update step" });
    }
    setIsSubmitting(false);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
          <Workflow className="w-8 h-8 text-blue-600" />
          Work Flow Structure
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          Each paragraph below represents a step in your user's journey.
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 \${
          message.type === "success" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800" : "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
        }`}>
          {message.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <p className="text-zinc-500 dark:text-zinc-400 animate-pulse">Loading work flow...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* List existing steps */}
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-lg shadow-inner">
                  {index + 1}
                </div>
                <div className="flex-1 pt-1">
                  {editingId === step.id ? (
                    <div className="animate-in fade-in">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full min-h-[100px] p-3 mb-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-zinc-700 dark:text-zinc-300"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdateStep}
                          disabled={isSubmitting || !editText.trim()}
                          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
                        >
                          {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                          Update Step
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-4 py-1.5 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-sm transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between gap-4">
                      <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed break-words whitespace-pre-wrap">
                        {step.text}
                      </p>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <button
                          onClick={() => startEditing(step)}
                          className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStep(step.id)}
                          className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Add result indicator if it's the next step */}
          <div className="bg-white/40 dark:bg-zinc-900/40 border border-dashed border-zinc-300 dark:border-zinc-800 p-6 rounded-2xl relative">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center font-black text-lg border border-zinc-200 dark:border-zinc-700">
                {steps.length + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 mb-3 flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Next Step
                </p>
                <textarea
                  value={newStepText}
                  onChange={(e) => setNewStepText(e.target.value)}
                  placeholder="Type the instructions for the next step here..."
                  className="w-full min-h-[140px] p-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none shadow-sm text-zinc-700 dark:text-zinc-300"
                />
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleAddStep}
                    disabled={isSubmitting || !newStepText.trim()}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl transition-all disabled:opacity-50 font-bold shadow-lg shadow-blue-500/20 active:scale-95"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Next Step
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
