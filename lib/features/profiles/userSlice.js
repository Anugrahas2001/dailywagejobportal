import { createSlice, current } from "@reduxjs/toolkit";
import {
  login,
  step1Onboarding,
  step2Onboarding,
  step3Onboarding,
  step4Onboarding,
  step5Onboarding,
  verifyLogin,
} from "./userThunk";

const userSlice = createSlice({
  name: "user",
  initialState: {
    status: "idle",
    error: null,
    userId: "",
    role: "",
    name: "",
    profileImage: "",
    onboardPage: 1,
    isOnboardingCompleted: false,
    successMessage: null,
  },
  reducers: {
    clearOnboardingError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(step1Onboarding.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(step1Onboarding.fulfilled, (state, action) => {
        console.log(action.payload, "PAYLOAD DATA ACTION");
        state.status = "succeeded";
        state.name = action.payload.result.name;
        state.role = action.payload.result.role;
        state.profileImage = action.payload.result.profileImage;
        state.onboardPage = action.payload.result.onboardPage;
        state.isOnboardingCompleted =
          action.payload.result.isOnboardingComplete;
        state.successMessage = action.payload.message;

        localStorage.setItem("onboardPage", action.payload.result.onboardPage);
        localStorage.setItem(
          "isOnboardingCompleted",
          action.payload.result.isOnboardingComplete,
        );
        console.log(current(state), "step1Onboarding");
      })
      .addCase(step1Onboarding.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload?.message || "Something went wrong.";

        state.successMessage = null;
      })
      .addCase(step2Onboarding.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(step2Onboarding.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.onboardPage = action.payload.result.onboardPage;
        state.isOnboardingCompleted =
          action.payload.result.isOnboardingComplete;
        state.role = action.payload.result.role;
        state.successMessage = action.payload.message;

        localStorage.setItem("onboardPage", action.payload.result.onboardPage);
        localStorage.setItem(
          "isOnboardingCompleted",
          action.payload.result.isOnboardingComplete,
        );
        console.log(current(state), "step2Onboarding");
      })
      .addCase(step2Onboarding.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload?.message || "Something went wrong.";

        state.successMessage = null;
      })
      .addCase(step3Onboarding.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(step3Onboarding.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.onboardPage = action.payload.result.onboardPage;
        state.isOnboardingCompleted =
          action.payload.result.isOnboardingComplete;
        state.role = action.payload.result.role;
        state.successMessage = action.payload.message;

        localStorage.setItem("onboardPage", action.payload.result.onboardPage);
        localStorage.setItem(
          "isOnboardingCompleted",
          action.payload.result.isOnboardingComplete,
        );

        console.log(current(state), "step3Onboarding");
      })
      .addCase(step3Onboarding.rejected, (state, action) => {
        state.status = "rejecetd";
        state.error = action.payload?.message || "Something went wrong.";

        state.successMessage = null;
      })
      .addCase(step4Onboarding.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(step4Onboarding.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profileImage = action.payload.result.profileImage;
        state.onboardPage = action.payload.result.onboardPage;
        state.isOnboardingCompleted =
          action.payload.result.isOnboardingComplete;
        state.role = action.payload.result.role;
        state.successMessage = action.payload.message;

        localStorage.setItem(
          "profileImage",
          action.payload.result.profileImage,
        );
        localStorage.setItem("onboardPage", action.payload.result.onboardPage);
        localStorage.setItem(
          "isOnboardingCompleted",
          action.payload.result.isOnboardingComplete,
        );

        console.log(current(state), "step4Onboarding");
      })
      .addCase(step4Onboarding.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload?.message || "Something went wrong.";

        state.successMessage = null;
      })

      .addCase(step5Onboarding.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(step5Onboarding.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.onboardPage = action.payload.result.onboardPage;
        state.isOnboardingCompleted =
          action.payload.result.isOnboardingComplete;
        state.role = action.payload.result.role;
        state.successMessage = action.payload.message;

        localStorage.setItem("onboardPage", action.payload.result.onboardPage);
        localStorage.setItem(
          "isOnboardingCompleted",
          action.payload.result.isOnboardingComplete,
        );

        console.log(current(state), "step5Onboarding");
      })
      .addCase(step5Onboarding.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload?.message || "Something went wrong.";
        state.successMessage = null;
      })
      .addCase(login.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.role = action.payload.data.role;
        state.profileImage = action.payload.data.profileImage;
        state.onboardPage = action.payload.data.onboardPage;
        state.isOnboardingCompleted = action.payload.data.isOnboardingComplete;
        state.successMessage = action.payload.message;

        localStorage.setItem("onboardPage", action.payload.data.onboardPage);
        localStorage.setItem(
          "isOnboardingCompleted",
          action.payload.data.isOnboardingComplete,
        );

        console.log(current(state), "login");
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload?.message || "Something went wrong.";

        state.successMessage = null;
      })
      .addCase(verifyLogin.pending, (state) => {
        state.status = "pending";
        state.error = null;
      })
      .addCase(verifyLogin.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.role = action.payload.data.role;
        state.onboardPage = action.payload.data.onboardPage;
        state.isOnboardingCompleted = action.payload.data.isOnboardingComplete;
        state.successMessage = action.payload.message;

        localStorage.setItem("onboardPage", action.payload.data.onboardPage);
        localStorage.setItem(
          "isOnboardingCompleted",
          action.payload.data.isOnboardingComplete,
        );

        console.log(current(state), "verifyLogin");
      })
      .addCase(verifyLogin.rejected, (state, action) => {
        state.status = "rejected";
        state.error = action.payload?.message || "Something went wrong.";

        state.successMessage = null;
      });
  },
});

export const { clearOnboardingError } = userSlice.actions;
export default userSlice.reducer;
