// app/providers.jsx
"use client";

import { store } from "@/lib/features/store";
import { Provider } from "react-redux";
// import { store } from "@/redux/store";

export default function Providers({ children }) {
  return <Provider store={store}>{children}</Provider>;
}