import { createSlice, current } from "@reduxjs/toolkit";
import { fetchSavedJobs, toggleSavedJobs } from "./savedJobThunk";

const savedJobsSlice = createSlice({
  name: "savedJobs",
  initialState: {
    savedJobs: [],
    error: null,
    status: "idle",
    totalCount: 0,
  },
  reducers: {
    clearSavedJobsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchSavedJobs.pending, (state, action) => {
        console.log("🔥 fetchSavedJobs.pending", action.type, current(state));

        state.status = "pending";
        state.error = null;
      })

      .addCase(fetchSavedJobs.fulfilled, (state, action) => {
        console.log("🔥 fetchSavedJobs.fulfilled BEFORE", current(state));

        console.log("FETCH DATA:", action.payload.data);

        state.status = "succeeded";
        state.totalCount = action.payload.totalCount;
        state.savedJobs = action.payload.data;

        console.log("🔥 fetchSavedJobs.fulfilled AFTER", current(state));
      })

      .addCase(fetchSavedJobs.rejected, (state, action) => {
        console.log("🔥 fetchSavedJobs.rejected", action.type, current(state));

        state.status = "rejected";
        state.error = action.payload;
      })

      .addCase(toggleSavedJobs.pending, (state, action) => {
        console.log("🔥 toggleSavedJobs.pending", action.type, current(state));

        state.status = "pending";
        state.error = null;
      })

      .addCase(toggleSavedJobs.fulfilled, (state, action) => {
        console.log("🔥 toggleSavedJobs.fulfilled BEFORE", current(state));
        state.status = "succeeded";
        const newJob = action.payload.data;
        const isJobDeleted=action.payload.deletedJob;
        console.log(newJob, "CHECK THIS");
        if (isJobDeleted) {
          state.savedJobs = state.savedJobs.filter(
            (job) => job._id !== newJob._id,
          );

          state.totalCount -= 1;
        } else {
          state.savedJobs.push(newJob);
          state.totalCount += 1;
        }

        console.log("🔥 toggleSavedJobs.fulfilled AFTER", current(state));
      })

      .addCase(toggleSavedJobs.rejected, (state, action) => {
        console.log("🔥 toggleSavedJobs.rejected", action.type, current(state));

        state.status = "rejected";
        state.error = action.payload;
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
