import { fetchUserToken } from "@/lib/fetchUserToken";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const fetchJobInvitations = createAsyncThunk(
  "/jobinvitations/fetchJobInvitations",
  async ({ status,page }, { rejectWithValue }) => {
    try {
      console.log("inside fetch all jobs");
      const token = await fetchUserToken();
      const response = await fetch(
        `/api/worker/jobInvitations?status=${status}&page=${page}&limit=12`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const { data, totalCount, message } = await response.json();
      if (!response.ok) {
        console.log("Something wrong with fetching jobInvitations.");
        return rejectWithValue({
          message: message || "Failed to apply for the job.",
        });
      }

      return { data, totalCount, message };
    } catch (error) {
      console.log(error, "FETCH JOBINVITATIONS THUNK ERROR");
      return rejectWithValue({
        message: error.message || "Failed to fetch job invitations.",
      });
    }
  },
);

export const updateJobInvitationStatus = createAsyncThunk(
  "/jobinvitations/updateJobInvitationStatus",
  async ({ status, jobId }, { rejectWithValue }) => {
    try {
      const token = await fetchUserToken();
      const response = await fetch("/api/worker/jobInvitations", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, jobId }),
      });

      const { data, message } = await response.json();

      if (!response.ok) {
        console.log(
          "Something went wrong with updating job invitation status.",
        );
        return rejectWithValue({
          message: message || "Failed to update job invitation status.",
        });
      }

      return { data, message };
    } catch (error) {
      console.log(error, "ERROR DATA");

      return rejectWithValue({
        message: error.message || "Failed to update status of the job ",
      });
    }
  },
);
