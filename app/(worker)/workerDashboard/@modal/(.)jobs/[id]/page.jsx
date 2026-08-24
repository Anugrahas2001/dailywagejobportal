// "use client";
import Footer from "@/components/Footer";
import JobDetailsPage from "@/components/JobShowDetails";
import Modal from "@/components/Modal";
import NavBar from "@/components/NavBar";
// import { useParams } from "next/navigation";

export default function Page() {
  // const { id } = useParams();
  // console.log(id, "JOBiD DATA");
  return (
    <Modal>
      <NavBar />

      <JobDetailsPage role="worker" isModal={true} />

      <Footer />
    </Modal>
  );
}
