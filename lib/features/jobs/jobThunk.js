import { fetchUserToken } from "@/lib/fetchUserToken";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchAvilableJobs = createAsyncThunk(
  "/jobs/fetchJobs",
  async ({ page }, { rejectWithValue }) => {
    try {
      const token = await fetchUserToken();

      if (!token) {
        return rejectWithValue("User is not authenticated.");
      }
      const response = await fetch(`/api/employer/job?page=${page}&limit=12`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { data, counts, totalCount, message } = await response.json();
      if (!response.ok) {
        return rejectWithValue(result.message || "Failed to fetch jobs.");
      }
      return {
        data,
        counts,
        totalCount,
        message,
      };
    } catch (error) {
      console.log(error, "EEROR");
      return rejectWithValue({
        message: error.message || "Failed to fetch all jobs.",
      });
    }
  },
);

export const fetchJobsBasedOnStatus = createAsyncThunk(
  "/jobs/fetchJobsBasedOnStatus",
  async ({ status, page }, { rejectWithValue }) => {
    try {
      const token = await fetchUserToken();
      const response = await fetch(
        `/api/employer/job/count?status=${status}&page=${page}&limit=12`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const { data, totalCount, message } = await response.json();
      if (!response.ok) {
        return rejectWithValue(message || "Failed to fetch the data.");
      }
      return { data, totalCount, message };
    } catch (error) {
      console.log(error, "ERROR");
      return rejectWithValue({
        message: error.message || "Failed to fetch jobs based on the status.",
      });
    }
  },
);

export const deleteJob = createAsyncThunk(
  "/jobs/deleteJob",
  async ({ id }, { rejectWithValue }) => {
    try {
      const token = await fetchUserToken();
      const response = await fetch(`/api/employer/job/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const { jobId, status, message } = await response.json();
      if (!response.ok) {
        return rejectWithValue(message || "Failed to delete job.");
      }
      return { jobId, status };
    } catch (error) {
      return rejectWithValue({
        message: error.message || "Failed to delete job.",
      });
    }
  },
);

export const viewJob = createAsyncThunk(
  "/jobs/viewJob",
  async ({ jobId }, { rejectWithValue }) => {
    try {
      const token = await fetchUserToken();
      const response = await fetch("/api/worker/jobviewers", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId }),
      });
      const { data, message } = await response.json();
      if (!response.ok) {
        return rejectWithValue(message || "Failed to mark the view count.");
      }
      return { data, message };
    } catch (error) {
      return rejectWithValue({
        message: error.message || "Failed to mark the view count.",
      });
    }
  },
);

export const createJob = createAsyncThunk(
  "/jobs/createJob",
  async ({ body }, { rejectWithValue }) => {
    try {
      console.log(body, "THE DATA");
      const token = await fetchUserToken();
      const response = await fetch("/api/employer/job", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      console.log(response, "RESPONSE");
      const { data, message } = await response.json();

      if (!response.ok) {
        return rejectWithValue(message || "Failed to create new job.");
      }

      return { data, message };
    } catch (error) {
      console.log(error, "ERROR DATA");
      return rejectWithValue({
        message: error.message || "Failed to create a new job.",
      });
    }
  },
);

export const updateJob = createAsyncThunk(
  "/jobs/updateJob",
  async ({ body, id }, { rejectWithValue }) => {
    try {
      const token = await fetchUserToken();
      const response = await fetch(`/api/employer/job/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const { data, message } = await response.json();

      if (!response.ok) {
        return rejectWithValue(message || "Failed to update the job.");
      }

      return { data, message };
    } catch (error) {
      console.log(error, "ERROR");
      return rejectWithValue({
        message: error.message || "Failed to update the job.",
      });
    }
  },
);

//worker
export const fetchActiveJobs = createAsyncThunk(
  "/jobs/fetchActiveJobs",
  async ({ page }, { rejectWithValue }) => {
    try {
      const token = await fetchUserToken();

      if (!token) {
        return rejectWithValue("User is not authenticated.");
      }

      const url = `/api/worker/jobs?status=Active&page=${page}&limit=12`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { data, totalCount, message } = await response.json();
      console.log(data, totalCount, "FINAL ANSWER");
      if (!response.ok) {
        return rejectWithValue(message || "Failed to fetch jobs.");
      }
      return { data, totalCount, message };
    } catch (error) {
      console.log(error, "ERROR");
      return rejectWithValue({
        message: error.message || "Failed to fetch Active jobs for workers.",
      });
    }
  },
);
