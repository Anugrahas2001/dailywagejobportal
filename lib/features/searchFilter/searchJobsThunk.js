import { fetchUserToken } from "@/lib/fetchUserToken";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchSearchAndFilterResults = createAsyncThunk(
  "/searchJobs/fetchSearchAndFilterResults",
  async ({ page, limit, params }, { rejectWithValue }) => {
    try {
      const token = await fetchUserToken();
      const response = await fetch(
        `/api/worker/searchandfilter?page=${page}&limit=${limit}&${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const { data, totalCount, sortType, message } = await response.json();
      if (!response.ok) {
        {
          return rejectWithValue(message || "Failed to search jobs.");
        }
      }

      console.log(data, sortType, "SEARCH RESULT", totalCount);
      return { data, totalCount, sortType, message };
    } catch (error) {
      console.log(error, "ERROR DATA");
      return rejectWithValue({
        error:
          error.message || "Failed to perform search and filter operations.",
      });
    }
  },
);
