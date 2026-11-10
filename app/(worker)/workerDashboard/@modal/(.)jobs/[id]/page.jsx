"use client";
import JobDetailsPage from "@/components/JobShowDetails";
import Modal from "@/components/Modal";
import { useParams, useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const params = useParams();
  const id = params?.id;

  return (
    <Modal type={type} jobId={id} role="worker">
      <JobDetailsPage role="worker" id={id} isModal={true} type={type} />;
    </Modal>
  );
}
