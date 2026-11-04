// app/api/razorpay/verify/route.js
import { NextResponse } from "next/server";
import crypto from "crypto";
import { JOB_COMPLETION_STATUS, PAYMENT_STATUS } from "@/constants/constant";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/modals/Payment";
import WorkerSession from "@/modals/WorkerSession";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";

export async function POST(request) {
  await connectDB();
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    jobId,
    // employerId,
    workerId,
  } = await request.json();
  console.log(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    jobId,
    // employerId,
    workerId,
    "CHECK ALL THE 3 VALUES",
  );
  const { uid } = await verifyFirebaseToken(request);
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const valid =
    expected.length === razorpay_signature?.length &&
    crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(razorpay_signature),
    );

  console.log(valid, "VALID DATAAA");

  //   if (!valid) return NextResponse.json({ verified: false }, { status: 400 });
  const paymentStatus = valid ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.FAILED;

  const update = await Payment.findOneAndUpdate(
    {
      //   razorPayOrderId: razorpay_order_id,
      //   status: { $ne: PAYMENT_STATUS.PAID },
      workerId,
      jobId,
      employerId: uid,
    },
    {
      $set: {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: paymentStatus,
        paidAt: new Date(),
      },
    },
    {
      returnDocument: "after",
      lean: true,
    },
  );

  console.log(update, "UPDATED RESULT DATA");

  if (paymentStatus === PAYMENT_STATUS.PAID) {
    const data = await WorkerSession.findOneAndUpdate(
      { jobId, workerId },
      {
        $set: {
          jobCompletionStatus: JOB_COMPLETION_STATUS.PAID,
        },
      },
      {
        sort: { createdAt: -1 }, // pick the latest session
        returnDocument: "after",
        lean: true,
      },
    );

    console.log(data, "DATA");
  }

  return NextResponse.json({ verified: true });
}
