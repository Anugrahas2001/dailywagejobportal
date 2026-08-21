import { generateId } from "@/lib/generateRandomId";
import { connectDB } from "@/lib/mongodb";
import { validate } from "@/lib/validate";
import { validationError } from "@/lib/validationError";
import { jobPreferencesSchema } from "@/lib/validations/onboarding/onBoardingValidation";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import JobPreferences from "@/modals/JobPreferences";
import User from "@/modals/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();
    const { uid } = await verifyFirebaseToken(request);
    const body = await request.json();
    const jobObj = {
      _id: generateId(),
      userId: uid,
      ...body,
    };

    const validation = validate(jobPreferencesSchema, jobObj);

    if (!validation.success) {
      return validationError(validation);
    }
    await JobPreferences.create(jobObj);

    const updatedUser = await User.findByIdAndUpdate(
      uid,
      {
        $set: {
          onboardPage:3,
          isOnboardingComplete: false,
        },
        // $inc: {
        //   onboardPage: 1,
        // },
      },
      {
        new: true,
        lean: true,
        select: "onboardPage isOnboardingComplete role jobCategory",
      },
    );

    if (!updatedUser) {
      return NextResponse.json(
        { message: "User not found.", success: false },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Successfully created Job Preferences.",
        result: {
          onboardPage: updatedUser?.onboardPage,
          isOnboardingComplete: updatedUser?.isOnboardingComplete,
          role: updatedUser?.role,
        },
        success: true,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("jobPreferences POST error:", error);
    return NextResponse.json(
      {
        message: "Failed create job prefrenecs.",
        error: error,
      },
      {
        status: 500,
      },
    );
  }
}
