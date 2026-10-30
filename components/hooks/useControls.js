"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

const useControls = () => {
  const [page, setPage] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);
  const [pendingIds, setPendingIds] = useState({});
  const router = useRouter();
  const pendingRef = useRef({});
  const dispatch = useDispatch();
  console.log(page, "PAGE LOAD DATA PAGE LOAD");
  const runWithPending = async (key, fn) => {
    if (pendingRef.current[key]) return;
    pendingRef.current[key] = true;
    setPendingIds((p) => ({ ...p, [key]: true }));
    try {
      await fn();
    } catch (err) {
      console.log(err);
    } finally {
      delete pendingRef.current[key];
      setPendingIds((p) => {
        const { [key]: _, ...rest } = p;
        return rest;
      });
    }
  };

  const isPending = (key) => Boolean(pendingIds[key]);

  return {
    page,
    setPage,
    router,
    dispatch,
    runWithPending,
    isPending,
    initialLoading,
    setInitialLoading,
  };
};

export default useControls;
