"use client";
import Footer from "@/components/Footer";
import JobDetailsPage from "@/components/JobShowDetails";
import Modal from "@/components/Modal";
import NavBar from "@/components/NavBar";
import { useParams, useSearchParams } from "next/navigation";
// import { useParams } from "next/navigation";

export default function Page() {
  // const { id } = useParams();
  // console.log(id, "JOBiD DATA");
  const searchParams = useSearchParams();
    const type = searchParams.get("type");
    const params = useParams();
    const id = params?.id;
    console.log(type, id, "CHECK OUT THIS VALUE");

  return (
    <Modal>
      <NavBar />
      <JobDetailsPage role="worker" id={id} isModal={true} type={type} />;
      <Footer />
    </Modal>
  );
}
