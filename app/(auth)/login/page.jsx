

import React from "react";

import { Suspense } from "react";
import LoginForm from "./LoginForm";

const page = () => {
 
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm/>
    </Suspense>
  );
};

export default page
