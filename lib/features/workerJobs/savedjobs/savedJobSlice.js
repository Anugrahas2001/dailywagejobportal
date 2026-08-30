import { createSlice, current } from "@reduxjs/toolkit";
import { fetchSavedJobs, toggleSavedJobs } from "./savedJobThunk";

const savedJobsSlice = createSlice({
  name: "savedJobs",
  initialState: {
    savedJobs: [],
    error: null,
    status: "idle",
    totalCount: 0,
    successMessage: null,
  },
  reducers: {
    clearSavedJobsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchSavedJobs.pending, (state) => {
        // console.log("🔥 fetchSavedJobs.pending", action.type, current(state));

        state.status = "pending";
        state.error = null;
      })

      .addCase(fetchSavedJobs.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.totalCount = action.payload.totalCount;
        state.savedJobs = action.payload.data;
        state.successMessage = action.payload.message;
      })

      .addCase(fetchSavedJobs.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload.message;
      })

      .addCase(toggleSavedJobs.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })

      .addCase(toggleSavedJobs.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.successMessage = action.payload.message;
        const newJob = action.payload.data;
        const isJobDeleted = action.payload.deletedJob;
        if (isJobDeleted) {
          state.savedJobs = state.savedJobs.filter(
            (job) => job._id !== newJob._id,
          );

          state.totalCount -= 1;
        } else {
          state.savedJobs.push(newJob);
          state.totalCount += 1;
        }
      })

      .addCase(toggleSavedJobs.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload.message;
      });
    // .addCase(fetchSavedJobs.pending, (state) => {
    //   state.status = "pending";
    //   state.error = null;
    // })
    // .addCase(fetchSavedJobs.fulfilled, (state, action) => {
    //   console.log(action, "ACTION DATA");
    //   state.status = "succeeded";
    //   state.totalCount = action.payload.totalCount;
    //   state.savedJobs = action.payload.data;
    //   console.log(current(state), "STATE AFTER FULFILLED");
    // })
    // .addCase(fetchSavedJobs.rejected, (state, action) => {
    //   state.status = "rejected";
    //   state.error = action.payload;
    // })

    // .addCase(toggleSavedJobs.pending, (state) => {
    //   state.status = "pending";
    //   state.error = null;
    // })
    // .addCase(toggleSavedJobs.fulfilled, (state, action) => {
    //   state.status = "succeeded";

    //   const newJob = action.payload;
    //   console.log(newJob,newJob.isDeleted, "WHAT IS THIS NEW JOB");
    //   if (newJob.isDeleted) {
    //     state.savedJobs = state.savedJobs.filter(
    //       (job) => job._id !== newJob._id,
    //     );
    //     state.totalCount -= 1;
    //     console.log(current(state), "STATE AFTER FULFILLEDDD");
    //   } else {
    //     // state.savedJobs = [...state.savedJobs, action.payload];
    //     console.log(current(state), "STATE BEFORE FULFILLED");
    //     state.savedJobs.push(newJob);
    //     state.totalCount += 1;
    //     console.log(current(state), "STATE AFTER FULFILL");
    //   }
    //   console.log(current(state), "STATE AFTER FULFILLED");
    // })
    // .addCase(toggleSavedJobs.rejected, (state, action) => {
    //   state.status = "rejected";
    //   state.error = action.payload;
    // });
  },
});

export const { clearSavedJobsError } = savedJobsSlice.actions;
export default savedJobsSlice.reducer;
