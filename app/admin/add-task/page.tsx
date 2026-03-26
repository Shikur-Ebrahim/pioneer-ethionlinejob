"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Loader2, 
  Upload, 
  CheckCircle, 
  RefreshCw, 
  Zap,
  Youtube,
  Instagram,
  Facebook,
  Globe,
  Video,
  Users,
  Clock,
  Image as IconImage
} from "lucide-react";
import { addTaskServer } from "./actions";
import Image from "next/image";

const platforms = [
  { id: "tiktok", name: "TikTok", icon: <Zap className="w-4 h-4" /> },
  { id: "youtube", name: "YouTube", icon: <Youtube className="w-4 h-4" /> },
  { id: "facebook", name: "Facebook", icon: <Facebook className="w-4 h-4" /> },
  { id: "instagram", name: "Instagram", icon: <Instagram className="w-4 h-4" /> },
  { id: "free", name: "Free", icon: <Globe className="w-4 h-4" /> },
];

const RICHEST_COUNTRIES = [
  "USA", "China", "Japan", "Germany", "India", "UK", "France", "Italy", "Brazil", "Canada",
  "Russia", "South Korea", "Australia", "Spain", "Mexico", "Indonesia", "Netherlands",
  "Saudi Arabia", "Turkey", "Switzerland", "Poland", "Taiwan", "Argentina", "Sweden", "Belgium"
];

export default function AddTaskPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [publicId, setPublicId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Logo upload state
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [logoId, setLogoId] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    platform: "tiktok",
    adPrice: "",
    workerPrice: "",
    socialMediaPrice: "",
    totalViews: "",
    viewsUnit: "M" as "K" | "M" | "B",
    targetUsers: "",
    timeAchieved: "",
    timeUnit: "Hour" as "Min" | "Hour" | "Day",
  });

  const [targetCountries, setTargetCountries] = useState<string[]>([]);
  const [countryPercentages, setCountryPercentages] = useState<Record<string, string>>({});

  const toggleCountry = (country: string) => {
    setTargetCountries(prev => 
      prev.includes(country) ? prev.filter(c => c !== country) : [...prev, country]
    );
  };

  const handlePercentageChange = (country: string, value: string) => {
    setCountryPercentages(prev => ({ ...prev, [country]: value }));
  };

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
      if (logoPreviewUrl && logoPreviewUrl.startsWith("blob:")) URL.revokeObjectURL(logoPreviewUrl);
    };
  }, [previewUrl, logoPreviewUrl]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setLogoPreviewUrl(localUrl);
    setIsLogoUploading(true);

    try {
      const signResponse = await fetch("/api/admin/cloudinary-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paramsToSign: {
            timestamp: Math.round(new Date().getTime() / 1000),
            folder: "tasks_logos",
          }
        })
      });

      const { signature, timestamp, apiKey } = await signResponse.json();

      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("api_key", apiKey);
      uploadData.append("timestamp", timestamp.toString());
      uploadData.append("signature", signature);
      uploadData.append("folder", "tasks_logos");

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
      setLogoPreviewUrl(null);
    } finally {
      setIsLogoUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    setMediaType(isVideo ? "video" : "image");

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
            folder: "tasks_media",
          }
        })
      });

      const { signature, timestamp, apiKey } = await signResponse.json();

      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("api_key", apiKey);
      uploadData.append("timestamp", timestamp.toString());
      uploadData.append("signature", signature);
      uploadData.append("folder", "tasks_media");

      const resourceType = isVideo ? "video" : "image";
      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
        { method: "POST", body: uploadData }
      );

      const data = await uploadResponse.json();

      if (data.public_id) {
        setPublicId(data.public_id);
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload media");
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicId) {
      alert("Please upload a photo or video first");
      return;
    }

    const totalPercentage = targetCountries.reduce((acc, c) => acc + (parseFloat(countryPercentages[c]) || 0), 0);
    if (totalPercentage > 100) {
      alert(`Total allocation (${totalPercentage}%) cannot exceed 100%. Please adjust the percentages.`);
      return;
    }

    const totalViewsNum = (parseFloat(formData.totalViews) || 0) * (
      formData.viewsUnit === "K" ? 1000 : 
      formData.viewsUnit === "M" ? 1000000 : 
      formData.viewsUnit === "B" ? 1000000000 : 1
    );

    setIsSaving(true);
    try {
      await addTaskServer({
        platform: formData.platform,
        adPrice: parseFloat(formData.adPrice),
        workerPrice: parseFloat(formData.workerPrice),
        socialMediaPrice: parseFloat(formData.socialMediaPrice),
        mediaId: publicId,
        mediaType,
        ...(logoId ? { logoId } : {}),
        campaign: {
          totalViews: formData.totalViews + formData.viewsUnit,
          targetUsers: formData.targetUsers,
          timeAchieved: formData.timeAchieved + " " + formData.timeUnit,
          targetCountries: targetCountries.map(c => {
            const percentage = parseFloat(countryPercentages[c] || "0");
            const countryViews = (totalViewsNum * percentage) / 100;
            return {
              country: c,
              percentage: percentage, // keep percentage for UI if needed
              exactViews: countryViews.toLocaleString() + " Views" // Store exact calculated value
            };
          })
        }
      });
      alert("Task created successfully!");
      router.push("/admin");
    } catch (error) {
      alert("Failed to create task");
    } finally {
      setIsSaving(false);
    }
  };

  const totalViewsNum = (parseFloat(formData.totalViews) || 0) * (
    formData.viewsUnit === "K" ? 1000 : 
    formData.viewsUnit === "M" ? 1000000 : 
    formData.viewsUnit === "B" ? 1000000000 : 1
  );

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight mb-2">
          Create New Task
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg">Upload content and set pricing for the new task.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Media Section */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden backdrop-blur-xl">
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-emerald-500/5 blur-[60px] rounded-full" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-zinc-500">Task Media</span>
                {previewUrl && (
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black ${mediaType === 'video' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    {mediaType}
                  </span>
                )}
              </div>

              <div 
                className={`aspect-square rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center text-center transition-all relative overflow-hidden
                  ${isUploading ? 'border-emerald-500/50 bg-emerald-500/5' : 
                    previewUrl ? 'border-emerald-500/40 bg-zinc-50 dark:bg-black' : 
                    'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50'}`}
              >
                {previewUrl ? (
                  <div className="absolute inset-0 w-full h-full">
                    {mediaType === "video" ? (
                      <video 
                        src={previewUrl} 
                        className={`w-full h-full object-cover transition-opacity duration-500 ${isUploading ? 'opacity-40 grayscale' : 'opacity-100'}`}
                        autoPlay 
                        muted 
                        loop 
                        playsInline
                      />
                    ) : (
                      <Image 
                        src={previewUrl} 
                        alt="Preview"
                        fill
                        className={`object-cover transition-opacity duration-500 ${isUploading ? 'opacity-40 grayscale' : 'opacity-100'}`}
                      />
                    )}
                  </div>
                ) : (
                  <div className="p-8 flex flex-col items-center">
                    <div className="h-20 w-20 bg-white dark:bg-zinc-900 rounded-[1.5rem] flex items-center justify-center mb-6 text-zinc-300 dark:text-zinc-700 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                      {mediaType === 'video' ? <Video className="w-10 h-10" /> : <IconImage className="w-10 h-10" />}
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-500 font-medium italic">No media selected yet</p>
                  </div>
                )}

                {isUploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] z-20">
                    <Loader2 className="h-12 w-12 text-emerald-500 animate-spin mb-4" />
                    <div className="text-sm text-white font-black animate-pulse">Uploading...</div>
                  </div>
                )}
              </div>

              <button 
                type="button"
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className="w-full py-4 rounded-2xl bg-zinc-900 dark:bg-zinc-50 text-white dark:text-black font-black hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 border border-zinc-800 dark:border-zinc-200 shadow-lg"
              >
                {previewUrl ? <RefreshCw className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                <span>{previewUrl ? "Change Photo or Video" : "Select Video or Photo"}</span>
              </button>
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*,video/*" 
              />
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Platform */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-xl space-y-8 relative overflow-hidden backdrop-blur-xl">
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-500/5 blur-[60px] rounded-full" />

            <div className="relative z-10 space-y-8">
              {/* Platform Selection */}
              <div className="space-y-4">
                <label className="text-xs font-black text-zinc-500 pl-1">
                  Social Media Platform
                </label>
                <div className="flex flex-wrap gap-2">
                  {platforms.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, platform: p.id })}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all border ${
                        formData.platform === p.id 
                          ? 'bg-emerald-500 border-emerald-500 text-zinc-950 shadow-lg shadow-emerald-500/20 scale-105' 
                          : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-600'
                      }`}
                    >
                      {p.icon}
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo Upload */}
              <div className="space-y-3">
                <label className="text-xs font-black text-zinc-500 pl-1">
                  Platform Logo
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex-shrink-0 flex items-center justify-center">
                    {logoPreviewUrl ? (
                      <Image src={logoPreviewUrl} alt="Logo" fill className={`object-cover ${isLogoUploading ? 'opacity-40' : ''}`} />
                    ) : formData.platform === "free" ? (
                      <Image src="/logo.png" alt="Free Default" fill className="object-contain p-2" />
                    ) : (
                      <IconImage className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
                    )}
                    {isLogoUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => !isLogoUploading && logoInputRef.current?.click()}
                      className="w-full py-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold text-xs hover:border-zinc-400 dark:hover:border-zinc-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {logoPreviewUrl ? 'Change Logo' : 'Upload Logo'}
                    </button>
                    <p className="text-[10px] text-zinc-400 mt-1.5 pl-1">Upload TikTok, YouTube, etc. logo</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    ref={logoInputRef}
                    onChange={handleLogoUpload}
                    accept="image/*"
                  />
                </div>
              </div>

              {/* Advanced Campaign Targeting */}
              <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Globe className="w-4 h-4 text-blue-500" />
                  </div>
                  <h3 className="text-sm font-black text-zinc-900 dark:text-white">Campaign Targeting</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 pl-1">Total Views</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={formData.totalViews} 
                        onChange={(e) => setFormData({ ...formData, totalViews: e.target.value })}
                        placeholder="e.g. 1"
                        className="flex-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-500/50 min-w-0"
                      />
                      <select 
                        value={formData.viewsUnit} 
                        onChange={(e) => setFormData({ ...formData, viewsUnit: e.target.value as "K" | "M" | "B" })}
                        className="w-20 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2 py-3 text-sm font-black focus:outline-none cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600 shrink-0"
                      >
                        <option value="K">K</option>
                        <option value="M">M</option>
                        <option value="B">B</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-400 pl-1">Target Workers</label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input 
                        type="text" 
                        value={formData.targetUsers} 
                        onChange={(e) => setFormData({ ...formData, targetUsers: e.target.value })}
                        placeholder="e.g. 1000"
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 pl-1">Time Achievement</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input 
                        type="text" 
                        value={formData.timeAchieved} 
                        onChange={(e) => setFormData({ ...formData, timeAchieved: e.target.value })}
                        placeholder="e.g. 48"
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                    <select 
                      value={formData.timeUnit} 
                      onChange={(e) => setFormData({ ...formData, timeUnit: e.target.value as any })}
                      className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2 py-3 text-sm font-black focus:outline-none cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600 w-24 shrink-0"
                    >
                      <option value="Min">Min</option>
                      <option value="Hour">Hour</option>
                      <option value="Day">Day</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-400 pl-1">Target Countries & %</label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                    {RICHEST_COUNTRIES.map(country => (
                      <button
                        key={country}
                        type="button"
                        onClick={() => toggleCountry(country)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                          targetCountries.includes(country)
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-blue-500/50'
                        }`}
                      >
                        {country}
                      </button>
                    ))}
                  </div>

                  {targetCountries.length > 0 && (
                    <div className="space-y-2 mt-4 bg-zinc-50/50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <p className="text-[10px] font-black text-zinc-400 mb-3">Set View Distribution (%)</p>
                      <div className="grid grid-cols-1 gap-2">
                        {targetCountries.map(country => {
                          const percentage = parseFloat(countryPercentages[country] || "0");
                          const countryViews = (totalViewsNum * percentage) / 100;
                          const exactViewsStr = countryViews.toLocaleString() + " Views";
                          
                          return (
                            <div key={country} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800">
                              <div className="flex flex-col">
                                <span className="text-xs font-black text-zinc-900 dark:text-white">{country}</span>
                                <span className="text-[10px] font-bold text-blue-500">{exactViewsStr}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <input 
                                  type="text" 
                                  value={countryPercentages[country] || ""} 
                                  onChange={(e) => handlePercentageChange(country, e.target.value)}
                                  placeholder="0"
                                  className="w-14 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-xs font-black text-right focus:outline-none focus:border-blue-500"
                                />
                                <span className="text-[10px] font-black text-zinc-400">%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-[10px] font-black">
                        <span className="text-zinc-400">Total Allocation</span>
                        <span className={`${
                          Object.values(countryPercentages).reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0) > 100 
                            ? 'text-rose-500' 
                            : 'text-emerald-500'
                        }`}>
                          {Object.values(countryPercentages).reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500 pl-1">
                      Advertising Price
                    </label>
                    <div className="relative group">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-black text-zinc-400 group-focus-within:text-emerald-500 transition-colors select-none">Birr</span>
                      <input 
                        type="text"
                        inputMode="decimal"
                        required
                        value={formData.adPrice}
                        onChange={(e) => setFormData({ ...formData, adPrice: e.target.value })}
                        placeholder="0.00"
                        className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl pl-14 pr-6 py-4 text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500 pl-1">
                      Worker Pay
                    </label>
                    <div className="relative group">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-black text-emerald-500 select-none">Birr</span>
                      <input 
                        type="text"
                        inputMode="decimal"
                        required
                        value={formData.workerPrice}
                        onChange={(e) => setFormData({ ...formData, workerPrice: e.target.value })}
                        placeholder="0.00"
                        className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-2xl pl-14 pr-6 py-4 text-zinc-900 dark:text-white placeholder:text-emerald-500/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-bold"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-500 pl-1">
                    Pay for Social Media
                  </label>
                  <div className="relative group">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xs font-black text-blue-400 group-focus-within:text-blue-500 transition-colors select-none">Birr</span>
                    <input 
                      type="text"
                      inputMode="decimal"
                      required
                      value={formData.socialMediaPrice}
                      onChange={(e) => setFormData({ ...formData, socialMediaPrice: e.target.value })}
                      placeholder="0.00"
                      className="w-full bg-blue-500/5 border border-blue-500/20 rounded-2xl pl-14 pr-6 py-4 text-zinc-900 dark:text-white placeholder:text-blue-500/30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleSubmit}
                  disabled={isSaving || isUploading || !publicId}
                  className={`w-full py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95
                    ${(!publicId) ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 cursor-not-allowed' : 
                      'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/20'}`}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>Saving Task...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-6 w-6" />
                      <span>Publish Task</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
