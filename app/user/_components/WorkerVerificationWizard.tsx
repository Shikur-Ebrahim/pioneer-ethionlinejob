"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Loader2,
  ArrowRight,
  X,
  User,
  CreditCard,
  Upload,
  CheckCircle2,
  Copy,
  ChevronRight,
  ShieldCheck,
  Smartphone,
  Check,
  Camera,
} from "lucide-react";
import { firebaseAuth } from "@/lib/firebase/client";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { submitWorkerVerificationServer } from "@/app/user/work/actions";
import { getPaymentMethods } from "@/app/admin/payment-methods/actions";

function getCloudinaryLogoUrl(publicId: string) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
}

export type WorkerVerificationWizardProps = {
  variant: "modal" | "page";
  onClose: () => void;
  successHref?: string;
};

export function WorkerVerificationWizard({
  variant,
  onClose,
  successHref = "/user/work",
}: WorkerVerificationWizardProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
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
        const allMethods = (await getPaymentMethods()) as any[];
        if (allMethods.length > 0) {
          const active = allMethods.find((m) => m.status === "active");
          const src = active ?? allMethods[0];
          setRegistrationFee(Number(src?.workerFee) || 100);
        }
        setPaymentMethods(allMethods.filter((m) => m.status === "active"));
      }
    });
    return () => unsubscribe();
  }, []);

  const headerBlock = (
    <div className={`flex items-center justify-between ${variant === "modal" ? "px-8 pt-8 pb-4" : "pb-4"}`}>
      <div>
        <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">Worker Verification</h2>
        <div className="flex items-center gap-2 mt-1">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 rounded-full transition-all duration-300 ${
                verificationStep >= s ? "w-8 bg-emerald-500" : "w-4 bg-zinc-200 dark:bg-zinc-800"
              }`}
            />
          ))}
          <span className="text-[11px] font-bold text-zinc-500 ml-2">Step {verificationStep} of 3</span>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-colors"
        aria-label="Close and go back"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );

  const scrollClass =
    variant === "modal" ? "px-8 pb-8 pt-4 max-h-[70vh] overflow-y-auto" : "px-1 pb-8 pt-2 max-h-none overflow-visible sm:px-0";

  const stepBody = (
    <>
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
                      const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                      setFormData({ ...formData, phoneNumber: val });
                    }}
                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-2 border-transparent focus:border-emerald-500/50 dark:focus:border-emerald-500/30 transition-all text-sm font-bold"
                  />
                </div>
                {showErrors &&
                  (formData.phoneNumber.length !== 10 ||
                    (!formData.phoneNumber.startsWith("09") && !formData.phoneNumber.startsWith("07"))) && (
                    <p className="text-[10px] text-rose-500 font-medium ml-1">Must be 10 digits starting with 09 or 07</p>
                  )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const isNameValid = formData.fullName.length >= 5;
                const isPhoneValid =
                  formData.phoneNumber.length === 10 &&
                  (formData.phoneNumber.startsWith("09") || formData.phoneNumber.startsWith("07"));

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

        {verificationStep === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-2 text-center">
              <label className="text-[11px] font-bold text-zinc-500">Select ID Type</label>
              <div className="grid grid-cols-3 gap-2">
                {["kebele_id", "national_id", "passport"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, idType: type })}
                    className={`py-3 rounded-xl border-2 text-[10px] font-black transition-all ${
                      formData.idType === type
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                        : "bg-zinc-50 dark:bg-zinc-900 border-transparent text-zinc-500"
                    }`}
                  >
                    {type
                      .split("_")
                      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(" ")}
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
                      setUploadProgress((prev) => ({ ...prev, idFront: true }));
                      const formDataToUpload = new FormData();
                      formDataToUpload.append("file", file);
                      formDataToUpload.append("upload_preset", "pioneerbusiness");
                      try {
                        const res = await fetch(
                          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                          { method: "POST", body: formDataToUpload }
                        );
                        const data = await res.json();
                        setFormData((prev) => ({ ...prev, idFront: data.public_id }));
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setUploadProgress((prev) => ({ ...prev, idFront: false }));
                      }
                    }}
                  />
                  <div
                    className={`aspect-[4/3] relative rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden p-0 transition-all ${
                      formData.idFront ? "border-emerald-500/40" : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    {uploadProgress.idFront ? (
                      <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                    ) : formData.idFront ? (
                      <div className="absolute inset-0 w-full h-full">
                        <Image src={getCloudinaryLogoUrl(formData.idFront)} alt="ID Front" fill className="object-cover" />
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
                      setUploadProgress((prev) => ({ ...prev, idBack: true }));
                      const formDataToUpload = new FormData();
                      formDataToUpload.append("file", file);
                      formDataToUpload.append("upload_preset", "pioneerbusiness");
                      try {
                        const res = await fetch(
                          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                          { method: "POST", body: formDataToUpload }
                        );
                        const data = await res.json();
                        setFormData((prev) => ({ ...prev, idBack: data.public_id }));
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setUploadProgress((prev) => ({ ...prev, idBack: false }));
                      }
                    }}
                  />
                  <div
                    className={`aspect-[4/3] relative rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden p-0 transition-all ${
                      formData.idBack ? "border-emerald-500/40" : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    {uploadProgress.idBack ? (
                      <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                    ) : formData.idBack ? (
                      <div className="absolute inset-0 w-full h-full">
                        <Image src={getCloudinaryLogoUrl(formData.idBack)} alt="ID Back" fill className="object-cover" />
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
                type="button"
                onClick={() => setVerificationStep(1)}
                className="flex-1 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-500 font-black text-sm active:scale-95 transition-all"
              >
                Back
              </button>
              <button
                type="button"
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

        {verificationStep === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-black text-blue-600">Registration Fee</span>
                <span className="text-lg font-black text-blue-700 dark:text-blue-400">ETB {registrationFee}.00</span>
              </div>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium leading-relaxed">
                💼 Please pay the one-time registration fee to activate your worker account and start earning with our platform.
                Select a payment method below, copy the official phone number or account provided, and complete your payment using
                your preferred option. After payment, upload a clear screenshot of your payment proof for verification. Once your
                payment is confirmed, your account will be activated and you can begin working with our company.
              </p>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-medium leading-relaxed mt-2">
                ⚠️ Please make sure to send payment only to the official account provided.
              </p>
            </div>

            <div className="space-y-4 overflow-x-auto pb-4 -mx-2 px-2 flex gap-4 scrollbar-hide">
              {paymentMethods.map((method) => {
                const isTelebirr =
                  method.bankName?.toLowerCase().includes("telebirr") || method.type?.toLowerCase().includes("telebirr");

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
                        <span className="text-base font-black text-zinc-800 dark:text-zinc-100">{method.holderName}</span>
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
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(method.accountNumber || method.phoneNumber);
                            setCopiedId(method.id);
                            setTimeout(() => setCopiedId(null), 2000);
                          }}
                          className={`p-2.5 rounded-xl transition-all active:scale-90 relative ${
                            copiedId === method.id
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
                    setUploadProgress((prev) => ({ ...prev, paymentProof: true }));
                    const formDataToUpload = new FormData();
                    formDataToUpload.append("file", file);
                    formDataToUpload.append("upload_preset", "pioneerbusiness");
                    try {
                      const res = await fetch(
                        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                        { method: "POST", body: formDataToUpload }
                      );
                      const data = await res.json();
                      setFormData((prev) => ({ ...prev, paymentProof: data.public_id }));
                    } catch (err) {
                      console.error(err);
                    } finally {
                      setUploadProgress((prev) => ({ ...prev, paymentProof: false }));
                    }
                  }}
                />
                <div
                  className={`aspect-video relative rounded-3xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden p-0 transition-all ${
                    formData.paymentProof ? "border-emerald-500/40" : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                  }`}
                >
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
                type="button"
                onClick={() => setVerificationStep(2)}
                className="flex-1 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-500 font-black text-sm active:scale-95 transition-all"
              >
                Back
              </button>
              <button
                type="button"
                disabled={!formData.paymentProof || isSubmitting}
                onClick={async () => {
                  if (!currentUser) return;
                  setIsSubmitting(true);
                  const res = await submitWorkerVerificationServer(currentUser.uid, formData);
                  if (res.success) {
                    setShowSuccess(true);
                  } else {
                    alert("Error: " + res.error);
                  }
                  setIsSubmitting(false);
                }}
                className="flex-[2] h-14 rounded-2xl bg-emerald-600 text-white font-black text-sm shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Check className="w-5 h-5" /> Finish Registration
                  </>
                )}
              </button>
            </div>
          </div>
        )}
    </>
  );

  return (
    <>
      {variant === "modal" ? (
        <>
          {headerBlock}
          <div className={scrollClass}>{stepBody}</div>
        </>
      ) : (
        <div className="rounded-[2rem] border border-zinc-200/80 bg-white p-5 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 sm:p-8">
          {headerBlock}
          <div className={scrollClass}>{stepBody}</div>
        </div>
      )}

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
              type="button"
              onClick={() => {
                setShowSuccess(false);
                router.push(successHref);
              }}
              className="w-full h-14 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-black font-black text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Okay
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
