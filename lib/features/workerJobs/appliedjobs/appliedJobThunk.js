import { fetchUserToken } from "@/lib/fetchUserToken";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const applyToJob = createAsyncThunk(
  "/appliedJobs/applyToJob",
  async ({ jobId }, { rejectWithValue }) => {
    console.log(jobId, "JOB ID");
    try {
      const token = await fetchUserToken();
      const response = await fetch("/api/worker/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId }),
      });
      const { data, message } = await response.json();
      console.log(message, "ALREADY APPLIED MESSAGE 🔥😍🔥😍🔥😍🔥😍🔥");
      if (!response.ok) {
        return rejectWithValue(
          message || "You have already applied to this job",
        );
      }
      console.log(data, "RESULT DATA");
      return { data };
    } catch (error) {
      console.log(error, "ERROR");
      return rejectWithValue({
        message: error.message || "Failed to Apply job.",
      });
    }
  },
);

export const fetchAppliedJobs = createAsyncThunk(
  "/appliedJobs/fetchAllAppliedJobs",
  async ({ status, sort, page }, { rejectWithValue }) => {
    try {
      console.log("🔥😍🔥😍🔥😍🔥😍🔥 APPLIED");
      const token = await fetchUserToken();
      // console.log(token, "TOKEN ");
      const response = await fetch(
        `/api/worker/appliedjobs?statusType=${status}&sortType=${sort}&page=${page}&limit=12`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const { data, totalCount, message } = await response.json();
      console.log("DONE DONE 🔥😂😂😂😂😂😂😂");
      if (!response.ok) {
        return rejectWithValue(message || "Failed to fetch all applied job. ");
      }
      console.log(data, totalCount, "RESULT DATA APP");
      return { data, totalCount, message };
    } catch (error) {
      console.log(error, "ERROR DATA");
      return rejectWithValue({
        message: error.message || "Failed to fetch all applied job.",
      });
    }
  },
);

export const cancelAppliedJobs = createAsyncThunk(
  "/workerJobs/cancelAppliedJobs",
  async ({ jobId }, { rejectWithValue }) => {
    try {
      const token = await fetchUserToken();
      const response = await fetch("/api/worker/appliedjobs", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId, cancelled: true }),
      });
      const { isJobDeleted, data, message } = await response.json();
      if (!response.ok)
        rejectWithValue(message || "Failed to cancel saved job");

      console.log(isJobDeleted, data, "RESULT DATAAAAA");
      return { isJobDeleted, data, message };
    } catch (error) {
      console.log(error, "ERROR");
      return rejectWithValue({
        message: error.message || "Failed to cancel job.",
      });
    }
  },
);
