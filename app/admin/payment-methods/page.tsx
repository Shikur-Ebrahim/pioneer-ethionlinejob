"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Plus, 
  Loader2, 
  Upload, 
  Trash2, 
  Building2, 
  Phone, 
  CheckCircle, 
  CreditCard, 
  Image as IconImage,
  Edit3,
  Check,
  XCircle,
  Eye,
  EyeOff
} from "lucide-react";
import Image from "next/image";
import { 
  addPaymentMethod, 
  getPaymentMethods, 
  deletePaymentMethod, 
  updatePaymentMethod, 
  togglePaymentMethodStatus 
} from "./actions";

const ETHIOPIAN_BANKS = [
  "Commercial Bank of Ethiopia (CBE)",
  "Awash International Bank",
  "Dashen Bank",
  "Bank of Abyssinia",
  "United Bank (Hibret Bank)",
  "Wegagen Bank",
  "Nib International Bank",
  "Zemen Bank",
  "Oromia International Bank",
  "Cooperative Bank of Oromia"
];

type PaymentMethodType = "bank" | "telebirr";

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<PaymentMethodType>("bank");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    bankName: "",
    holderName: "",
    accountNumber: "",
    phoneNumber: "",
    workerFee: "100",
  });

  // Logo upload state
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [logoId, setLogoId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = async () => {
    setIsLoading(true);
    const data = await getPaymentMethods();
    setMethods(data);
    setIsLoading(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setIsUploading(true);

    try {
      const signResponse = await fetch("/api/admin/cloudinary-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paramsToSign: {
            timestamp: Math.round(new Date().getTime() / 1000),
            folder: "payment_logos",
          }
        })
      });

      const { signature, timestamp, apiKey } = await signResponse.json();

      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("api_key", apiKey);
      uploadData.append("timestamp", timestamp.toString());
      uploadData.append("signature", signature);
      uploadData.append("folder", "payment_logos");

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: uploadData }
      );

      const data = await uploadResponse.json();
      if (data.public_id) {
        setLogoId(data.public_id);
      } else {
        throw new Error("Logo upload failed");
      }
    } catch (error) {
      console.error("Logo upload error:", error);
      alert("Failed to upload logo");
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logoId) {
      alert("Please upload a logo first");
      return;
    }

    setIsSaving(true);
    try {
      const methodData = activeTab === "bank" ? {
        type: "bank",
        bankName: formData.bankName,
        holderName: formData.holderName,
        accountNumber: formData.accountNumber,
        workerFee: Number(formData.workerFee) || 0,
        logoId,
      } : {
        type: "telebirr",
        holderName: formData.holderName,
        phoneNumber: formData.phoneNumber,
        workerFee: Number(formData.workerFee) || 0,
        logoId,
      };

      if (editingId) {
        await updatePaymentMethod(editingId, methodData);
        alert("Payment method updated!");
      } else {
        await addPaymentMethod(methodData);
        alert("Payment method added!");
      }

      setFormData({ bankName: "", holderName: "", accountNumber: "", phoneNumber: "", workerFee: "100" });
      setPreviewUrl(null);
      setLogoId("");
      setEditingId(null);
      loadMethods();
    } catch (error) {
      alert("Failed to save payment method");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (method: any) => {
    setEditingId(method.id);
    setActiveTab(method.type as PaymentMethodType);
    setFormData({
      bankName: method.bankName || "",
      holderName: method.holderName || "",
      accountNumber: method.accountNumber || "",
      phoneNumber: method.phoneNumber || "",
      workerFee: method.workerFee?.toString() || "100",
    });
    setLogoId(method.logoId);
    setPreviewUrl(`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${method.logoId}`);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      await togglePaymentMethodStatus(id, currentStatus);
      loadMethods();
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payment method?")) return;
    try {
      await deletePaymentMethod(id);
      loadMethods();
    } catch (error) {
      alert("Failed to delete");
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight mb-2">
          Payment Methods
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg">Manage Ethiopian Banks and Telebirr accounts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden backdrop-blur-xl">
            <div className="flex gap-2 mb-6 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl">
              <button
                onClick={() => setActiveTab("bank")}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                  activeTab === "bank" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                Bank
              </button>
              <button
                onClick={() => setActiveTab("telebirr")}
                className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                  activeTab === "telebirr" ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                Telebirr
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Logo Upload */}
              <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 mb-4 transition-all hover:border-emerald-500/30">
                <div className="relative w-20 h-20 mb-3 rounded-xl overflow-hidden bg-white dark:bg-black border border-zinc-100 dark:border-zinc-800 flex items-center justify-center">
                  {previewUrl ? (
                    <Image src={previewUrl} alt="Preview" fill className={`object-contain p-1 ${isUploading ? 'opacity-40' : ''}`} />
                  ) : activeTab === "telebirr" ? (
                    <Phone className="w-8 h-8 text-zinc-300" />
                  ) : (
                    <Building2 className="w-8 h-8 text-zinc-300" />
                  )}
                  {isUploading && <Loader2 className="absolute w-6 h-6 text-emerald-500 animate-spin" />}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {previewUrl ? "Change Logo" : "Upload Logo"}
                </button>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
              </div>

              {activeTab === "bank" && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 pl-1 uppercase">Bank Name</label>
                  <select
                    required
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select a Bank</option>
                    {ETHIOPIAN_BANKS.map(bank => (
                      <option key={bank} value={bank}>{bank}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 pl-1 uppercase">Account Holder Name</label>
                <input
                  type="text"
                  required
                  value={formData.holderName}
                  onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-emerald-500/50"
                  placeholder="Full Name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 pl-1 uppercase">
                  {activeTab === "bank" ? "Account Number" : "Phone Number"}
                </label>
                <input
                  type={activeTab === "bank" ? "text" : "tel"}
                  required
                  value={activeTab === "bank" ? formData.accountNumber : formData.phoneNumber}
                  onChange={(e) => activeTab === "bank" 
                    ? setFormData({ ...formData, accountNumber: e.target.value })
                    : setFormData({ ...formData, phoneNumber: e.target.value })
                  }
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 pl-1 uppercase tracking-widest">Worker Registration Fee (Birr)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-400">ETB</span>
                  <input
                    type="number"
                    required
                    value={formData.workerFee}
                    onChange={(e) => setFormData({ ...formData, workerFee: e.target.value })}
                    className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-12 py-3 text-sm font-black focus:outline-none focus:border-emerald-500/50"
                    placeholder="100"
                  />
                </div>
              </div>

              <button
                disabled={isSaving || isUploading}
                className={`w-full py-4 mt-4 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                  isSaving || isUploading ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-400 text-zinc-950"
                }`}
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : editingId ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingId ? "Update" : "Add"} {activeTab === "bank" ? "Bank" : "Telebirr"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ bankName: "", holderName: "", accountNumber: "", phoneNumber: "", workerFee: "100" });
                    setPreviewUrl(null);
                    setLogoId("");
                  }}
                  className="w-full py-3 mt-2 rounded-xl font-bold text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden backdrop-blur-xl">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-500" />
              Active Methods
            </h2>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
                <p className="text-zinc-500 font-bold">Loading payment methods...</p>
              </div>
            ) : methods.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-[2rem]">
                <p className="text-zinc-500 font-bold">No payment methods added yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {methods.map((m) => (
                  <div key={m.id} className={`group border rounded-3xl p-4 flex gap-4 items-start relative overflow-hidden transition-all ${
                    m.status === 'inactive' ? 'bg-zinc-100/50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800 opacity-75' : 'bg-white dark:bg-black border-zinc-200 dark:border-zinc-800'
                  }`}>
                    <div className="w-14 h-14 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0 relative overflow-hidden flex items-center justify-center shadow-sm">
                      {m.logoId ? (
                        <Image src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/${m.logoId}`} alt="Logo" fill className="object-contain p-1.5" />
                      ) : (
                        m.type === "telebirr" ? <Phone className="w-7 h-7 text-zinc-300" /> : <Building2 className="w-7 h-7 text-zinc-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${m.type === 'telebirr' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                          {m.type}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${m.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-500/10 text-zinc-500'}`}>
                          {m.status || 'active'}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        {m.type === "bank" && <h3 className="text-xs font-black text-zinc-900 dark:text-white truncate">{m.bankName}</h3>}
                        <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{m.holderName}</p>
                        <p className="text-[10px] text-zinc-500 font-mono tracking-tight">{m.type === "bank" ? m.accountNumber : m.phoneNumber}</p>
                        <p className="text-[10px] font-black text-emerald-500 mt-1">Fee: {m.workerFee || 0} Birr</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleStatus(m.id, m.status || 'active')}
                        title={m.status === 'inactive' ? 'Activate' : 'Deactivate'}
                        className={`p-2 rounded-xl transition-all ${
                          m.status === 'inactive' ? 'text-zinc-400 hover:bg-emerald-500/10 hover:text-emerald-500' : 'text-emerald-500 hover:bg-zinc-500/10 hover:text-zinc-400'
                        }`}
                      >
                        {m.status === 'inactive' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleEdit(m)}
                        title="Edit"
                        className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        title="Delete"
                        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
