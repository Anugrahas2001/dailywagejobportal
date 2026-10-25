// "use client";
// import { useEffect, useState } from "react";
// import { fetchUserToken } from "@/lib/fetchUserToken";

// const jobFetchUseEffcetHook = (id) => {
//   // const { id } = useParams();
//   // const { loading, setLoading } = useLoading();

//   const [role, setRole] = useState(null);
//   const [res, setResult] = useState(null);

//   // Read localStorage only on the client
//   useEffect(() => {
//     setRole(localStorage.getItem("role"));
//   }, []);

//   console.log(role, res, "ANUGRAHA RESULT");

//   useEffect(() => {
//     // Wait until both id and role are available
//     // if (!id || !role) return;

//     const loadJob = async () => {
//       try {
//         // setLoading(true);

//         const token = await fetchUserToken();
//         const url = `/api/${role}/jobs/${id}`;
//         console.log(url, "URL FETCH DATA");
//         const response = await fetch(url, {
//           method: "GET",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         if (!response.ok) {
//           throw new Error("Failed to fetch job details.");
//         }

//         const { result } = await response.json();
//         console.log(result, "AAAAAA MMMMM GGGGG");
//         setResult(result);
//       } catch (error) {
//         console.error(error);
//       } finally {
//         // setLoading(false);
//       }
//     };

//     loadJob();
//   }, [id, role]);
//   console.log("%%%%%%%%%%%%%#######$$$$$$$$$$$$$$$$$$$$", res);
//   return { res };
// };

// export default jobFetchUseEffcetHook;

"use client";
import { useEffect, useState } from "react";
import { fetchUserToken } from "@/lib/fetchUserToken";

const useJobFetchEffect = (id) => {
  const [role] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("role") : null,
  );
  console.log(role, "ROLE ROLE DATA");
  const [res, setResult] = useState(null);

  useEffect(() => {
    if (!id || !role) return; // guard restored

    const loadJob = async () => {
      try {
        const token = await fetchUserToken();
        const response = await fetch(`/api/${role}/jobs/${id}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Failed to fetch job details.");

        const { result } = await response.json();
        setResult(result);
      } catch (error) {
        console.error(error);
      }
    };

    loadJob();
  }, [id, role]);

  return { res };
};

export default useJobFetchEffect;
