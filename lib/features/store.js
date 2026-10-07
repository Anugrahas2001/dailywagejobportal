//lib/features/store.js
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import savedJobReducer from "./workerJobs/savedjobs/savedJobSlice";
import appliedJobReducer from "./workerJobs/appliedjobs/appliedJobSlice";
import availableJobReducer from "./jobs/jobSlice";
import usersReducer from "./profiles/userSlice";
import searchAndFilterReducer from "./searchFilter/searchJobsSlice";
import jobInvitationReducer from "./workerJobs/jobinvitations/jobinvitationSlice";

console.log("🔥🔥 STORE CREATED");
// export const store = configureStore({
//   reducer: {
//     saved: savedJobReducer,
//     applied: appliedJobReducer,
//     jobs: availableJobReducer,
//     user: usersReducer,
//     searchJobs: searchAndFilterReducer,
//     jobinvitations: jobInvitationReducer,
//   },
// });

const appReducer = combineReducers({
  saved: savedJobReducer,
  applied: appliedJobReducer,
  jobs: availableJobReducer,
  user: usersReducer,
  searchJobs: searchAndFilterReducer,
  jobinvitations: jobInvitationReducer,
});

const rootReducer = (state, action) => {
  if (action.type === "auth/logout") {
    state = undefined; // each slice falls back to its initial state
  }
  console.log("STORE ClearED 🔥🔥 ");
  return appReducer(state, action);
};

export const store = configureStore({ reducer: rootReducer });
