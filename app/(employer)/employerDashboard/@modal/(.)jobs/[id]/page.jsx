// import JobDetailsPage from '@/components/JobShowDetails';
// import Modal from '@/components/Modal';
// import React from 'react'



// const page = () => {
//    return (
//     <Modal>
//       <JobDetailsPage />
//     </Modal>
//   );
// }

// export default page


import Footer from "@/components/Footer";
import JobDetailsPage from "@/components/JobShowDetails";
import Modal from "@/components/Modal";
import NavBar from "@/components/NavBar";

export default function Page() {
  return (
    <Modal>
      <NavBar />

      <JobDetailsPage role="employer"/>

      <Footer />
    </Modal>
  );
}