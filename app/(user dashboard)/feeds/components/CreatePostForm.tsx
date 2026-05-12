"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import { Camera, Video, X, Send, Loader2 } from "lucide-react";
import { useSession } from "@/app/store/useSession";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { useCreatePost } from "@/app/hooks/usePost";
import ImageCropper from "@/app/components/ui/ImageCropper";
import { IMAGE_CONFIG } from "@/app/utils/image";

export default function CreatePostForm() {
  const { user } = useSession((state) => state);
  const { requireAuth } = useAuthGuard();
  const createPostMutation = useCreatePost();

  const [content, setContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<
    { url: string; type: "image" | "video" }[]
  >([]);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [pendingImageFiles, setPendingImageFiles] = useState<File[]>([]);
  const [cropIndex, setCropIndex] = useState(0);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video"
  ) => {
    const files = Array.from(e.target.files || []);

    if (type === "video") {
      const newPreviews = files.map((file) => ({
        url: URL.createObjectURL(file),
        type: "video" as const,
      }));
      setSelectedFiles((prev) => [...prev, ...files]);
      setPreviews((prev) => [...prev, ...newPreviews]);
    } else {
      // Start crop flow for images
      setPendingImageFiles(files);
      setCropIndex(0);
      setCropSrc(URL.createObjectURL(files[0]));
    }

    // Reset input
    e.target.value = "";
  };

  const handleCropComplete = (blob: Blob) => {
    const croppedFile = new File([blob], pendingImageFiles[cropIndex].name, { type: "image/jpeg" });

    if (cropSrc) URL.revokeObjectURL(cropSrc);

    // Add cropped file + preview
    const preview = URL.createObjectURL(croppedFile);
    setSelectedFiles((prev) => [...prev, croppedFile]);
    setPreviews((prev) => [...prev, { url: preview, type: "image" }]);

    const nextIndex = cropIndex + 1;
    if (nextIndex < pendingImageFiles.length) {
      setCropIndex(nextIndex);
      setCropSrc(URL.createObjectURL(pendingImageFiles[nextIndex]));
    } else {
      setCropSrc(null);
      setPendingImageFiles([]);
    }
  };

  const handleCropCancel = () => {
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    setCropSrc(null);
    setPendingImageFiles([]);
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index].url);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    requireAuth(() => {
      if (!content.trim() && selectedFiles.length === 0) return;

      const formData = new FormData();
      formData.append("content", content);
      selectedFiles.forEach((file) => {
        formData.append("media", file);
      });

      createPostMutation.mutate(formData, {
        onSuccess: () => {
          setContent("");
          previews.forEach((p) => URL.revokeObjectURL(p.url));
          setSelectedFiles([]);
          setPreviews([]);
        },
      });
    }, "create a post");
  };

  return (
    <div className="p-4 sm:p-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
      <div className="flex">
        <div className="w-12 h-12 rounded-full bg-gray-100 mr-3 overflow-hidden flex-shrink-0">
          {user?.photo ? (
            <Image
              className="object-cover w-full h-full"
              src={user.photo}
              height={48}
              width={48}
              alt="user"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500 font-medium">
              {user
                ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`
                : "?"}
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex-1">
          <textarea
            className="min-h-[80px] w-full resize-none bg-gray-50 p-3 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 focus:border-[var(--primary-color)]"
            name="post"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind? Share with the community"
          />

          {/* File Previews */}
          {previews.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {previews.map((preview, index) => (
                <div key={index} className="relative aspect-square">
                  {preview.type === "video" ? (
                    <video
                      src={preview.url}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Image
                      src={preview.url}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </form>
      </div>

      <div className="overflow-x-auto mt-4 pt-4 border-t border-gray-200 flex gap-2 items-center bg-white user-page-top button-hover-effect">
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFileSelect(e, "image")}
        />
        <button type="button" onClick={() => imageInputRef.current?.click()}>
          <Camera className="w-4 h-4" />
          <span>Photo</span>
        </button>

        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e, "video")}
        />
        <button type="button" onClick={() => videoInputRef.current?.click()}>
          <Video className="w-4 h-4" />
          <span>Video</span>
        </button>

        <button
          onClick={handleSubmit}
          disabled={
            createPostMutation.isPending ||
            (!content.trim() && selectedFiles.length === 0)
          }
          className="ml-auto px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg text-sm font-medium hover:bg-[var(--primary-color)]/90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {createPostMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>Post</span>
        </button>
      </div>

      {/* Crop Modal — no forced aspect, let user crop freely */}
      {cropSrc && (
        <ImageCropper
          imageSrc={cropSrc}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}
