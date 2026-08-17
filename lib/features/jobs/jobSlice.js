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
      })
      .addCase(fetchAvilableJobs.fulfilled, (state, action) => {
        state.status = "succeeded";
        console.log(action.payload, "PAYLOAD");

        const { data, totalCount, statusCounts } = action.payload;

        jobsAdapter.setAll(state, data);

        state.totalCount = totalCount;

        state.statusCounts = statusCounts;
        console.log(current(state), "CHECK THE CURRENT STAGE");
      })
      .addCase(fetchAvilableJobs.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchJobsBasedOnStatus.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(fetchJobsBasedOnStatus.fulfilled, (state, action) => {
        state.status = "suceeded";
        jobsAdapter.setAll(state, action.payload.data);
        state.totalCount = action.payload.totalCount;
      })
      .addCase(fetchJobsBasedOnStatus.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.error.message;
      })
      .addCase(deleteJob.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.status = "succeeded";
        console.log(action.payload, "ACTION PAYLOAD");
        jobsAdapter.removeOne(state, action.payload.jobId);

        const status = action.payload.status;
        if (state.statusCounts[status] > 0 && state.statusCounts["All"]) {
          state.statusCounts[status] -= 1;
          state.statusCounts["All"] -= 1;
        }

        state.totalCount -= 1;
        console.log(
          current(state),
          "THE CURRENT STATE AFTER REMOVAL OF THE JOB",
        );
      })
      .addCase(deleteJob.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.error.message;
      })
      .addCase(createJob.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.status = "succeeded";
        const job = action.payload;
        console.log(job, "PAYLOAD JOB");
        const statusVal = action.payload.status;
        console.log(statusVal, "THE NAME OF THE STATUS");
        console.log(job, statusVal, "NEW JOB");
        jobsAdapter.addOne(state, action.payload);
        state.totalCount += 1;
        state.statusCounts[statusVal] += 1;
        console.log(current(state), "CHECK THE CURRENT STAGE CREATE JOB");
      })
      .addCase(createJob.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload;
      })
      .addCase(updateJob.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        state.status = "succeeded";
        // const jobId=action.payload._id;
        jobsAdapter.updateOne(state, {
          id: action.payload._id,
          changes: action.payload,
        });
      })
      .addCase(updateJob.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload;
      })
      .addCase(fetchActiveJobs.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(fetchActiveJobs.fulfilled, (state, action) => {
        state.status = "succeeded";
        jobsAdapter.setAll(state, action.payload.data);
        state.totalCount =action.payload.totalCount;
      })
      .addCase(fetchActiveJobs.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload.data;
      });
  },
});

export const { jobUpdated, jobAdded, jobRemoved } = jobsSlice.actions;

export const jobsSelectors = jobsAdapter.getSelectors((state) => state.jobs);

export default jobsSlice.reducer;
