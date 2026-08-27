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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (!response.ok) {
        return rejectWithValue(result.message || "Failed to fetch jobs.");
      }
      return {
        data: result.data,
        statusCounts: result.counts,
        totalCount: result.totalCount,
      };
    } catch (error) {
      return rejectWithValue("Failed to fetch all jobs.");
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

      const { data, totalCount } = await response.json();
      if (!response.ok) {
        return rejectWithValue("Failed to fetch the data.");
      }
      return { data, totalCount };
    } catch (error) {
      return rejectWithValue("Failed to fetch jobs based on the status.");
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
      const { jobId, status } = await response.json();
      if (!response.ok) {
        return rejectWithValue("Failed to delete job.");
      }
      return { jobId, status };
    } catch (error) {
      return rejectWithValue("Failed to delete job.");
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
      const result = await response.json();
    } catch (error) {
      return rejectWithValue("Failed to mark the view count.");
    }
  },
);

export const createJob = createAsyncThunk(
  "/jobs/createJob",
  async ({ data }, { rejectWithValue }) => {
    try {
      console.log(data, "THE DATA");
      const token = await fetchUserToken();
      const response = await fetch("/api/employer/job", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        return rejectWithValue("Failed to create new job.");
      }
      console.log(response, "RESPONSE");
      const res = await response.json();
      console.log(res, "RESULTT DATAAAA");
      return res.data;
    } catch (error) {
      return rejectWithValue("Failed to create a new job.");
    }
  },
);

export const updateJob = createAsyncThunk(
  "/jobs/updateJob",
  async ({ data, id }, { rejectWithValue }) => {
    try {
      const token = await fetchUserToken();
      const response = await fetch(`/api/employer/job/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        return rejectWithValue("Failed to update the job.");
      }
      const res = await response.json();
      return res;
    } catch (error) {
      return rejectWithValue("Failed to update the job.");
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

      const { data, totalCount } = await response.json();
      console.log(data, totalCount, "FINAL ANSWER");
      if (!response.ok) {
        return rejectWithValue("Failed to fetch jobs.");
      }
      return { data, totalCount };
    } catch (error) {
      return rejectWithValue("Failed to fetch Active jobs for workers.");
    }
  },
);

export const fetchSearchAndFilterResults = createAsyncThunk(
  "/jobs/fetchSearchAndFilterResults",
  async ({page,limit,params}, { rejectWithValue }) => {
    try {
      const token = await fetchUserToken();
      const response = await fetch(
        `/api/worker/searchandfilter?page=${page}&limit=${limit}&${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!response.ok) throw new Error("Search failed");
      const { data, totalCount } = await response.json();
      console.log(data, "SEARCH RESULT", totalCount);
      return { data, totalCount };
    } catch (error) {
      console.log(error, "ERROR DATA");
      return rejectWithValue("Failed to perform search and filter operations.");
    }
  },
);
