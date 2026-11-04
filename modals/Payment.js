// key id: rzp_test_TvzwADo7vPPjcc
// Test Key Secret: c2znP047mSYrn5L34npmLUDo

import { PAYMENT_STATUS } from "@/constants/constant";
import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    workerId: {
      type: String,
      required: true,
    },
    employerId: {
      type: String,
      required: true,
    },
    jobId: {
      type: String,
      required: true,
    },
    amount: { type: Number, required: true, min: 1 }, // in paise
    currency: { type: String, default: "INR" },

    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
      required: true,
    },
    razorpayPaymentId: {
      type: String,
      required: false,
    },
    razorpayOrderId: {
      type: String,
      required: false,
    },
    razorpaySignature: {
      type: String,
      required: false,
    },
    method: { type: String }, // upi, card, netbanking
    failureReason: { type: String },
    paidAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);
PaymentSchema.index({ jobId: 1, workerId: 1 });

export default mongoose.models.Payment ||
  mongoose.model("Payment", PaymentSchema);
