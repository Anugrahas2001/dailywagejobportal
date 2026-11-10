// hooks/useJobActions.js
import { useDispatch } from "react-redux";
import {
  cancelAppliedJobs,
  fetchAppliedJobs,
} from "@/lib/features/workerJobs/appliedjobs/appliedJobThunk";
import {
  fetchJobInvitations,
  updateJobInvitationStatus,
} from "@/lib/features/workerJobs/jobinvitations/jobinvitationThunk";

export function useJobActions() {
  const dispatch = useDispatch();

  const handleCancelAppliedJob = async ({ jobId, page, sort, status }) => {
    await dispatch(cancelAppliedJobs(jobId)).unwrap();
    setPage(1);
    await dispatch(fetchAppliedJobs({ sort, status, page })).unwrap();
  };

  const handleJobInvitationStatus = async ({
    status: newStatus,
    jobId,
    employerId,
    page,
  }) => {
    await dispatch(
      updateJobInvitationStatus({ status: newStatus, jobId, employerId }),
    ).unwrap();
    await dispatch(fetchJobInvitations({ status: "Sent", page })).unwrap();
  };

  return { handleCancelAppliedJob, handleJobInvitationStatus };
}
