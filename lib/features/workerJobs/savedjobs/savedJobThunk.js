import { fetchUserToken } from "@/lib/fetchUserToken";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchSavedJobs = createAsyncThunk(
  "/savedJobs/fetchSavedJobs",
  async ({ sort, page }, { rejectWithValue }) => {
    console.log("🔥😍🔥😍🔥😍🔥😍🔥 SAVED");
    try {
      const token = await fetchUserToken();
      const response = await fetch(
        `/api/worker/savedjobs?sorttype=${sort}&page=${page}&limit=12`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const { data, totalCount, message } = await response.json();
      if (!response.ok) {
        return rejectWithValue(message || "Failed to load saved jobs");
      }
      return { data, totalCount, message };
    } catch (error) {
      console.log(error, "ERROR");
      return rejectWithValue("Failed to load Saved Jobs");
    }
  },
);

export const toggleSavedJobs = createAsyncThunk(
  "/savedJobs/toggleSavedJob",
  async ({ jobId, toggle }, { rejectWithValue }) => {
    console.log("==========================", jobId, toggle);
    try {
      console.log(jobId, toggle, "CHECK CHECK");
      const token = await fetchUserToken();
      const response = await fetch("/api/worker/savedjobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ jobId, toggle }),
      });
      const { data, deletedJob, message } = await response.json();
      if (!response.ok)
        return rejectWithValue(message || "Failed to toggle the saved jobs.");

      console.log(data, deletedJob, message, "RESULT SAVED DATA");
      return { data, deletedJob, message };
    } catch (error) {
      console.log(error, "ERROR");
      return rejectWithValue({
        message: error.message || "Failed to toggle saved jobs",
      });
    }
  },
);
