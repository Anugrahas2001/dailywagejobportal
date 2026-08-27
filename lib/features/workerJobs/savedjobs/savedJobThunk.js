import { fetchUserToken } from "@/lib/fetchUserToken";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchSavedJobs = createAsyncThunk(
  "/savedJobs/fetchSavedJobs",
  async ({ sort, page }, { rejectWithValue }) => {
    console.log("🔥😍🔥😍🔥😍🔥😍🔥 SAVED");
    try {
      const token = await fetchUserToken();
      const res = await fetch(
        `/api/worker/savedjobs?sorttype=${sort}&page=${page}&limit=12`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) return rejectWithValue("Failed to load saved jobs");

      const { data, totalCount } = await res.json();

      // return data?.map((job) => job._id) || [];
      return { data, totalCount };
    } catch (error) {
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
      if (!response.ok)
        return rejectWithValue("Failed to toggle the saved jobs.");
      const { data, deletedJob } = await response.json();
      console.log(data, deletedJob, "RESULT SAVED DATA");
      return { data, deletedJob };
    } catch (error) {
      return rejectWithValue("Failed to toggle saved jobs");
    }
  },
);
