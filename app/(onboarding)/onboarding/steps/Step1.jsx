"use client";
import React from "react";
import DatePicker from "../DatePicker";
import {  useRouter } from "next/navigation";
import Loading from "@/components/Loading";
import { Controller, useForm } from "react-hook-form";
import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";
import useLoading from "@/components/hooks/useLoading";
import { GENDER_TYPES } from "@/constants/constant";
import useCurrentLocationHook from "@/components/hooks/useCurrentLocation";
import { useDispatch, useSelector } from "react-redux";
import { step1Onboarding } from "@/lib/features/profiles/userThunk";

const Step1 = () => {
  const {
    register,
    setValue,
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm({
    dob: null,
    name: "",
    gender: "",
    city: "",
    state: "",
    country: "",
    mobileNumber: {
      code: "+91",
      number: "",
    },
    useCurrentLocation: false,
    location: {
      type: "Point",
      coordinates: [0, 0],
    },
  });

  const { loading, setLoading } = useLoading();
  const useCurrentLocation = watch("useCurrentLocation");
  const { getLocation } = useCurrentLocationHook();
  const dispatch = useDispatch();
  const router = useRouter();
const status=useSelector((state)=>state.user.status);

  const handleToggle = () => {
    const enabled = !useCurrentLocation;

    setValue("useCurrentLocation", enabled);

    if (enabled) {
      handleCurrentLocation();
    } else {
      setValue("city", "");
      setValue("state", "");
      setValue("country", "");
      setValue("location", {
        type: "Point",
        coordinates: [],
      });
    }
  };

  const handleCurrentLocation = async () => {
    try {
      setLoading(true);
      const location = await getLocation();

      setValue("location", {
        type: "Point",
        coordinates: location.coordinates,
      });

      setValue("city", location.city);
      setValue("state", location.state);
      setValue("country", location.country);
    } catch (error) {
      console.error(error);

      switch (error.code) {
        case error.PERMISSION_DENIED:
          alert("Location permission denied.");
          break;

        case error.POSITION_UNAVAILABLE:
          alert("Location information is unavailable.");
          break;

        case error.TIMEOUT:
          alert("Location request timed out. Please try again.");
          break;

        default:
          alert("Unable to fetch your location.");
      }
    } finally {
      setLoading(false);
    }
  };


  const handleStep1Onboarding = async (data) => {
    console.log(data, "DATA FOR THE BACKEND");

    const body = {
      name: data.name,
      gender: data.gender,
      dob: data.dob ? data.dob.toISOString().split("T")[0] : null,
      city: data.city,
      state: data.state,
      country: data.country,
      loc: data.location,
      mobileNumber: data.mobileNumber,
    };

    const result=await dispatch(step1Onboarding({ data: body })).unwrap();
     console.log("================ STEP1",result);
  if (result.role === "employer") {
      router.push(`/onboarding/${result.onboardPage}`);
    } else {
      router.push(`/onboarding/${result.onboardPage}`);
     
    }

  };

  return (
    <div className="mx-5 md:mx-16">
      <div className="mb-8 mt-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
          Complete Your Profile
        </h1>
        <p className="mt-2 text-sm md:text-base text-gray-500">
          {/* Tell us a bit about yourself so we can personalize your experience. */}
          Please provide your personal details to set up your account.
        </p>
      </div>
      <form onSubmit={handleSubmit(handleStep1Onboarding)}>
        <InputField
          label="Name"
          placeholder="Enter Your Name"
          {...register("name", {
            required: "Name is required",
            minLength: {
              value: 3,
              message: "Name must be at least 3 characters",
            },
            maxLength: {
              value: 50,
              message: "Name cannot exceed 50 characters",
            },
            pattern: {
              value: /^[A-Za-z ]+$/,
              message: "Only alphabets are allowed",
            },
            validate: (value) =>
              value.trim().length > 0 || "Name cannot be empty",
          })}
          error={errors.name?.message}
        />

        <SelectField
          label="Gender"
          options={GENDER_TYPES}
          {...register("gender", {
            required: "Please select a gender",
          })}
        />

        {errors.gender && <p>{errors.gender.message}</p>}

        <div className="flex flex-col gap-1 w-full max-w-xs">
          <label htmlFor="dob" className="text-sm font-medium">
            Date of Birth
          </label>

          <Controller
            name="dob"
            control={control}
            rules={{
              required: "Date of birth is required",
              validate: (value) => {
                if (!value) return "Date of birth is required";

                const today = new Date();
                let age = today.getFullYear() - value.getFullYear();
                const monthDiff = today.getMonth() - value.getMonth();
                const dayDiff = today.getDate() - value.getDate();

                // Adjust age if birthday hasn't occurred yet this year
                if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
                  age--;
                }

                if (age < 18) {
                  return "You must be at least 18 years old";
                }

                return true;
              },
            }}
            render={({ field }) => (
              <DatePicker
                id="dob"
                value={field.value}
                onChange={field.onChange}
                className={`border rounded-md px-3 py-2 text-sm ${
                  errors.dob ? "border-red-500" : "border-gray-300"
                }`}
              />
            )}
          />

          {errors.dob && (
            <p className="text-red-500 text-sm mt-1">{errors.dob.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 mt-4">
            Mobile Number
            <span className="text-gray-400 font-normal"> (optional)</span>
          </label>

          <div className="flex gap-2">
            {/* Fixed country code display */}
            <div className="flex items-center justify-center rounded-lg border bg-gray-50 px-3 text-sm font-medium text-gray-700 select-none">
              +91
            </div>

            {/* Hidden field to send code along with the form data */}
            <InputField
              type="hidden"
              value="+91"
              {...register("mobileNumber.code")}
            />

            <InputField
              type="tel"
              placeholder="Enter 10-digit mobile number"
              maxLength={10}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.mobileNumber?.number
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
              {...register("mobileNumber.number", {
                validate: (value) => {
                  if (!value) return true; // optional — empty is fine
                  if (!/^[6-9]\d{9}$/.test(value)) {
                    return "Enter a valid 10-digit mobile number";
                  }
                  return true;
                },
              })}
            />
          </div>

          {errors.mobileNumber?.number && (
            <p className="text-red-500 text-sm mt-1">
              {errors.mobileNumber.number.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between rounded-lg border p-2 mt-3 mb-3">
          <label
            htmlFor="use-current-location"
            className="text-sm font-medium mb-1.5 cursor-pointer"
          >
            Use Current Location
          </label>

          <button
            type="button"
            id="use-current-location"
            role="switch"
            aria-checked={useCurrentLocation}
            onClick={handleToggle}
            className={`relative h-6 w-12 shrink-0 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500 cursor-pointer ${
              useCurrentLocation ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span className="sr-only">
              {useCurrentLocation ? "Disable" : "Enable"} current location
            </span>
            <span
              className={`pointer-events-none absolute top-1 left-0 h-4 w-4 rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
                useCurrentLocation ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <InputField
          label="City"
          placeholder="Enter Your City"
          {...register("city", {
            required: "City is required",
            minLength: {
              value: 2,
              message: "City name must be at least 2 characters",
            },
            maxLength: {
              value: 50,
              message: "City name cannot exceed 50 characters",
            },
            pattern: {
              value: /^[A-Za-z]+(?: [A-Za-z]+)*$/,
              message: "State can only contain letters and single spaces",
            },
            validate: (value) =>
              value.trim().length > 0 || "State cannot be empty",
          })}
          error={errors.city?.message}
        />

        <InputField
          label="State"
          placeholder="Enter Your State"
          {...register("state", {
            required: "State is required",
            minLength: {
              value: 2,
              message: "State must be at least 2 characters long",
            },
            maxLength: {
              value: 50,
              message: "State cannot exceed 50 characters",
            },
            pattern: {
              value: /^[A-Za-z]+(?: [A-Za-z]+)*$/,
              message: "State can only contain letters and single spaces",
            },
            validate: (value) =>
              value.trim().length > 0 || "State cannot be empty",
          })}
          error={errors.state?.message}
        />

        <div>
          <InputField
            label="Country"
            placeholder="Enter Your Country"
            {...register("country", {
              required: "Country is required",
              minLength: {
                value: 2,
                message: "Country name must be at least 2 characters long",
              },
              maxLength: {
                value: 50,
                message: "Country name cannot exceed 50 characters",
              },
              pattern: {
                value: /^[A-Za-z]+(?: [A-Za-z]+)*$/,
                message: "Country can only contain letters and single spaces",
              },
              validate: (value) =>
                value.trim().length > 0 || "Country cannot be empty",
            })}
            error={errors.country?.message}
          />
        </div>
        {/* <div>
          <InputField
            type="number"
            {...register("experience", {
              required: "Experience is required",
              valueAsNumber: true,
              min: {
                value: 0,
                message: "Experience cannot be negative",
              },
              max: {
                value: 50,
                message: "Maximum experience is 50 years",
              },
            })}
            error={errors.experience?.message}
          />
        </div> */}

        <div className="flex justify-center w-full">
          <button
            type="submit"
            className="w-72 rounded-lg cursor-pointer bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Submit
          </button>
        </div>
      </form>
      {status==="pending" || loading && <Loading />}
    </div>
  );
};

export default Step1;















// "use client";
// import React, { useState } from "react";
// import DatePicker from "../DatePicker";
// import { auth } from "@/lib/firebaseClient";
// import { useRouter } from "next/navigation";
// import useLoading from "@/components/hooks/useLoading";
// import Loading from "@/components/Loading";

// const Step1 = () => {
//   const [dob, setDob] = useState(null);
//   const [name, setName] = useState("");
//   const [gender, setGender] = useState("");
//   const [city, setCity] = useState("");
//   const [state, setState] = useState("");
//   const [country, setCountry] = useState("");
//   const [experience, setExperience] = useState(0);
//   const {loading,setLoading}=useLoading();
//   const [location, setLocation] = useState({
//     type: "Point",
//     coordinates: [],
//   });
//   const router = useRouter();

//   const handleCurrentLocation = () => {
//     if (!navigator.geolocation) {
//       alert("Geolocation is not supported by your browser.");
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         const latitude = position.coords.latitude;
//         const longitude = position.coords.longitude;

//         console.log(latitude, longitude, "LAT AND LONG");

//         setLocation({
//           type: "Point",
//           coordinates: [longitude, latitude], // GeoJSON format
//         });

//         await reverseGeocode(latitude, longitude);
//       },
//       (error) => {
//         console.error(error);
//         alert("Unable to get your location.");
//       },
//       {
//         enableHighAccuracy: true,
//         timeout: 10000,
//         maximumAge: 0,
//       },
//     );
//   };

//   const reverseGeocode = async (latitude, longitude) => {
//     try {
//       const response = await fetch(
//         `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
//       );

//       const data = await response.json();
//       console.log(data.address, "ADDRESS OF THE USER");
//       // setCity(data.address.city || data.address.town || "");
//       setState(data.address.state || "");
//       setCountry(data.address.country || "");
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const handleStep1Onboarding = async (e) => {
//     e.preventDefault();

//     try {
//       setLoading(true);

//       const user = auth.currentUser;

//       if (!user) {
//         console.error("User is not logged in.");
//         return;
//       }

//       const token = await user.getIdToken();
//       console.log(token, "CURRENNT USER TOKEN");
//       const body = {
//         name,
//         gender,
//         dob: dob ? dob.toISOString().split("T")[0] : null,
//         city,
//         state,
//         onboardPage:2,
//         isOnboardingComplete:false,
//         loc: location,
//         country,
//         yearsOfExperience: experience,
//       };

//       const response = await fetch("/api/onboarding/profiledetails", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(body),
//       });

//       const result = await response.json();

//       if (!response.ok) {
//         console.error(result.message);
//         return;
//       }
//       router.push(`/onboarding/2`);

//       console.log("Profile updated:", result);
//     } catch (error) {
//       console.error("Failed to submit onboarding:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-slate-50">
//       <form onSubmit={handleStep1Onboarding}>
//         <div className="w-40 h-8">
//           <label className="text-center font-medium w-20 bg-red-400">Name</label>
//           <input
//             type="text"
//             value={name}
//             onChange={(e) => setName(e.target.value)} className="bg-red-500"
//           />
//         </div>
//         <div>
//           <label>Gender</label>
//           <input
//             type="text"
//             value={gender}
//             onChange={(e) => setGender(e.target.value)}
//           />
//         </div>
//         <div>
//           <label>Date of Birth</label>

//           <DatePicker value={dob} onChange={setDob} />
//         </div>
//         <button type="button" onClick={handleCurrentLocation}>
//           Use Current Location
//         </button>
//         <div>
//           <label>City</label>
//           <input
//             type="text"
//             value={city}
//             onChange={(e) => setCity(e.target.value)} className=""
//           />
//         </div>
//         <div>
//           <label>State</label>
//           <input
//             type="text"
//             value={state}
//             onChange={(e) => setState(e.target.value)}
//           />
//         </div>
//         <div>
//           <label>Country</label>
//           <input
//             type="text"
//             value={country}
//             onChange={(e) => setCountry(e.target.value)}
//           />
//         </div>
//         <div>
//           <label>Experience</label>
//           <input
//             type="number"
//             value={experience}
//             onChange={(e) => setExperience(Number(e.target.value))}
//           />
//         </div>

//         <button>Submit</button>
//       </form>
//       {loading&&<Loading/>}
//     </div>
//   );
// };

// export default Step1;
