//lib/features/store.js
import { configureStore } from "@reduxjs/toolkit";
import savedJobReducer from "./workerJobs/savedjobs/savedJobSlice";
import appliedJobReducer from "./workerJobs/appliedjobs/appliedJobSlice";
import availableJobReducer from "./jobs/jobSlice";
import usersReducer from "./profiles/userSlice";
import searchAndFilterReducer from "./searchFilter/searchJobsSlice";

console.log("🔥🔥 STORE CREATED");
export const store = configureStore({
  reducer: {
    saved: savedJobReducer,
    applied: appliedJobReducer,
    jobs: availableJobReducer,
    user: usersReducer,
    searchJobs: searchAndFilterReducer,
  },
});
