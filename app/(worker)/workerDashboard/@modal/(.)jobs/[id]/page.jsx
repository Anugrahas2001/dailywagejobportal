import Footer from "@/components/Footer";
import JobDetailsPage from "@/components/JobShowDetails";
import Modal from "@/components/Modal";
import NavBar from "@/components/NavBar";

export default function Page() {
  return (
    <Modal>
      <NavBar />

      <JobDetailsPage role="worker" isModal={true}/>

      <Footer />
    </Modal>
  );
}