import { createSlice, current } from "@reduxjs/toolkit";
import {
  applyToJob,
  cancelAppliedJobs,
  fetchAppliedJobs,
} from "./appliedJobThunk";

const appliedJobSlice = createSlice({
  name: "appliedJobs",
  initialState: {
    status: "idle",
    appliedJobs: [],
    error: null,
    totalCount: 0,
    successMessage: null,
  },

  reducers: {
    clearAppliedJobsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(applyToJob.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(applyToJob.fulfilled, (state, action) => {
        state.status = "succeeded";
        console.log(action.payload.error, "ACTION PAYLOAD");
        const newAppliedJob = action.payload.data;
    
        state.appliedJobs = [...state.appliedJobs, newAppliedJob];
        state.totalCount += 1;
        state.successMessage = action.payload.message;
        console.log(
          current(state),
          "CURRENT STATE AFTER APPLIED FOR A JOB ISHAAN",
        );
      })
      .addCase(applyToJob.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload.message;

        console.log(current(state), "MIN MAIN MAIN REJECT");
      })

      .addCase(fetchAppliedJobs.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(fetchAppliedJobs.fulfilled, (state, action) => {
        state.appliedJobs = action.payload.data;
        state.totalCount = action.payload.totalCount;
        state.status = "succeeded";
        state.successMessage = action.payload.message;
        console.log(current(state), "APPLIED STATE AFTER FULFILLED");
      })
      .addCase(fetchAppliedJobs.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload.message;
      })
      .addCase(cancelAppliedJobs.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(cancelAppliedJobs.fulfilled, (state, action) => {
        state.status = "succeeded";
        const isJobDeleted = action.payload.isJobDeleted;
        const deletedJobId = action.payload.data;
        if (isJobDeleted) {
          state.appliedJobs = state.appliedJobs.map(
            (job) => job._id !== deletedJobId,
          );
          state.totalCount -= 1;
        }
        state.successMessage = action.payload.message;
        // console.log(current(state), "THE JOB TO CANCEL");
      })
      .addCase(cancelAppliedJobs.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload.message;
      });
  },
});

export const { clearAppliedJobsError } = appliedJobSlice.actions;
export default appliedJobSlice.reducer;
