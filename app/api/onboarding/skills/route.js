import { connectDB } from "@/lib/mongodb";
import { validate } from "@/lib/validate";
import { validationError } from "@/lib/validationError";
import { skillCreationSchema } from "@/lib/validations/onboarding/onBoardingValidation";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import User from "@/modals/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();
    const { uid } = await verifyFirebaseToken(request);
    const body = await request.json();
    console.log(body, "BODY DATA");

    const validation = validate(skillCreationSchema, body);
    console.log(validation, "VALIDATION VALIDATION");
    if (!validation.success) {
      return validationError(validation);
    }

    const updatedUser = await User.findByIdAndUpdate(
      uid,
      {
        $set: {
          ...validation.data,
          onboardPage: 4,
          isOnboardingComplete: false,
        },
      },

      {
        new: true,
        lean: true,
        select: "onboardPage isOnboardingComplete role",
      },
    );

    return NextResponse.json(
      {
        message: "Skills and bio added successfully.",
        result: {
          onboardPage: updatedUser?.onboardPage,
          isOnboardingComplete: updatedUser?.isOnboardingComplete,
          role: updatedUser?.role,
        },
        success: true,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.log(error, "ERROR DATA");
    return NextResponse.json(
      {
        message: "Unable to update skills and bio. Please try again.",
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
