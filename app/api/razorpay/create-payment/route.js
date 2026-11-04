import { PAYMENT_STATUS } from "@/constants/constant";
import { generateId } from "@/lib/generateRandomId";
import { connectDB } from "@/lib/mongodb";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import Payment from "@/modals/Payment";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    await connectDB();
    const {uid}=await verifyFirebaseToken(request);
    const { amount, workerId, jobId } = await request.json();

    if (!amount || amount < 1) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // 1. Ask Razorpay to create the order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      receipt: `wage_${workerId}_${Date.now()}`,
    });
    console.log(order, "RAZORPAY ORDER RESULT");
    // 2. Save it in your database
    const pay = await Payment.create({
      _id:generateId(),
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status:PAYMENT_STATUS.PENDING ,
      workerId,
      employerId:uid,
      jobId,
    });
    console.log(pay, "PAYMENT RESULT DATA");
    // 3. Send what the frontend needs
    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID, // public key id is safe to send
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Could not create order" },
      { status: 500 },
    );
  }
}
