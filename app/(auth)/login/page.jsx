import React from "react";

import { Suspense } from "react";
import LoginForm from "./LoginForm";
import { LoginLoading } from "./LoginLoading";

const page = () => {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  );
};

export default page;
