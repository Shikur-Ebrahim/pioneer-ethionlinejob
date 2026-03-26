"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Zap,
  Youtube,
  Instagram,
  Facebook,
  Globe,
  Loader2,
  ChevronLeft,
  Target,
  ArrowRight,
  Info,
  ChevronDown,
  X,
  User,
  Phone,
  CreditCard,
  Upload,
  CheckCircle2,
  AlertCircle,
  Copy,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Check,
  Camera
} from "lucide-react";
import { getTaskServer } from "../../../admin/add-task/actions";
import { firebaseAuth } from "@/lib/firebase/client";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { checkWorkerStatusServer, submitWorkerVerificationServer } from "../actions";
import { getPaymentMethods } from "../../../admin/payment-methods/actions";

const platformConfig: Record<string, { label: string; icon: React.ReactNode; gradient: string; badge: string }> = {
  tiktok: {
    label: "TikTok",
    icon: <Zap className="w-4 h-4" />,
    gradient: "from-pink-500 via-rose-500 to-orange-400",
    badge: "bg-pink-500/15 text-pink-400 border-pink-500/25",
  },
  youtube: {
    label: "YouTube",
    icon: <Youtube className="w-4 h-4" />,
    gradient: "from-red-600 via-red-500 to-orange-500",
    badge: "bg-red-500/15 text-red-400 border-red-500/25",
  },
  facebook: {
    label: "Facebook",
    icon: <Facebook className="w-4 h-4" />,
    gradient: "from-blue-600 via-blue-500 to-indigo-500",
    badge: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  },
  instagram: {
    label: "Instagram",
    icon: <Instagram className="w-4 h-4" />,
    gradient: "from-purple-600 via-pink-500 to-orange-400",
    badge: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  },
  free: {
    label: "Free",
    icon: <Globe className="w-4 h-4" />,
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  },
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

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [task, setTask] = useState<any>(null);
  const [isTrackingOpen, setIsTrackingOpen] = useState(true);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verification State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationStep, setVerificationStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [registrationFee, setRegistrationFee] = useState<number>(100);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    idType: "national_id",
    idFront: "",
    idBack: "",
    paymentProof: "",
  });

  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const verified = await checkWorkerStatusServer(user.uid);
        setIsVerified(verified);

        // Load payment methods for the fee and the cards
        const allMethods = await getPaymentMethods() as any[];
        if (allMethods.length > 0) {
          // Get the fee from the first record (even if inactive, as per user request context)
          setRegistrationFee(allMethods[0].workerFee || 100);
        }

        // Only show ACTIVE methods as payment options
        setPaymentMethods(allMethods.filter(m => m.status === "active"));
      }
    });

    if (params.taskId) {
      getTaskServer(params.taskId as string)
        .then((data) => {
          if (!data) {
            setTask({ error: "Task not found" });
          } else {
            setTask(data);
          }
        })
        .catch((err) => {
          console.error("Error fetching task:", err);
          setTask({ error: "Failed to load order details" });
        })
        .finally(() => setIsLoading(false));
    }

    return () => unsubscribe();
  }, [params.taskId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center justify-center p-5">
        <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
        <p className="text-sm font-bold text-zinc-500 animate-pulse">Initialising order...</p>
      </div>
    );
  }

  if (!task || task.error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center justify-center p-5">
        <div className="w-20 h-20 bg-rose-500/10 rounded-[2.5rem] flex items-center justify-center mb-6">
          <Target className="w-10 h-10 text-rose-500" />
        </div>
        <h1 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Order Not Found</h1>
        <p className="text-sm text-zinc-400 mb-8 text-center max-w-xs">{task?.error || "The task you're looking for might have been completed or removed."}</p>
        <button
          onClick={() => router.push("/user/work")}
          className="flex items-center gap-2 px-8 py-4 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-black rounded-2xl font-black text-sm active:scale-95 transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Tasks
        </button>
      </div>
    );
  }

  const platform = platformConfig[task.platform] ?? platformConfig["free"];
  const mediaUrl = task.mediaId ? getCloudinaryUrl(task.mediaId, task.mediaType) : null;
  const logoUrl = task.logoId ? getCloudinaryLogoUrl(task.logoId) : null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-50 pb-28">
      {/* Header - Matching Image */}
      <div className="bg-[#1e7e4d] text-white">
        <div className="max-w-xl mx-auto px-5 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold">Commission Details</h1>
          <button onClick={() => router.back()} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      <main className="max-w-xl mx-auto px-5 py-6 space-y-6 bg-white dark:bg-zinc-950 min-h-screen">
        {/* Item Profile Section */}
        <div className="flex gap-4 items-start pb-6 border-b border-zinc-100 dark:border-zinc-900">
          <div className="w-24 h-16 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 shrink-0 border border-zinc-200/50 dark:border-zinc-800 shadow-sm relative">
            {mediaUrl ? (
              task.mediaType === "video" ? (
                <video src={mediaUrl} className="w-full h-full object-cover" autoPlay muted loop playsInline />
              ) : (
                <Image src={mediaUrl} alt="Media" fill className="object-cover" />
              )
            ) : logoUrl ? (
              <Image src={logoUrl} alt="Logo" width={96} height={64} className="object-cover w-full h-full" />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${platform.gradient}`} />
            )}
          </div>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-[#1e7e4d]">{platform.label} Task</h2>
            <div className="flex items-center gap-1.5 mt-1 text-zinc-500">
              <span className="text-base">📍</span>
              <span className="text-xs font-medium">Click to earn!! Simple</span>
            </div>
          </div>
        </div>

        {/* Mid Section - Timing & Stats with Icons */}
        <div className="space-y-6 pt-2 pb-4">
          {/* Row 1: Simple Style Reversion */}
          <div className="grid grid-cols-2 gap-x-8">
            <div className="space-y-1">
              <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Pay in full</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-zinc-500 font-medium whitespace-nowrap">Time to complete by:</p>
              <p className="text-sm text-zinc-500 font-medium">{task.campaign?.timeAchieved || "—"}</p>
            </div>
          </div>

          {/* Row 2: simple Style Reversion */}
          <div className="grid grid-cols-2 gap-x-8 border-t border-zinc-50 dark:border-zinc-900 pt-4">
            <div className="flex flex-col">
              <span className="text-sm text-zinc-500 font-medium whitespace-nowrap">Target Views</span>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{task.campaign?.totalViews || "—"}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-zinc-500 font-medium whitespace-nowrap">Target Workers</span>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{task.campaign?.targetUsers || "—"}</span>
            </div>
          </div>
        </div>

        {/* Order Number Row */}
        <div className="flex items-center justify-between py-2 border-t border-zinc-50 dark:border-zinc-900 pt-4">
          <span className="text-sm text-zinc-900 dark:text-zinc-100 font-medium">Order number:</span>
          <span className="text-sm font-bold text-[#1e7e4d] break-all max-w-[180px]">{task.id || params.taskId}</span>
        </div>

        {/* Stats Card (Gray Box) */}
        <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 rounded-2xl space-y-5">
          <div className="flex items-center justify-between text-zinc-700 dark:text-zinc-300">
            <span className="text-sm">Advertising Price</span>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 uppercase">$ {task.adPrice?.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-zinc-700 dark:text-zinc-300">
            <span className="text-sm">For {platform.label}</span>
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">$ {(task.socialMediaPrice || 0).toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between border-t border-zinc-200/50 dark:border-zinc-800/50 pt-5">
            <span className="text-sm text-zinc-700 dark:text-zinc-300">Your Earnings</span>
            <span className="text-sm font-bold text-[#1e7e4d] uppercase">ETB {task.workerPrice?.toLocaleString()}</span>
          </div>
        </div>

        {/* Footer Info & Buttons */}
        <div className="pt-8 space-y-8 pb-20">
          <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
            <span className="text-sm">Amount to pay:</span>
            <span className="text-sm font-bold text-zinc-900 dark:text-white">ETB {task.workerPrice?.toLocaleString() || "0"}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (isVerified) {
                  // If verified, proceed with final payment confirmation (or task start)
                  alert("Payment confirmed! Redirecting to task...");
                  router.push(`/user/work/${params.taskId}/start`);
                } else {
                  setShowVerificationModal(true);
                }
              }}
              className="flex-1 h-14 rounded-xl bg-[#1e7e4d] text-white font-bold text-base shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Confirm Payment
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </main>

      {/* Verification Multi-Step Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-xl bg-white dark:bg-zinc-950 rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            {/* Modal Header */}
            <div className="px-8 pt-8 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">Worker Verification</h2>
                <div className="flex items-center gap-2 mt-1">
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      className={`h-1 rounded-full transition-all duration-300 ${verificationStep >= s ? "w-8 bg-emerald-500" : "w-4 bg-zinc-200 dark:bg-zinc-800"
                        }`}
                    />
                  ))}
                  <span className="text-[11px] font-bold text-zinc-500 ml-2">Step {verificationStep} of 3</span>
                </div>
              </div>
              <button
                onClick={() => setShowVerificationModal(false)}
                className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-8 pb-8 pt-4 max-h-[70vh] overflow-y-auto">
              {/* Step 1: Personal Details */}
              {verificationStep === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 flex gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium leading-relaxed">
                      We need to verify your identity to ensure a safe workspace for all users. This is a one-time process.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-zinc-500 ml-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                          type="text"
                          placeholder="Your official name"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="w-full h-14 pl-12 pr-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-transparent focus:border-emerald-500/50 dark:focus:border-emerald-500/30 transition-all text-sm font-bold"
                        />
                      </div>
                      {showErrors && formData.fullName.length < 5 && (
                        <p className="text-[10px] text-rose-500 font-medium ml-1">At least 5 characters required</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-zinc-500 ml-1">Phone Number</label>
                      <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                          type="tel"
                          placeholder="09... or 07... (10 digits)"
                          maxLength={10}
                          value={formData.phoneNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                            setFormData({ ...formData, phoneNumber: val });
                          }}
                          className="w-full h-14 pl-12 pr-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-transparent focus:border-emerald-500/50 dark:focus:border-emerald-500/30 transition-all text-sm font-bold"
                        />
                      </div>
                      {showErrors && (formData.phoneNumber.length !== 10 || (!formData.phoneNumber.startsWith("09") && !formData.phoneNumber.startsWith("07"))) && (
                        <p className="text-[10px] text-rose-500 font-medium ml-1">Must be 10 digits starting with 09 or 07</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const isNameValid = formData.fullName.length >= 5;
                      const isPhoneValid = formData.phoneNumber.length === 10 && (formData.phoneNumber.startsWith("09") || formData.phoneNumber.startsWith("07"));
                      
                      if (isNameValid && isPhoneValid) {
                        setVerificationStep(2);
                        setShowErrors(false);
                      } else {
                        setShowErrors(true);
                      }
                    }}
                    className="w-full h-14 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black font-black text-sm shadow-xl active:scale-95 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-2"
                  >
                    Next Step
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Step 2: ID Verification */}
              {verificationStep === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="space-y-2 text-center">
                    <label className="text-[11px] font-bold text-zinc-500">Select ID Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['kebele_id', 'national_id', 'passport'].map((type) => (
                        <button
                          key={type}
                          onClick={() => setFormData({ ...formData, idType: type })}
                          className={`py-3 rounded-xl border-2 text-[10px] font-black transition-all ${formData.idType === type
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                            : "bg-zinc-50 dark:bg-zinc-900 border-transparent text-zinc-500"
                            }`}
                        >
                          {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-zinc-500 ml-1">ID Front</label>
                      <label className="relative block group cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setUploadProgress(prev => ({ ...prev, idFront: true }));
                            const formDataToUpload = new FormData();
                            formDataToUpload.append("file", file);
                            formDataToUpload.append("upload_preset", "pioneerbusiness");
                            try {
                              const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                                method: 'POST',
                                body: formDataToUpload
                              });
                              const data = await res.json();
                              setFormData(prev => ({ ...prev, idFront: data.public_id }));
                            } catch (err) {
                              console.error(err);
                            } finally {
                              setUploadProgress(prev => ({ ...prev, idFront: false }));
                            }
                          }}
                        />
                        <div className={`aspect-[4/3] relative rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden p-0 transition-all ${formData.idFront ? "border-emerald-500/40" : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                          }`}>
                          {uploadProgress.idFront ? (
                            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                          ) : formData.idFront ? (
                            <div className="absolute inset-0 w-full h-full">
                              <Image
                                src={getCloudinaryLogoUrl(formData.idFront)}
                                alt="ID Front"
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          ) : (
                            <>
                              <Camera className="w-6 h-6 text-zinc-400 mb-2" />
                              <span className="text-[9px] font-black text-zinc-400 uppercase">Upload Front</span>
                            </>
                          )}
                        </div>
                      </label>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-zinc-500 ml-1">ID Back</label>
                      <label className="relative block group cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setUploadProgress(prev => ({ ...prev, idBack: true }));
                            const formDataToUpload = new FormData();
                            formDataToUpload.append("file", file);
                            formDataToUpload.append("upload_preset", "pioneerbusiness");
                            try {
                              const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                                method: 'POST',
                                body: formDataToUpload
                              });
                              const data = await res.json();
                              setFormData(prev => ({ ...prev, idBack: data.public_id }));
                            } catch (err) {
                              console.error(err);
                            } finally {
                              setUploadProgress(prev => ({ ...prev, idBack: false }));
                            }
                          }}
                        />
                        <div className={`aspect-[4/3] relative rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden p-0 transition-all ${formData.idBack ? "border-emerald-500/40" : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                          }`}>
                          {uploadProgress.idBack ? (
                            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                          ) : formData.idBack ? (
                            <div className="absolute inset-0 w-full h-full">
                              <Image
                                src={getCloudinaryLogoUrl(formData.idBack)}
                                alt="ID Back"
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="w-6 h-6 text-white" />
                              </div>
                            </div>
                          ) : (
                            <>
                              <Camera className="w-6 h-6 text-zinc-400 mb-2" />
                              <span className="text-[9px] font-black text-zinc-400 uppercase">Upload Back</span>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setVerificationStep(1)}
                      className="flex-1 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-500 font-black text-sm active:scale-95 transition-all"
                    >
                      Back
                    </button>
                    <button
                      disabled={!formData.idFront || !formData.idBack}
                      onClick={() => setVerificationStep(3)}
                      className="flex-[2] h-14 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black font-black text-sm shadow-xl active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      Process Fee
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Registration Fee Payment */}
              {verificationStep === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-black text-blue-600">Registration Fee</span>
                      <span className="text-lg font-black text-blue-700 dark:text-blue-400">
                        ETB {registrationFee}.00
                      </span>
                    </div>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium leading-relaxed">
                      💼 Please pay the one-time registration fee to activate your worker account and start earning with our platform. Select a payment method below, copy the official phone number or account provided, and complete your payment using your preferred option. After payment, upload a clear screenshot of your payment proof for verification. Once your payment is confirmed, your account will be activated and you can begin working with our company.
                    </p>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium leading-relaxed">
                      ⚠️ Please make sure to send payment only to the official account provided.
                    </p>
                  </div>

                  <div className="space-y-4 overflow-x-auto pb-4 -mx-2 px-2 flex gap-4 scrollbar-hide">
                    {paymentMethods.map((method) => {
                      const isTelebirr = method.bankName?.toLowerCase().includes("telebirr") || method.type?.toLowerCase().includes("telebirr");

                      return (
                        <div
                          key={method.id}
                          className="min-w-[300px] p-6 rounded-[2.5rem] border-2 transition-all shadow-xl bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 text-zinc-900 dark:text-white shadow-zinc-200/50 dark:shadow-none"
                        >
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-14 rounded-2xl p-2 flex items-center justify-center shrink-0 shadow-inner bg-zinc-50 dark:bg-black border border-zinc-100 dark:border-zinc-800">
                                {method.logoId ? (
                                  <Image
                                    src={getCloudinaryLogoUrl(method.logoId)}
                                    alt="Logo"
                                    width={45}
                                    height={45}
                                    className="object-contain"
                                  />
                                ) : (
                                  <CreditCard className="w-8 h-8 text-emerald-500" />
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-black tracking-tight text-zinc-900 dark:text-white">
                                  {method.bankName || (isTelebirr ? "Telebirr" : "Bank")}
                                </span>
                                <p className="text-[10px] font-bold text-zinc-400">
                                  {method.type?.charAt(0).toUpperCase() + method.type?.slice(1).toLowerCase()}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex flex-col gap-1.5">
                              <span className="text-[11px] font-bold text-zinc-400">Name</span>
                              <span className="text-base font-black text-zinc-800 dark:text-zinc-100">
                                {method.holderName}
                              </span>
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-2xl border-2 transition-all bg-zinc-50 dark:bg-black border-transparent hover:border-zinc-200 dark:hover:border-zinc-800">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold mb-0.5 text-zinc-400">
                                  {isTelebirr ? "Phone Number" : "Account Number"}
                                </span>
                                <span className="text-sm font-black tracking-wider text-zinc-900 dark:text-white">
                                  {method.accountNumber || method.phoneNumber}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(method.accountNumber || method.phoneNumber);
                                  setCopiedId(method.id);
                                  setTimeout(() => setCopiedId(null), 2000);
                                }}
                                className={`p-2.5 rounded-xl transition-all active:scale-90 relative ${copiedId === method.id
                                  ? "bg-emerald-500 text-white shadow-sm"
                                  : "bg-white dark:bg-zinc-900 shadow-sm text-emerald-600"
                                  }`}
                              >
                                {copiedId === method.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-zinc-500 ml-1">Payment Screenshot</label>
                    <label className="relative block group cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadProgress(prev => ({ ...prev, paymentProof: true }));
                          const formDataToUpload = new FormData();
                          formDataToUpload.append("file", file);
                          formDataToUpload.append("upload_preset", "pioneerbusiness");
                          try {
                            const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                              method: 'POST',
                              body: formDataToUpload
                            });
                            const data = await res.json();
                            setFormData(prev => ({ ...prev, paymentProof: data.public_id }));
                          } catch (err) {
                            console.error(err);
                          } finally {
                            setUploadProgress(prev => ({ ...prev, paymentProof: false }));
                          }
                        }}
                      />
                      <div className={`aspect-video relative rounded-3xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden p-0 transition-all ${formData.paymentProof ? "border-emerald-500/40" : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                        }`}>
                        {uploadProgress.paymentProof ? (
                          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                        ) : formData.paymentProof ? (
                          <div className="absolute inset-0 w-full h-full">
                            <Image
                              src={getCloudinaryLogoUrl(formData.paymentProof)}
                              alt="Payment Proof"
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="w-8 h-8 text-white" />
                            </div>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                            <span className="text-xs font-black text-zinc-400 uppercase tracking-tight">Upload Payment Proof</span>
                            <span className="text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-widest">(Screenshot or Photo)</span>
                          </>
                        )}
                      </div>
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setVerificationStep(2)}
                      className="flex-1 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-500 font-black text-sm active:scale-95 transition-all"
                    >
                      Back
                    </button>
                    <button
                      disabled={!formData.paymentProof || isSubmitting}
                      onClick={async () => {
                        if (!currentUser) return;
                        setIsSubmitting(true);
                        const res = await submitWorkerVerificationServer(currentUser.uid, formData);
                        if (res.success) {
                          setShowVerificationModal(false);
                          setShowSuccess(true);
                          setIsVerified(false); // Still false until admin approves
                        } else {
                          alert("Error: " + res.error);
                        }
                        setIsSubmitting(false);
                      }}
                      className="flex-[2] h-14 rounded-2xl bg-emerald-600 text-white font-black text-sm shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Check className="w-5 h-5" /> Finish Registration</>}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" />
          <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 border border-zinc-100 dark:border-zinc-800 text-center">
            <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2">Registration Submitted!</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed mb-8 px-4">
              Our team will verify your documents within 24 hours. You can track your status in your dashboard.
            </p>
            <button
              onClick={() => {
                setShowSuccess(false);
                router.push("/user/work");
              }}
              className="w-full h-14 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black font-black text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Okay
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
