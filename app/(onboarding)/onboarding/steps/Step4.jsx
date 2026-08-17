//============= END

// "use client";
// import { auth } from "@/lib/firebaseClient";
// import { supabase } from "@/lib/supabase";
// import { useRouter } from "next/navigation";
// import React, { useState } from "react";

// const Step2 = () => {
//   const [file, setFile] = useState(null);
//   const [uploading, setUploading] = useState(false);
//   const [fileURL, setFileURL] = useState("");
//   const router = useRouter();

//   const handleImageChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   const handleUpload = async () => {
//     try {
//       setUploading(true);
//       if (!file) {
//         alert("Please select a file to upload");
//         return;
//       }
//       const fileExt = file.name.split(".").pop();
//       const fileName = `${Math.random()}.${fileExt}`;
//       const filePath = `${fileName}`;

//       let { data, error } = await supabase.storage
//         .from("ImageBucket")
//         .upload(filePath, file);

//       if (error) {
//         throw error;
//       }
//       const { data: url } = await supabase.storage
//         .from("ImageBucket")
//         .getPublicUrl(filePath);

//       console.log(url.publicUrl, "PUBLIC URL");

//       const user = auth.currentUser;
//       const token = await user.getIdToken();
//       const response = await fetch("/api/onboarding/ImageUpload", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           profileImage: url.publicUrl,
//           onboardPage: 3,
//           isOnboardingComplete: false,
//         }),
//       });
//       console.log(response, "IMAGE UPLOADER RESPOSNE");
//       setFileURL(url.publicUrl);
//       router.push("/onboarding/3");
//     } catch (error) {
//       console.log(error, "IMAGE UPLOAD ERROR");
//       alert(`Error uploading file:${error.message}`);
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <div>
//       <input type="file" accept="image/*" onChange={handleImageChange} />
//       <button onClick={handleUpload} disabled={uploading}>
//         {uploading ? "Uploading..." : "Upload"}
//       </button>
//       {fileURL && (
//         <div>
//           {/* <p>File uploaded to:{fileURL}</p> */}
//           {/* <Image src={fileURL} alt="Uploaded File" width={50} height={40}  /> */}
//           <img src={fileURL} alt="Uploaded File" width={50} height={40} />
//         </div>
//       )}
//     </div>
//   );
// };

// export default Step2;

"use client";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

const Step4 = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  // const onboardPage = useSelector((state) => state.user.onboardPage);

  // Clean up object URL when file changes or component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);


  const validateFile = (selectedFile) => {
    if (!ACCEPTED_TYPES.includes(selectedFile.type)) {
      return "Only JPG, PNG, or WEBP images are allowed";
    }
    if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `Image must be under ${MAX_FILE_SIZE_MB}MB`;
    }
    return null;
  };

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setFile(selectedFile);

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleRemove = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${Date.now()}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("ImageBucket")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("ImageBucket")
        .getPublicUrl(filePath);

      const {onboardPage}=await dispatch(step4Onboarding({ profileImage: urlData.publicUrl })).unwrap();
      router.push(`/onboarding/${onboardPage}`);
    } catch (err) {
      console.error("Image upload error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-5 md:px-16 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Add a Profile Photo
          </h1>
          <p className="mt-2 text-sm md:text-base text-gray-500">
            Help others recognize you. You can always change this later.
          </p>
        </div>

        {/* Upload / Preview area */}
        <div className="relative w-full aspect-square rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center overflow-hidden">
          {previewUrl ? (
            <>
              <img
                src={previewUrl}
                alt="Selected profile"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className="absolute top-3 right-3 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors disabled:opacity-50"
                aria-label="Remove selected image"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <label
              htmlFor="profile-image-input"
              className="flex flex-col items-center justify-center gap-2 cursor-pointer text-gray-400 hover:text-gray-500 transition-colors p-6 text-center"
            >
              <ImageIcon className="h-10 w-10" />
              <span className="text-sm font-medium">
                Click to select a photo
              </span>
              <span className="text-xs">
                JPG, PNG or WEBP · up to {MAX_FILE_SIZE_MB}MB
              </span>
            </label>
          )}

          <input
            id="profile-image-input"
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            disabled={uploading}
            className="hidden"
          />
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-500 text-center">{error}</p>
        )}

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading || !file}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {uploading && (
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            )}
            {uploading ? "Uploading..." : "Continue"}
          </button>

          {!uploading && (
            <button
              type="button"
              onClick={() => router.push(`/onboarding/${onboardPage + 1}`)}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Skip for now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step4;
