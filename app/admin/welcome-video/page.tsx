"use client";

import { useState, useRef, useEffect } from "react";
import { Video, Loader2, Save, Upload, CheckCircle, Play, RefreshCw } from "lucide-react";
import { addWelcomeVideoServer } from "./actions";

export default function WelcomeVideoPage() {
    const [publicId, setPublicId] = useState("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Clean up preview URL to avoid memory leaks
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Create local preview
        const localUrl = URL.createObjectURL(file);
        setPreviewUrl(localUrl);
        setPublicId(""); // Reset previous publicId if any

        setIsUploading(true);
        try {
            // 1. Get Signature from our API
            const signResponse = await fetch("/api/admin/cloudinary-sign", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    paramsToSign: {
                        timestamp: Math.round(new Date().getTime() / 1000),
                        folder: "welcome_videos",
                    }
                })
            });

            const { signature, timestamp, apiKey } = await signResponse.json();

            // 2. Upload to Cloudinary
            const formData = new FormData();
            formData.append("file", file);
            formData.append("api_key", apiKey);
            formData.append("timestamp", timestamp.toString());
            formData.append("signature", signature);
            formData.append("folder", "welcome_videos");

            const uploadResponse = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`,
                { method: "POST", body: formData }
            );

            const uploadData = await uploadResponse.json();

            if (uploadData.public_id) {
                setPublicId(uploadData.public_id);
            } else {
                throw new Error(uploadData.error?.message || "Upload failed");
            }
        } catch (error: any) {
            console.error("Upload error:", error);
            alert("Failed to upload video: " + error.message);
            setPreviewUrl(null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        if (!publicId) return;

        setIsSaving(true);
        try {
            await addWelcomeVideoServer({
                imageId: publicId,
                mediaType: "video",
            });
            alert("Welcome video updated and saved successfully!");
            // Optional: reset or show success state
        } catch (error) {
            alert("Failed to save to database");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto py-12 px-4">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-black text-white tracking-tight mb-3">Welcome Video</h1>
                <p className="text-slate-400 font-medium">Upload and set the introduction video for new users.</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full" />

                <div className="space-y-8 relative z-10">
                    <div 
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                        className={`aspect-video rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all relative overflow-hidden group
                            ${isUploading ? 'border-emerald-500/50 bg-emerald-500/5' : 
                              previewUrl ? 'border-emerald-500/40 bg-black shadow-2xl' : 
                              'border-slate-800 bg-slate-950/50 hover:border-slate-600 hover:bg-slate-950 shadow-inner'}`}
                    >
                        <input 
                            type="file" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                            accept="video/*" 
                        />
                        
                        {previewUrl ? (
                            <div className="absolute inset-0 w-full h-full">
                                <video 
                                    src={previewUrl} 
                                    className={`w-full h-full object-cover transition-opacity duration-500 ${isUploading ? 'opacity-40 grayscale' : 'opacity-100'}`}
                                    autoPlay 
                                    muted 
                                    loop 
                                    playsInline
                                />
                                {isUploading && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                                        <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
                                        <div className="text-sm text-white font-black uppercase tracking-[0.2em] animate-pulse">Uploading...</div>
                                    </div>
                                )}
                                {!isUploading && !isSaving && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/40 backdrop-blur-sm">
                                        <div className="flex flex-col items-center">
                                            <div className="h-14 w-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md border border-white/20 mb-3 transition-all scale-90 group-hover:scale-100">
                                                <RefreshCw className="h-6 w-6" />
                                            </div>
                                            <span className="text-[10px] text-white font-black uppercase tracking-widest">Change Video</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-8 flex flex-col items-center">
                                <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 text-zinc-500 group-hover:text-emerald-500 group-hover:scale-110 transition-all border border-slate-800 shadow-lg">
                                    <Upload className="h-8 w-8" />
                                </div>
                                <div className="text-sm text-zinc-300 font-bold uppercase tracking-widest mb-1">Select Video File</div>
                                <div className="text-[10px] text-zinc-600 uppercase font-black tracking-tighter">MP4, MOV or WEBM</div>
                            </div>
                        )}
                    </div>

                    <div className="pt-2">
                        <button 
                            onClick={handleSave}
                            disabled={isSaving || isUploading || !publicId}
                            className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95
                                ${!publicId ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 
                                  'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'}`}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle className={`h-6 w-6 ${!publicId ? 'opacity-20' : ''}`} />
                                    <span>Set as Welcome Video</span>
                                </>
                            )}
                        </button>
                    </div>
                    
                    {publicId && !isSaving && (
                        <div className="flex items-center justify-center gap-2 text-emerald-500/80 animate-in fade-in slide-in-from-bottom-2 duration-700">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Ready to save to database</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
