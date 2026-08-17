import { validate } from "@/lib/validate";
import { validationError } from "@/lib/validationError";
import { skillCreationSchema } from "@/lib/validations/onboarding/onBoardingValidation";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import User from "@/modals/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { uid } = await verifyFirebaseToken(request);
    const body = await request.json();
    const validation = validate(skillCreationSchema, body);

    if (!validation.success) {
      return validationError(validation);
    }

    const updatedUser = await User.findByIdAndUpdate(
      uid,
      {
        $set: { ...validation.data, isOnboardingPage: false },
        $inc: {
      onboardPage: 1,
    },
      },
       
      {
        new: true,
        lean: true,
        select: "onboardPage isOnboardingPage role",
      },
    );
    console.log(updatedUser, "CHECK THIS UPDATED USER");

    return NextResponse.json(
      {
        message: "Successfully created skills and bio.",
        result:{
          onboardPage: updatedUser?.onboardPage,
        isOnboardingPage: updatedUser?.isOnboardingPage,
        role:updatedUser?.role,
        },
        success: true,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to update skills.",
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
