// jobsSelectors.js
import { jobsSelectors } from './jobSlice';

// Employer sees everything
export const selectAllJobsForEmployer = jobsSelectors.selectAll;

export const selectAllJobsForWorker = jobsSelectors.selectAll;
// Worker sees only active jobs — memoized, only recomputes when jobs change
// export const selectActiveJobsForWorker = createSelector(
//   jobsSelectors.selectAll,
//   (jobs) => jobs.filter((job) => job.status === 'Active')
// );

