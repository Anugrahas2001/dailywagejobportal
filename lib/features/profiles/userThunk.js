import { fetchUserToken } from "@/lib/fetchUserToken";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const step1Onboarding = createAsyncThunk(
  "/user/step1Onboarding",
  async ({ data }, { rejectWithValue }) => {
    try {
      const token = await fetchUserToken();

      const response = await fetch("/api/onboarding/profiledetails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const { result, message } = await response.json();
      console.log(result, "RESULT DATA");

      if (!response.ok) {
        return rejectWithValue(message || "Failed to save profile details.");
      }
      return { result, message };
    } catch (error) {
      console.error(error, "ERROR DATA");
      return rejectWithValue({
        message: error.message || "Failed to process step 1 of onboarding.",
      });
    }
  },
);

export const step2Onboarding = createAsyncThunk(
  "/user/step2Onboarding",
  async ({ body }, { rejectWithValue }) => {
    try {
      console.log(body, "SUBMITTED DATA");
      const token = await fetchUserToken();
      console.log(token, "TOKEN DATA");

      const response = await fetch("/api/onboarding/jobPrefernces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const { result, message } = await response.json();

      if (!response.ok) {
        return rejectWithValue(message || "Failed to save profile details.");
      }
      return { result, message };
    } catch (error) {
      console.log(error, "ERROR DATA");
      return rejectWithValue({
        message: error.message || "Failed to process step 2 of onboarding.",
      });
    }
  },
);

export const step3Onboarding = createAsyncThunk(
  "/user/step3Onboarding",
  async ({ body }, { rejectWithValue }) => {
    try {
      const token = await fetchUserToken();
      const response = await fetch("/api/onboarding/skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const { result, message } = await response.json();

      if (!response.ok) {
        return rejectWithValue(message || "Failed to update bio and skills.");
      }
      return { result, message };
    } catch (error) {
      return rejectWithValue({
        message: error.message || "Failed to process onboard step3",
      });
    }
  },
);

export const step4Onboarding = createAsyncThunk(
  "/user/step4Onboarding",
  async ({ profileImage }, { rejectWithValue }) => {
    try {
      const token = await fetchUserToken();
      const response = await fetch("/api/onboarding/ImageUpload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          profileImage,
        }),
      });

      const { result, message } = await response.json();
      if (!response.ok) {
        return rejectWithValue(message || "Failed to save profile image");
      }
      return { result, message };
    } catch (error) {
      console.log(error, "ERROR DATA");
      return rejectWithValue({
        message: error.message || "Failed to update profileImage",
      });
    }
  },
);

export const step5Onboarding = createAsyncThunk(
  "/user/step5Onboarding",
  async ({ profileImage }, { rejectWithValue }) => {
    try {
      const token = await fetchUserToken();
      const response = await fetch("/api/onboarding/faceverification", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profileImage }),
      });

      const { result, message } = await response.json();

      if (!response.ok) {
        throw new Error(message || "Failed to save profile details.");
      }

      return { result, message };
    } catch (error) {
      return rejectWithValue({
        message: error.message || "Failed to process step 5 of onboarding.",
      });
    }
  },
);

export const verifyLogin = createAsyncThunk(
  "/user/verifyLogin",
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/login", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      const { data, message } = await response.json();
      if (!response.ok) {
        return rejectWithValue(message || "Failed to verify logged in user.");
      }
      return { data, message };
    } catch (error) {
      console.log(error, "ERROR");
      return rejectWithValue({
        message: error.message || "Failed to verify logged in user.",
      });
    }
  },
);

export const login = createAsyncThunk(
  "/user/login",
  async ({ token, role }, { rejectWithValue }) => {
    console.log(token, role, "TOKENS AND ROLE");
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role,
        }),
      });
      const { data, message } = await response.json();

      if (!response.ok) {
        return rejectWithValue(message || "Failed to login with the user.");
      }
      return { data, message };
    } catch (error) {
      return rejectWithValue("Failed to login the user.");
    }
  },
);
