
// import { NextResponse } from "next/server";

// export function validationError(validation) {
//   console.log(validation, "VALIDATION ERROR DATA");

//   const { fieldErrors, formErrors } = validation.error.flatten();

//   return NextResponse.json(
//     {
//       success: false,
//       message: "Validation failed.",
//       errors: { formErrors, fieldErrors },
//     },
//     {
//       status: 400,
//     },
//   );
// }

import { NextResponse } from "next/server";

export function validationError(validation) {
  const { formErrors = [], fieldErrors = {} } = validation.errors ?? {};

  return NextResponse.json(
    {
      success: false,
      message: "Validation failed.",
      errors: { formErrors, fieldErrors },
    },
    { status: 400 },
  );
}