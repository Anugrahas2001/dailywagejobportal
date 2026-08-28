import { connectDB } from "@/lib/mongodb";
import { rekognitionClient, SIMILARITY_THRESHOLD } from "@/lib/rekognition";
import { verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import User from "@/modals/User";
import { CompareFacesCommand } from "@aws-sdk/client-rekognition";
import { NextResponse } from "next/server";

async function imageUrlToBuffer(imageUrl) {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch the profile image.",
      },
      {
        status: 502,
      },
    );
  }

  const arrayBuffer = await response.arrayBuffer();

  return Buffer.from(arrayBuffer);
}

export async function POST(request) {
  try {
    await connectDB();
    const { profileImage, onboardPage, isOnboardingComplete } =
      await request.json();
    const { uid } = await verifyFirebaseToken(request);

    const sourceImage = await User.findById(uid).select("profileImage").lean();

    if (!sourceImage?.profileImage) {
      return NextResponse.json(
        {
          message: "Profile image not found.",
        },
        {
          status: 400,
        },
      );
    }

    const sourceBytes = await imageUrlToBuffer(sourceImage.profileImage);

    // Convert the captured Base64 image to bytes
    const targetBytes = Buffer.from(
      profileImage.replace(/^data:image\/\w+;base64,/, ""),
      "base64",
    );

    const command = new CompareFacesCommand({
      SourceImage: {
        Bytes: sourceBytes,
      },
      TargetImage: {
        Bytes: targetBytes,
      },
      SimilarityThreshold: 0,
    });

    const response = await rekognitionClient.send(command);
    console.log(response, "RESPOSNE FROM THE FACE RECOGNITION");
    if (!response.FaceMatches || response.FaceMatches.length === 0) {
      return NextResponse.json(
        {
          isVerified: false,
          similarity: 0,
          message: "No matching faces found in the images",
        },
        { status: 200 },
      );
    }

    const highestSimilarity = Math.max(
      ...response.FaceMatches.map((match) => match.Similarity),
    );

    // Round to 2 decimal places
    const similarityRounded = Math.round(highestSimilarity * 100) / 100;
    const isVerified = highestSimilarity >= SIMILARITY_THRESHOLD;

    const updatedUser = await User.findByIdAndUpdate(
      uid,
      {
        $set: {
          isVerified: true,
          onboardPage: 6,
          isOnboardingComplete: true,
        },
      },
      {
        new: true,
      },
    );

    return NextResponse.json({
      success: true,
      matches: response.FaceMatches,
      isVerified,
      similarity: similarityRounded,
      result: {
        onboardPage: updatedUser?.onboardPage,
        isOnboardingComplete: updatedUser?.isOnboardingComplete,
        profileImage: updatedUser?.profileImage,
        role: updatedUser?.role,
      },

      message: isVerified
        ? "Verification successful"
        : "Verification failed - faces do not match sufficiently",
    });
  } catch (error) {
    console.log(error, "ERROR DATA");
    return NextResponse.json(
      {
        message:
          "Unable to complete face verification. Please try again later.",
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
