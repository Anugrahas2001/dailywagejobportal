import { NextResponse } from "next/server";

export function validationError(validation) {
  return NextResponse.json(
    {
      error: validation.errors,
    },
    {
      status: 400,
    }
  );
}