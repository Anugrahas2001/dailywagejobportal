// import { fetchUserToken } from "@/lib/fetchUserToken";
// import { createAsyncThunk } from "@reduxjs/toolkit";

// export const fetchSearchAndFilterResults = createAsyncThunk(
//   "/searchJobs/fetchSearchAndFilterResults",
//   async ({ page, limit, params }, { rejectWithValue }) => {
//     try {
//       console.log(page, limit, params, "ALL THE DATAAS");
//       const token = await fetchUserToken();
//       const response = await fetch(
//         `/api/worker/searchandfilter?page=${page}&limit=${limit}&${params.toString()}`,
//         { method: "GET", headers: { Authorization: `Bearer ${token}` } },
//       );
//       console.log(response, "response data");
//       if (!response.ok) {
//         {
//           return rejectWithValue({
//             message: message || "Failed to search jobs.",
//           });
//         }
//       }

//       const { data, totalCount, sortType, message } = await response.json();

//       console.log(data, sortType, "SEARCH RESULT", totalCount);

//       return { data, totalCount, sortType, message };
//     } catch (error) {
//       console.log(error, "ERROR DATA");
//       return rejectWithValue({
//         error:
//           error.message || "Failed to perform search and filter operations.",
//       });
//     }
//   },
// );



import { fetchUserToken } from "@/lib/fetchUserToken";
import { createAsyncThunk } from "@reduxjs/toolkit";

const withTimeout = (promise, ms, label) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms),
    ),
  ]);

export const fetchSearchAndFilterResults = createAsyncThunk(
  "searchJobs/fetchSearchAndFilterResults",
  async ({ page, limit, params }, { rejectWithValue }) => {
    try {
      console.log("1. thunk started", page, limit, params.toString());

      const token = await withTimeout(fetchUserToken(), 8000, "fetchUserToken");
      console.log("2. token ok:", !!token);

      const query = new URLSearchParams(params);
      query.set("page", String(page));
      query.set("limit", String(limit));

      const response = await fetch(`/api/worker/searchandfilter?${query.toString()}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("3. status", response.status);

      let body = null;
      try {
        body = await response.json();
      } catch {
        body = null;
      }

      if (!response.ok) {
        return rejectWithValue({ message: body?.message || "Failed to search jobs." });
      }

      const { data, totalCount, sortType, message } = body;
      return { data, totalCount, sortType, message };
    } catch (error) {
      console.log("thunk error:", error);
      return rejectWithValue({
        message: error.message || "Failed to perform search and filter operations.",
      });
    }
  },
);