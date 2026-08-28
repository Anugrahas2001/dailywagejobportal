import { NextResponse } from "next/server";

export function validationError(validation) {
  return NextResponse.json(
    {
       success: false,
      message: "Validation failed.",
      errors: validation.error.issues,
    },
    {
      status: 400,
    }
  );
}