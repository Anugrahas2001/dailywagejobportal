import { useRouter } from "next/navigation";

import React from "react";

const Login = () => {
  const router = useRouter();

  const handleLogin = () => {
    // <h1>Done</h1>
    router.push("/dashboard");
  };

  return <button onClick={handleLogin}>Login</button>;
};

export default Login;
