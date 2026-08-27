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
      if (!response.ok) throw new Error("Search failed");
      const { data, totalCount, sortType } = await response.json();
      console.log(data, sortType, "SEARCH RESULT", totalCount);
      return { data, totalCount, sortType };
    } catch (error) {
      console.log(error, "ERROR DATA");
      return rejectWithValue("Failed to perform search and filter operations.");
    }
  },
);