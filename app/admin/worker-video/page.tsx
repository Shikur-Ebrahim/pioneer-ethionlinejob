"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle, Loader2, Pencil, Plus, Trash2, Video } from "lucide-react";
import {
  addWorkerVideoServer,
  deleteWorkerVideoServer,
  getWorkerVideosServer,
  updateWorkerVideoServer,
} from "./actions";

type WorkerVideo = {
  id: string;
  imageId: string;
  mediaType?: string;
  createdAt?: string | null;
};

export default function WorkerVideoPage() {
  const [videos, setVideos] = useState<WorkerVideo[]>([]);
  const [publicId, setPublicId] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getCloudinaryVideoUrl = (id: string) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    return `https://res.cloudinary.com/${cloudName}/video/upload/${id}`;
  };

  const resetEditor = () => {
    setPublicId("");
    setPreviewUrl(null);
    setEditingId(null);
  };

  const loadVideos = async () => {
    setIsLoadingList(true);
    try {
      const rows = (await getWorkerVideosServer()) as WorkerVideo[];
      setVideos(rows || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load worker videos.");
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreviewUrl(localUrl);
    setPublicId("");

    setIsUploading(true);
    try {
      const signResponse = await fetch("/api/admin/cloudinary-sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paramsToSign: {
            timestamp: Math.round(new Date().getTime() / 1000),
            folder: "worker_videos",
          },
        }),
      });

      const { signature, timestamp, apiKey } = await signResponse.json();
      if (!signature || !timestamp || !apiKey) {
        throw new Error("Failed to get upload signature");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", "worker_videos");

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`,
        { method: "POST", body: formData }
      );
      const uploadData = await uploadResponse.json();

      if (uploadData.public_id) {
        setPublicId(uploadData.public_id);
        return;
      }

      throw new Error(uploadData.error?.message || "Upload failed");
    } catch (error: any) {
      console.error("Upload error:", error);
      alert("Failed to upload video: " + (error?.message || "Unknown error"));
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!publicId) return;

    setIsSaving(true);
    try {
      if (editingId) {
        await updateWorkerVideoServer(editingId, { imageId: publicId, mediaType: "video" });
      } else {
        await addWorkerVideoServer({ imageId: publicId, mediaType: "video" });
      }

      resetEditor();
      await loadVideos();
      alert(editingId ? "Worker video updated." : "Worker video added.");
    } catch (error) {
      console.error(error);
      alert("Failed to save worker video.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (video: WorkerVideo) => {
    setEditingId(video.id);
    setPublicId(video.imageId);
    setPreviewUrl(getCloudinaryVideoUrl(video.imageId));
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this worker video?");
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await deleteWorkerVideoServer(id);
      if (editingId === id) resetEditor();
      await loadVideos();
    } catch (error) {
      console.error(error);
      alert("Failed to delete video.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-zinc-900 dark:text-zinc-100">Worker Video</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Add multiple worker videos. You can edit or delete saved videos any time.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1.4fr]">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {editingId ? "Edit Worker Video" : "Add Worker Video"}
          </h2>

          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`group relative aspect-video w-full cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all ${
              isUploading
                ? "border-blue-400 bg-blue-50 dark:bg-blue-500/10"
                : "border-zinc-300 bg-zinc-100 hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            {previewUrl ? (
              <video
                src={previewUrl}
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                controls
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center text-zinc-500">
                <Video className="mb-2 h-8 w-8" />
                <p className="text-sm font-semibold">Click to upload worker video</p>
              </div>
            )}

            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={handleSave}
              disabled={!publicId || isSaving || isUploading}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  {editingId ? <CheckCircle className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {editingId ? "Update Video" : "Add Video"}
                </>
              )}
            </button>

            {editingId && (
              <button
                onClick={resetEditor}
                className="rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-100">Saved Worker Videos</h2>

          {isLoadingList ? (
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading videos...
            </div>
          ) : videos.length === 0 ? (
            <p className="text-sm text-zinc-500">No videos yet. Add your first worker video.</p>
          ) : (
            <div className="space-y-4">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"
                >
                  <div className="aspect-video overflow-hidden rounded-lg bg-black">
                    <video
                      src={getCloudinaryVideoUrl(video.imageId)}
                      className="h-full w-full object-cover"
                      controls
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="truncate text-xs text-zinc-500">{video.imageId}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(video)}
                        className="inline-flex items-center gap-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(video.id)}
                        disabled={deletingId === video.id}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-red-300"
                      >
                        {deletingId === video.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
