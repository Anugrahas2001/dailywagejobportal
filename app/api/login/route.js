import admin from "@/lib/firebaseAdmin";
import { connectDB } from "@/lib/mongodb";
import { validate } from "@/lib/validate";
import { validationError } from "@/lib/validationError";
import { loginSchema } from "@/lib/validations/onboarding/onBoardingValidation";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import User from "@/modals/User";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();

    const { uid, email, firebase } = await verifyFirebaseToken(request);
    const { role } = await request.json();
    console.log(email, role, uid, "BEFORE VALIDATION");
    const body = {
      _id: uid,
      email,
      role,
      googleId: firebase?.identities?.["google.com"]?.[0],
    };

    const validation = validate(loginSchema, body);
    if (!validation.success) {
      return validationError(validation);
    }

    // const existingUser = await User.findOneAndUpdate(
    //   { _id: uid },
    //   { $setOnInsert: ...validation.data,onboardPage:1,isOnboardingComplete:false },
    //   { new: false, upsert: true, includeResultMetadata: true, },
    // );
    const existingUser = await User.findOneAndUpdate(
      { _id: uid },
      {
        $setOnInsert: {
          ...validation.data,
          onboardPage: 1,
          isOnboardingComplete: false,
        },
      },
      {
        new: false,
        upsert: true,
        includeResultMetadata: true,
      },
    );

    console.log(existingUser, "EXISTING USER");
    const isNew = !existingUser?.lastErrorObject?.updatedExisting;
    console.log(
      isNew,
      existingUser?.lastErrorObject?.updatedExisting,
      "CHECK BOTH",
    );
    const userDoc = isNew ? validation.data : existingUser.value;
    console.log(
      isNew,
      userDoc,
      validation.data,
      "##########################################",
    );
    if (!isNew && userDoc.role !== role) {
      return NextResponse.json(
        { success: false, role: userDoc.role, message: "Role mismatch." },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: isNew ? "User created successfully." : "User already exists.",
        data: {
        
          onboardPage: userDoc.onboardPage || 1,
          isOnboardingComplete: userDoc.isOnboardingComplete || false,
          role: userDoc.role,
        },
      },
      { status: isNew ? 201 : 200 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error.",
      },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  try {
    await connectDB();
    const { uid } = await verifyFirebaseToken(request);

    const exUser = await User.findById(uid)
      .select("onboardPage isOnboardingComplete role")
      .lean();
    console.log(exUser, "EXIXTING USER");
    if (!exUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 404,
        },
      );
    }
    return NextResponse.json(
      {
        message: "User verification successful.",
        data: {
          onboardPage: exUser.onboardPage || 0,
          isOnboardingComplete: exUser.isOnboardingComplete || false,
          role: exUser.role,
          userId: uid,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Verification Failed",
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(request) {
  try {
    await connectDB();
    const { uid } = await verifyFirebaseToken(request);

    await admin.auth().revokeRefreshTokens(uid);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully signed out",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to logout.",
        error: error,
      },
      {
        status: 500,
      },
    );
  }
}
