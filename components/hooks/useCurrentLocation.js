// // hooks/useCurrentLocation.js

// import useLoading from "./useLoading";

// export default function useCurrentLocationHook() {
//   const {loading,setLoading}=useLoading();

//   const getCurrentPosition = (options) =>
//     new Promise((resolve, reject) => {
//       navigator.geolocation.getCurrentPosition(resolve, reject, options);
//     });

//   const reverseGeocode = async (latitude, longitude) => {
//     const response = await fetch(
//       `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
//     );

//     if (!response.ok) {
//       throw new Error("Failed to fetch address");
//     }

//     const data = await response.json();

//     return {
//       city:
//         data.address.city ||
//         data.address.town ||
//         data.address.village ||
//         data.address.hamlet ||
//         "",
//       state: data.address.state || "",
//       country: data.address.country || "",
//       coordinates: [longitude, latitude],
//     };
//   };

//   const getLocation = async () => {
//     if (!navigator.geolocation) {
//       throw new Error("Geolocation is not supported.");
//     }

//     try {
//       setLoading(true);

//       const position = await getCurrentPosition({
//         enableHighAccuracy: false,
//         timeout: 15000,
//         maximumAge: 5 * 60 * 1000,
//       });

//       const { latitude, longitude } = position.coords;

//       return await reverseGeocode(latitude, longitude);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return { getLocation, loading };
// }



// hooks/useCurrentLocation.js
"use client"
import { useState } from "react";
import Loading from "../Loading";
import useLoading from "./useLoading";

export default function useCurrentLocationHook() {
  const { loading, setLoading } = useLoading();
   const [error, setError] = useState(null);


  if(loading){
    console.log(loading,"LOADING DATAAA");
    return <Loading/>
  }

  const getCurrentPosition = (options) =>
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });

  const reverseGeocode = async (latitude, longitude) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch address.");
    }

    const data = await response.json();

    return {
      city:
        data.address.city ||
        data.address.town ||
        data.address.village ||
        data.address.hamlet ||
        "",
      state: data.address.state || "",
      country: data.address.country || "",
      coordinates: [longitude, latitude],
    };
  };

  // const getLocation = async () => {
  //   if (typeof window === "undefined") {
  //     throw new Error("Window is not available.");
  //   }

  //   if (!navigator.geolocation) {
  //     throw new Error("Geolocation is not supported by this browser.");
  //   }

  //   try {
  //     setLoading(true);

  //     const position = await getCurrentPosition({
  //       enableHighAccuracy: false,
  //       timeout: 15000,
  //       maximumAge: 5 * 60 * 1000,
  //     });

  //     const { latitude, longitude } = position.coords;

  //     return await reverseGeocode(latitude, longitude);
  //   } catch (error) {
  //     if (error.code === 1) {
  //       throw new Error("Location permission denied.");
  //     }

  //     if (error.code === 2) {
  //       throw new Error("Location unavailable.");
  //     }

  //     if (error.code === 3) {
  //       throw new Error("Location request timed out.");
  //     }

  //     throw error;
  //   } finally {
  //     setLoading(false);
  //   }
  // };


   const mapGeoError = (error) => {
    if (error.code === 1) return new Error("Location permission denied.");
    if (error.code === 2) return new Error("Location unavailable.");
    if (error.code === 3) return new Error("Location request timed out.");
    return error;
  };

  const getLocation = async () => {
    if (typeof window === "undefined") {
      throw new Error("Window is not available.");
    }
    if (!navigator.geolocation) {
      throw new Error("Geolocation is not supported by this browser.");
    }

    setLoading(true);
    setError(null);

    try {
      let position;
      try {
        // First attempt: give it real time for a cold GPS/network fix
        position = await getCurrentPosition({
          enableHighAccuracy: false,
          timeout: 20000,
          maximumAge: 0,
        });
      } catch (err) {
        if (err.code === 3) {
          // Retry once with a longer timeout / high accuracy before giving up
          position = await getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 25000,
            maximumAge: 0,
          });
        } else {
          throw err;
        }
      }

      const { latitude, longitude } = position.coords;
      return await reverseGeocode(latitude, longitude);
    } catch (err) {
      const mapped = mapGeoError(err);
      setError(mapped);
      throw mapped;
    } finally {
      setLoading(false);
    }
  };
console.log(error,"ERROR DATA")
  return {
    getLocation,
    loading,
    error,
  };
}