import { createSlice, current } from "@reduxjs/toolkit";
import {
  fetchJobInvitations,
  updateJobInvitationStatus,
} from "./jobinvitationThunk";

const jobInvitationSlice = createSlice({
  name: "jobinvitations",
  initialState: {
    status: "idle",
    jobInvitations: [],
    error: null,
    totalCount: 0,
    successMessage: null,
  },

  reducers: {
    clearAllErrors: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchJobInvitations.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(fetchJobInvitations.fulfilled, (state, action) => {
        state.jobInvitations = action.payload.data;
        state.totalCount = action.payload.totalCount;
        state.status = "succeeded";
        state.successMessage = action.payload.message;

        console.log(current(state), "JOB INVITATIONS STATE AFTER FULFILLED");
      })
      .addCase(fetchJobInvitations.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload.message;
      })
      .addCase(updateJobInvitationStatus.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(updateJobInvitationStatus.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.successMessage = action.payload.message;
      });
  },
});

export const { clearAllErrors } = jobInvitationSlice.actions;
export default jobInvitationSlice.reducer;
