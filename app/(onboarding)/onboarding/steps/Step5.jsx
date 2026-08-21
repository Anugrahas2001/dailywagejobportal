"use client";

import Loading from "@/components/Loading";
import { step5Onboarding } from "@/lib/features/profiles/userThunk";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const Step5 = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const router = useRouter();
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  // null | "success" | "failed"
  const [active, setActive] = useState(false);
  const dispatch = useDispatch();

  const role = useSelector((state) => state.user.role);
  const status = useSelector((state) => state.user.status);

  useEffect(() => {
    // startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setLoading(true);

      // Stop any existing stream
      stopCamera();

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = mediaStream;

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;

        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            resolve();
          };
        });

        await videoRef.current.play();
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Unable to access camera.");
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    if (!video.videoWidth || !video.videoHeight) {
      alert("Camera is not ready yet.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(video, 0, 0);

    const image = canvas.toDataURL("image/png");

    setPhoto(image);

    stopCamera();
  };

  const retakePhoto = async () => {
    setPhoto(null);
    await startCamera();
  };

  const handleFaceVerification = async () => {
    try {
      setVerifying(true);

      const { onboardPage, isOnboardingComplete } = await dispatch(
        step5Onboarding({ profileImage: photo }),
      ).unwrap();

      console.log(isOnboardingComplete, role, "RESULT ANU DATA");

      if (isOnboardingComplete) {
        setVerificationStatus("success");

        if (role === "worker") {
          router.push("/workerDashboard");
        } else {
          router.push("/employerDashboard");
        }
      }

      console.log("Face verification result:");
    } catch (error) {
      console.log(error);
      setVerificationStatus("failed");
    } finally {
      setVerifying(false);
    }
  };

  console.log(photo, "CAPTURED PHOTO");

  const handleSkip = () => {
    stopCamera(); // Stop camera
    router.push(role === "worker" ? "/workerDashboard" : "/employerDashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-lg border p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Face Verification
          </h1>

          <p className="mt-2 text-gray-500">
            Take a clear selfie to verify your identity.
          </p>
        </div>

        {!active ? (
          <div className="flex flex-col items-center gap-4">
            {/* <button
              onClick={() => setActive(true)}
              className="rounded-lg bg-blue-600 px-8 py-3 text-white font-medium hover:bg-blue-700 transition"
            >
              Start Camera
            </button> */}

            <button
              onClick={async () => {
                setActive(true);
                await startCamera();
              }}
              className="rounded-lg bg-blue-600 px-8 py-3 text-white font-medium hover:bg-blue-700 transition"
            >
              Start Face Verification
            </button>

            <button
              onClick={handleSkip}
              className="text-gray-600 hover:text-black"
            >
              Skip for now
            </button>
          </div>
        ) : (
          <>
            {!photo ? (
              <div className="flex flex-col items-center gap-6">
                <div className="relative w-full max-w-lg aspect-[4/3] overflow-hidden rounded-xl border bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="h-full w-full object-cover"
                  />

                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white">
                      Opening Camera...
                    </div>
                  )}
                </div>

                <button
                  disabled={status === "pending" || loading}
                  onClick={capturePhoto}
                  className="rounded-lg bg-blue-600 px-8 py-3 text-white hover:bg-blue-700 disabled:bg-gray-400"
                >
                  Capture Selfie
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6">
                <img
                  src={photo}
                  alt="Captured Selfie"
                  className="w-full max-w-lg rounded-xl border object-cover"
                />

                {verificationStatus === "success" && (
                  <div className="w-full max-w-lg rounded-lg border border-green-300 bg-green-100 p-4 text-center text-green-700 font-medium">
                    ✅ Face verification successful! Redirecting...
                  </div>
                )}

                {verificationStatus === "failed" && (
                  <div className="w-full max-w-lg rounded-lg border border-red-300 bg-red-100 p-4 text-center text-red-700 font-medium">
                    ❌ Face verification failed. Please retake your selfie and
                    try again.
                  </div>
                )}

                <div className="flex flex-wrap justify-center gap-4">
                  <button
                    onClick={retakePhoto}
                    className="rounded-lg border border-gray-300 px-6 py-3 hover:bg-gray-100"
                  >
                    Retake
                  </button>

                  <button
                    onClick={handleFaceVerification}
                    disabled={verifying}
                    className="rounded-lg bg-green-600 px-6 py-3 cursor-pointer text-white hover:bg-green-700"
                  >
                    {verifying ? "Verifying Face" : "Verify Face"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        <canvas ref={canvasRef} className="hidden" />
        {status === "pending" && <Loading />}
      </div>
    </div>
  );
};

export default Step5;
