"use client";

import { useState, useRef, useEffect } from "react";
import { Image as IconImage, Loader2, Plus, Edit2, Trash2, X, Upload, Save, CheckCircle, RefreshCw } from "lucide-react";
import { getBannersServer, addBannerServer, updateBannerServer, deleteBannerServer } from "./actions";
import Image from "next/image";

export default function AddBannerPage() {
    const [banners, setBanners] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBanner, setCurrentBanner] = useState<any>(null);
    const [name, setName] = useState("");
    const [publicId, setPublicId] = useState("");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        setIsLoading(true);
        try {
            const data = await getBannersServer();
            setBanners(data);
        } catch (error) {
            console.error("Error fetching banners:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (banner: any = null) => {
        setCurrentBanner(banner);
        setName(banner ? banner.name : "");
        setPublicId(banner ? banner.imageId : "");
        setPreviewUrl(banner ? getCloudinaryUrl(banner.imageId) : null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentBanner(null);
        setName("");
        setPublicId("");
        if (previewUrl && !currentBanner) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
    };

    const getCloudinaryUrl = (id: string) => {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        return `https://res.cloudinary.com/${cloudName}/image/upload/${id}`;
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Local preview
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
                        folder: "banners",
                    }
                })
            });

            const { signature, timestamp, apiKey } = await signResponse.json();

            const formData = new FormData();
            formData.append("file", file);
            formData.append("api_key", apiKey);
            formData.append("timestamp", timestamp.toString());
            formData.append("signature", signature);
            formData.append("folder", "banners");

            const uploadResponse = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                { method: "POST", body: formData }
            );

            const uploadData = await uploadResponse.json();

            if (uploadData.public_id) {
                setPublicId(uploadData.public_id);
            } else {
                throw new Error("Upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload image");
            setPreviewUrl(currentBanner ? getCloudinaryUrl(currentBanner.imageId) : null);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !publicId) return;

        setIsSaving(true);
        try {
            if (currentBanner) {
                await updateBannerServer(currentBanner.id, { name, imageId: publicId });
            } else {
                await addBannerServer({ name, imageId: publicId });
            }
            fetchBanners();
            handleCloseModal();
        } catch (error) {
            alert("Failed to save banner");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this banner?")) return;
        try {
            await deleteBannerServer(id);
            fetchBanners();
        } catch (error) {
            alert("Failed to delete banner");
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 md:px-8 bg-black min-h-screen text-slate-200">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight mb-2 flex items-center gap-3">
                        <IconImage className="h-10 w-10 text-emerald-500" />
                        Banner Management
                    </h1>
                    <p className="text-slate-400 font-medium">Add, edit, and manage promotional banners for the platform.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-3 rounded-2xl font-black transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                >
                    <Plus className="h-5 w-5" />
                    New Banner
                </button>
            </div>

            {/* Content Section */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] backdrop-blur-xl">
                    <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
                    <span className="text-sm font-black text-slate-500 animate-pulse">Loading Banners...</span>
                </div>
            ) : banners.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] backdrop-blur-xl group">
                    <div className="h-20 w-20 bg-slate-950 rounded-[2rem] border border-slate-800 flex items-center justify-center mb-6 text-slate-600 group-hover:scale-110 transition-transform">
                        <IconImage className="h-10 w-10" />
                    </div>
                    <span className="text-lg font-bold text-slate-400 mb-2">No Banners Found</span>
                    <button onClick={() => handleOpenModal()} className="text-emerald-500 font-black text-xs hover:text-emerald-400">Add your first banner</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {banners.map((banner) => (
                        <div key={banner.id} className="group relative bg-slate-900/60 border border-slate-800 rounded-[2.5rem] overflow-hidden backdrop-blur-xl hover:border-emerald-500/30 transition-all shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-1">
                            <div className="aspect-[21/9] relative overflow-hidden bg-slate-950">
                                <Image 
                                    src={getCloudinaryUrl(banner.imageId)} 
                                    alt={banner.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                                />
                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-slate-950 to-transparent" />
                                
                                {/* Quick Actions */}
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-[-10px] group-hover:translate-y-0 transition-all duration-300">
                                    <button 
                                        onClick={() => handleOpenModal(banner)}
                                        className="h-10 w-10 bg-white/10 hover:bg-emerald-500 rounded-xl flex items-center justify-center text-white hover:text-slate-950 backdrop-blur-md border border-white/10 transition-all shadow-lg"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(banner.id)}
                                        className="h-10 w-10 bg-white/10 hover:bg-rose-500 rounded-xl flex items-center justify-center text-white backdrop-blur-md border border-white/10 transition-all shadow-lg"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-6">
                                <h3 className="text-xl font-black text-white truncate mb-1">{banner.name}</h3>
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-black">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    {new Date(banner.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 px-6">
                    <div className="bg-slate-950 border border-slate-800 w-full max-w-xl rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full" />
                        
                        <div className="p-10 relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-3xl font-black text-white tracking-tight">
                                    {currentBanner ? "Edit Banner" : "New Banner"}
                                </h2>
                                <button onClick={handleCloseModal} className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500 hover:text-white transition-colors border border-slate-800">
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 pl-1">Banner Placement / Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Home Page Hero"
                                        className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-6 py-4 text-white placeholder:text-slate-700 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-bold"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 pl-1">Image Asset</label>
                                    <div 
                                        onClick={() => !isUploading && fileInputRef.current?.click()}
                                        className={`aspect-[21/9] rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all relative overflow-hidden group
                                            ${isUploading ? 'border-emerald-500/50 bg-emerald-500/5' : 
                                              previewUrl ? 'border-emerald-500/40 bg-black shadow-2xl' : 
                                              'border-slate-800 bg-slate-950/50 hover:border-slate-600 hover:bg-slate-950'}`}
                                    >
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            ref={fileInputRef} 
                                            onChange={handleFileUpload} 
                                            accept="image/*" 
                                        />
                                        
                                        {previewUrl ? (
                                            <div className="absolute inset-0 w-full h-full">
                                                <Image 
                                                    src={previewUrl} 
                                                    alt="Preview"
                                                    fill
                                                    className={`object-cover transition-opacity duration-500 ${isUploading ? 'opacity-40 grayscale' : 'opacity-100'}`}
                                                />
                                                {isUploading && (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                                                        <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
                                                        <div className="text-sm text-white font-black animate-pulse">Uploading...</div>
                                                    </div>
                                                )}
                                                {!isUploading && (
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/40 backdrop-blur-sm">
                                                        <div className="flex flex-col items-center">
                                                            <div className="h-14 w-14 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md border border-white/20 mb-3 transition-all scale-90 group-hover:scale-100">
                                                                <RefreshCw className="h-6 w-6" />
                                                            </div>
                                                            <span className="text-[10px] text-white font-black">Change Image</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="p-8 flex flex-col items-center">
                                                <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 text-slate-600 group-hover:text-emerald-500 transition-all border border-slate-800 shadow-lg">
                                                    <Upload className="h-8 w-8" />
                                                </div>
                                                <div className="text-sm text-slate-400 font-bold mb-1">Select Banner Image</div>
                                                <div className="text-[10px] text-slate-600 font-black italic">PNG, JPG or WebP (max 5MB)</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={isSaving || isUploading || !name || !publicId}
                                    className={`w-full py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95
                                        ${(!name || !publicId) ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 
                                          'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'}`}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-6 w-6" />
                                            <span>{currentBanner ? "Update Banner" : "Add Banner"}</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
