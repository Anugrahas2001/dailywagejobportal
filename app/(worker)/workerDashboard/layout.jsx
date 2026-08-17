import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";

export default function EmployerDashboardLayout({ children, modal }) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
