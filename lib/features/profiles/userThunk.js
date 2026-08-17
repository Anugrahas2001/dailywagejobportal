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

      const {result} = await response.json();
      console.log(result, "RESULT DATA");

      if (!response.ok) {
      
        return rejectWithValue(
          "Failed to save profile details.",
        );
      }
      return result;
    } catch (error) {
          console.error("🔥 STEP 1 THUNK ERROR:", error);
      return rejectWithValue("Failed to process step 1 of onboarding.");
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
      const {result} = await response.json();

      if (!response.ok) {
        return rejectWithValue("Failed to save profile details.");
      }
      return result;
    } catch (error) {
      return rejectWithValue("Failed to process step 2 of onboarding.");
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
      const {result} = await response.json();
      console.log(result, "RESPONSE FROM THE BACKEND");
      // const { data } = result;

      if (!response.ok) {
        return rejectWithValue("Failed to save skills.");
      }
      return result;
    } catch (error) {
      return rejectWithValue("Failed to process onboard step3");
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

      if (!response.ok) {
        return rejectWithValue("Failed to save profile image");
      }
      const {result} = await response.json();
      return result;
    } catch (error) {
      return rejectWithValue("Failed to update profileImage");
    }
  },
);

export const step5Onboarding = createAsyncThunk(
  "/user/step5Onboarding",
  async ({profileImage}, { rejectWithValue }) => {
    try {
      const token = await fetchUserToken();
      const response = await fetch("/api/onboarding/faceverification", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileImage),
      });

      const result = await response.json();

      if (!response.ok) {
        setVerificationStatus("failed");
        console.error(result.message);
        throw new Error(result.message || "Failed to save profile details.");
      }
      setVerificationStatus("success");
    } catch (error) {
      return rejectWithValue("Failed to process step 5 of onboarding.");
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

      if (!response.ok) {
        return rejectWithValue("Failed to login");
      }
      const { data } = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue("Failed to login");
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
      const { data } = await response.json();

      if (!response.ok) {
        return rejectWithValue("Failed to login with the user.");
      }
      return data;
    } catch (error) {
      return rejectWithValue("Failed to login the user.");
    }
  },
);
