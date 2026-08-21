import { connectDB } from "@/lib/mongodb";
import { validate } from "@/lib/validate";
import { validationError } from "@/lib/validationError";
import { profileImageSchema } from "@/lib/validations/onboarding/onBoardingValidation";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import User from "@/modals/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();
    const { uid } = await verifyFirebaseToken(request);
    const body = await request.json();
    const validation = validate(profileImageSchema, body);

    if (!validation.success) {
      return validationError();
    }

    const data = validation.data;

    //    lean:true skips Mongoose document hydration (faster serialize).
    const updatedUser = await User.findByIdAndUpdate(
      uid,
      {
        $set: {
          onboardPage:5,
          profileImage: data.profileImage,
          isOnboardingComplete: false,
        },
        // $inc: {
        //   onboardPage: 1,
        // },
      },
      {
        new: true,
        lean: true,
        select: "onboardPage isOnboardingComplete role profileImage",
      },
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }
    return NextResponse.json(
      {
        message: "Successfully uploaded profileImage.",
        result: {
          onboardPage: updatedUser?.onboardPage,
          profileImage: updatedUser?.profileImage,
          isOnboardingComplete: updatedUser?.isOnboardingComplete,
          role: updatedUser?.role,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to uploaded profileImage.",
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
