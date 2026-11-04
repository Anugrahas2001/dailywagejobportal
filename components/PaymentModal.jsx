"use client";

import { useState } from "react";
import Script from "next/script";
import useLoading from "./hooks/useLoading";
import { fetchUserToken } from "@/lib/fetchUserToken";

export default function PaymentModal({
  open,
  onClose,
  workerId,
  workerName,
  amount, // in rupees
  employerId,
  jobId,
  //   employerName,
  onSuccess,
}) {
  const { loading, setLoading } = useLoading();
  // "idle" | "success" | "failed" | "pending"
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (!open) return null;

  const rupees = Number(amount) || 0;

  const handleClose = () => {
    if (loading) return; // don't close while a payment is in progress
    setStatus("idle");
    setErrorMsg("");
    onClose();
  };

  const handlePay = async () => {
    // if (typeof window === "undefined" || !window.Razorpay) {
    //   setStatus("failed");
    //   setErrorMsg("Payment is still loading. Please try again in a moment.");
    //   return;
    // }

    setLoading(true);
    setStatus("idle");
    setErrorMsg("");

    try {
      // 1. Create the order on the server
      const token = await fetchUserToken();
      const res = await fetch("/api/razorpay/create-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: rupees, workerId, jobId }),
      });
      const order = await res.json();
      console.log(res, "RESPONSE AFTER CREATING PAYMENT");
      if (!res.ok) throw new Error(order.error || "Could not create order");

      // 2. Open Razorpay Checkout
      const rzp = new window.Razorpay({
        key: order.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "Daily Wage App",
        description: `Wage for ${workerName}`,
        // prefill: { name: employerName },
        theme: { color: "#16a34a" },

        // 3. Payment done -> send the three values to the verify API
        handler: async (response) => {
          try {
            console.log(response, "RESPONSE RAZOR PAY DATA");
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                jobId,
                workerId,
              }),
            });
            const data = await verifyRes.json().catch(() => ({}));
            console.log(data, "=========DATA VALUE==========");
            if (verifyRes.ok && data.verified) {
              setStatus("success");
              onSuccess?.();
            } else {
              // Signature check failed on the server
              setStatus("failed");
              setErrorMsg(
                "We could not verify this payment. If money was deducted, contact support with your payment ID: " +
                  response.razorpay_payment_id,
              );
            }
          } catch (err) {
            // Network error: money may have been taken, the webhook will confirm it
            console.error(err);
            setStatus("pending");
          } finally {
            setLoading(false);
          }
        },

        modal: { ondismiss: () => setLoading(false) },
      });

      console.log(rzp, "RAZOR PAY OUTPUT");

      rzp.on("payment.failed", (resp) => {
        setStatus("failed");
        setErrorMsg(
          resp?.error?.description || "Payment failed. Please try again.",
        );
        setLoading(false);
      });

      rzp.open();
    } catch (e) {
      console.error(e);
      setStatus("failed");
      setErrorMsg(e.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={handleClose}
      >
        <div
          className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {status === "success" ? (
            <Result
              icon="✓"
              tone="green"
              title="Payment successful"
              text={`₹${rupees.toLocaleString("en-IN")} paid for ${workerName}.`}
              onClose={handleClose}
            />
          ) : status === "pending" ? (
            <Result
              icon="…"
              tone="amber"
              title="Confirming your payment"
              text="We couldn't reach the server. If money was deducted, your payment will be confirmed automatically within a few minutes."
              onClose={handleClose}
            />
          ) : (
            <>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Pay wage</h2>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 rounded-xl bg-gray-50 p-4 text-sm">
                <Row label="Worker" value={workerName} />
                <div className="border-t pt-2">
                  <Row
                    label="Total"
                    value={`₹${rupees.toLocaleString("en-IN")}`}
                    bold
                  />
                </div>
              </div>

              {status === "failed" && (
                <p className="mt-3 text-sm text-red-600">
                  {errorMsg || "Payment failed. Please try again."}
                </p>
              )}

              <button
                onClick={handlePay}
                disabled={loading}
                className="mt-5 w-full rounded-lg bg-green-600 py-2.5 font-medium text-white disabled:opacity-60"
              >
                {loading
                  ? "Processing…"
                  : `Pay ₹${rupees.toLocaleString("en-IN")}`}
              </button>
              <p className="mt-2 text-center text-xs text-gray-400">
                Secured by Razorpay · UPI, Cards, Netbanking
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function Result({ icon, tone, title, text, onClose }) {
  const colors = {
    green: "bg-green-100 text-green-600",
    amber: "bg-amber-100 text-amber-600",
  };
  return (
    <div className="text-center">
      <div
        className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full text-2xl ${colors[tone]}`}
      >
        {icon}
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">{text}</p>
      <button
        onClick={onClose}
        className="mt-5 w-full rounded-lg bg-green-600 py-2.5 font-medium text-white"
      >
        Done
      </button>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className={bold ? "font-semibold" : ""}>{value}</span>
    </div>
  );
}
