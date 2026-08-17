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
      const { data,isJobDeleted } = await response.json();
      console.log(data, "DATA RESULT");
      if (!response.ok) {
        // if (res.status === 409) {
          return rejectWithValue("You have already applied to this job");
        // }
      }
      console.log(data, "RESULT DATA");
      return {data,isJobDeleted};
    } catch (error) {
      return rejectWithValue("Failed to Apply job.");
    }
  },
);

export const fetchAppliedJobs = createAsyncThunk(
  "/appliedJobs/fetchAllAppliedJobs",
  async ({ status, sort, page }, { rejectWithValue }) => {
    try {
      const token = await fetchUserToken();
      console.log(token, "TOKEN ");
      const response = await fetch(
        `/api/worker/appliedjobs?statusType=${status}&sortType=${sort}&page=${page}&limit=12`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const { data, totalCount } = await response.json();

      if (!response.ok) {
        return rejectWithValue("Failed to ");
      }
      console.log(data, totalCount, "RESULT DATA APP");
      return { data, totalCount };
    } catch (error) {
      return rejectWithValue("Failed to fetch all applied job.");
    }
  },
);

export const cancelToJob = createAsyncThunk(
  "workerJobs/cancelAppliedJobs",
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
      if (!response.ok) rejectWithValue("Failed to cancel saved job");
      const res = await response.json();
      console.log(res, "RESULT DATAAAAA");
      return res;
    } catch (error) {
      return rejectWithValue("Failed to cancel job.");
    }
  },
);
