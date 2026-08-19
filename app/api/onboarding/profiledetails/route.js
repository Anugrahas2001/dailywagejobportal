import { connectDB } from "@/lib/mongodb";
import { validate } from "@/lib/validate";
import { validationError } from "@/lib/validationError";
import { step1Schema } from "@/lib/validations/onboarding/onBoardingValidation";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import User from "@/modals/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();

    const { uid } = await verifyFirebaseToken(request);
    const body = await request.json();
    const validation = validate(step1Schema, body);

    if (!validation.success) {
      return validationError(validation);
    }

    const updatedUser = await User.findByIdAndUpdate(
      uid,
      {
        $set: { ...validation.data, isOnboardingComplete: false },
        $inc: {
          onboardPage: 1,
        },
      },
      {
        new: true,
        lean: true,
        select: "onboardPage isOnboardingComplete role name profileImage",
      },
    );
    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        {
          status: 404,
        },
      );
    }
    return NextResponse.json({
      message: "Onboarding Step1 completed successfully.",
      result: {
        name: updatedUser?.name,
        profileImage: updatedUser?.updatedUser,
        onboardPage: updatedUser?.onboardPage,
        isOnboardingComplete: updatedUser?.isOnboardingComplete,
        role: updatedUser?.role,
      },
    });
  } catch (error) {
    console.log(error, "ERROR FROM INTERNAL");
    return NextResponse.json(
      {
        message: "Failed to complete onboarding step1.",
        error: error,
      },
      {
        status: 500,
      },
    );
  }
}
