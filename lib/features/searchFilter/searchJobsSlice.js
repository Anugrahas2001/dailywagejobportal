import { createEntityAdapter, createSlice, current } from "@reduxjs/toolkit";
import { fetchSearchAndFilterResults } from "./searchJobsThunk";


const jobsAdapter = createEntityAdapter({
  selectId: (job) => job._id,
});

const searchJobsSlice = createSlice({
  name: "searchJobs",
  initialState: {
    status: "idle",
    totalCount: 0,
    error: null,
    sortType: "newest",
    jobs:[],
  },

  reducers: {
    setSortType: (state, action) => {
      state.sortType = action.payload;
    },

    clearSearchResults: (state) => {
      state.jobs = [];
      state.totalCount = 0;
    },
  },

  extraReducers:(builder)=>{
    builder.addCase(fetchSearchAndFilterResults.pending, (state, action) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(fetchSearchAndFilterResults.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.sortType = action.payload.sortType;
        const jobs = [...action.payload.data];

        jobs.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();

          if (state.sortType === "oldest") {
            return dateA - dateB;
          }

          // newest
          return dateB - dateA;
        });

        state.jobs=jobs;
        
        state.totalCount = action.payload.totalCount;
        console.log(current(state), "ALL THE DATA FROM OLDEST-> NEWEST");
      })
      .addCase(fetchSearchAndFilterResults.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload.data;
      });
  }
});


export const { setSortType } =
  searchJobsSlice.actions;

export const jobsSelectors = jobsAdapter.getSelectors((state) => state.jobs);

export default searchJobsSlice.reducer;
