// jobsSlice.js
import { createSlice, createEntityAdapter, current } from "@reduxjs/toolkit";
import {
  createJob,
  deleteJob,
  fetchActiveJobs,
  fetchAvilableJobs,
  fetchJobsBasedOnStatus,
  updateJob,
} from "./jobThunk";

const jobsAdapter = createEntityAdapter({
  // sort however you want, e.g. newest first
  selectId: (job) => job._id,
  sortComparer: (a, b) => b.createdAt.localeCompare(a.createdAt),
});

const jobsSlice = createSlice({
  name: "jobs",
  initialState: jobsAdapter.getInitialState({
    status: "idle",
    error: null,
    totalCount: 0,
    statusCounts: {
      All: 0,
      Active: 0,
      Paused: 0,
      Completed: 0,
    },
    successMessage: null,
  }),
  reducers: {
    jobUpdated: jobsAdapter.updateOne,
    jobAdded: jobsAdapter.addOne,
    jobRemoved: jobsAdapter.removeOne,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvilableJobs.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(fetchAvilableJobs.fulfilled, (state, action) => {
        state.status = "succeeded";

        const { data, totalCount, statusCounts, message } = action.payload;

        jobsAdapter.setAll(state, data);
        state.successMessage = message;
        state.totalCount = totalCount;
        state.statusCounts = statusCounts;
        console.log(current(state), "CHECK THE CURRENT STAGE");
      })
      .addCase(fetchAvilableJobs.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload.message;
      })
      .addCase(fetchJobsBasedOnStatus.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(fetchJobsBasedOnStatus.fulfilled, (state, action) => {
        state.status = "suceeded";
        state.successMessage = action.payload.message;
        jobsAdapter.setAll(state, action.payload.data);
        state.totalCount = action.payload.totalCount;
      })
      .addCase(fetchJobsBasedOnStatus.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload.message;
      })
      .addCase(deleteJob.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.successMessage = action.payload.message;
        jobsAdapter.removeOne(state, action.payload.jobId);
        const status = action.payload.status;
        if (state.statusCounts[status] > 0 && state.statusCounts["All"]) {
          state.statusCounts[status] -= 1;
          state.statusCounts["All"] -= 1;
        }
        state.totalCount -= 1;
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload.message;
      })
      .addCase(createJob.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.status = "succeeded";
        const statusVal = action.payload.data.status;
        state.successMessage = action.payload.message;

        jobsAdapter.addOne(state, action.payload.data);
        state.totalCount += 1;
        state.statusCounts[statusVal] += 1;
        console.log(current(state), "CHECK THE CURRENT STAGE CREATE JOB");
      })
      .addCase(createJob.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload.message;
      })
      .addCase(updateJob.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.status = "succeeded";
        // const jobId=action.payload._id;
        state.successMessage = action.payload.message;
        jobsAdapter.updateOne(state, {
          id: action.payload.data._id,
          changes: action.payload.data,
        });
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload.message;
      })
      .addCase(fetchActiveJobs.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(fetchActiveJobs.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.successMessage = action.payload.message;
        jobsAdapter.setAll(state, action.payload.data);
        state.totalCount = action.payload.totalCount;
      })
      .addCase(fetchActiveJobs.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload.message;
      });
  },
});

export const { jobUpdated, jobAdded, jobRemoved } = jobsSlice.actions;

export const jobsSelectors = jobsAdapter.getSelectors((state) => state.jobs);

export default jobsSlice.reducer;
