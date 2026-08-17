// hooks/useWorkerJobActions.js
import { useState, useEffect, useCallback } from "react";
import { fetchUserToken } from "@/lib/fetchUserToken";
import useLoading from "./useLoading";

export const useWorkerJobActions = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  // const [loading, setLoading] = useState(false);
  const { loading, setLoading } = useLoading();

  // Seed saved-job ids on mount so bookmark state is correct wherever this hook is used
  useEffect(() => {
    const loadSavedJobs = async () => {
      try {
        const token = await fetchUserToken();
        setLoading(true);
        const res = await fetch("/api/worker/savedjobs", {
          method:"GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const { data } = await res.json();
        setLoading(false);
        console.log(data, "CHECK THIS");
        setSavedJobs(data?.map((job) => job._id) || []);
        //  setSavedJobs(data);
      } catch (error) {
        console.error(error, "FAILED_TO_LOAD_SAVED_JOBS");
      }
    };
    loadSavedJobs();
  }, []);

  const toggleSavedJob = useCallback(
    async (jobId, onSucess) => {
      const isSaved = savedJobs.includes(jobId);
      console.log(isSaved, "IS SEVED DATA");
      // optimistic update
      setSavedJobs((prev) =>
        isSaved ? prev.filter((id) => id !== jobId) : [...prev, jobId],
      );

      try {
        const token = await fetchUserToken();
        setLoading(true);
        const res = await fetch("/api/worker/savedjobs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ jobId, isDeleted: isSaved }),
        });
        if (!res.ok) throw new Error("Failed to update saved job");
        onSucess?.(jobId);
      } catch (error) {
        console.error(error, "SAVE_JOB_ERROR");
        // rollback
        // setSavedJobs((prev) =>
        //   isSaved ? [...prev, jobId] : prev.filter((id) => id !== jobId),
        // );
      } finally {
        setLoading(false);
      }
    },
    [savedJobs],
  );

  const cancelJob = useCallback(async (jobId, onSuccess) => {
    try {
      const token = await fetchUserToken();
      setLoading(true);
      const res = await fetch("/api/worker/appliedjobs", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId, cancelled: true }),
      });
      if (!res.ok) throw new Error("Failed to update saved job");
      onSuccess?.(jobId);
    } catch (error) {
      console.error(error, "CANCEL_JOB_ERROR");
      // rollback
      setSavedJobs((prev) => prev.filter((id) => id !== jobId));
    } finally {
      setLoading(false);
    }
  }, []);

  const applyToJob = useCallback(async (jobId, onSuccess) => {
    try {
      const token = await fetchUserToken();
      setLoading(true);
      const res = await fetch("/api/worker/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          throw new Error(
            data?.message || "You have already applied to this job",
          );
        }
        throw new Error(data?.message || "Failed to apply to job");
      }
      onSuccess?.(jobId); // only remove/mark on confirmed success
    } catch (error) {
      console.error(error, "APPLY_JOB_ERROR");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    savedJobs,
    cancelJob,
    toggleSavedJob,
    applyToJob,
    loading,
    setLoading,
  };
};
