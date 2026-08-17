"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";

import {
  GENDER_TYPES,
  JOB_SKILLS,
  JOB_STATUS,
  JOINING_TYPES,
  SALARY_CREDIT_TYPES,
  SHIFT_TYPES,
} from "@/constants/constant";
import { fetchUserToken } from "@/lib/fetchUserToken";
import { useRouter } from "next/navigation";
import useLoading from "./hooks/useLoading";
import useCurrentLocationHook from "./hooks/useCurrentLocation";
import Loading from "./Loading";
import { useDispatch } from "react-redux";
import { createJob, updateJob } from "@/lib/features/jobs/jobThunk";

const JobForm = ({ mode, initialData }) => {
  const {
    register,
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      jobName: "",
      jobCategory: "Construction",
      genderPreference: "Any",
      jobDescription: "",
      jobShift: "full_day",
      city: "",
      state: "",
      country: "India",
      availability: "immediate",
      numberOfOpenings: 1,
      minSalary: 500,
      maxSalary: 1000,
      currency: "INR",
      salaryType: "daily",
      skillsRequired: [],
      responsibilities: [],
      useCurrentLocation: false,
      location: {
        type: "Point",
        coordinates: [0, 0],
      },
      status: "Active",
    },
  });
  const { loading, setLoading } = useLoading();
  const router = useRouter();
  const selectedCategory = watch("jobCategory");
  const skillsRequired = JOB_SKILLS[selectedCategory] || [];
  const selectedSkills = watch("skillsRequired");
  const selectedResponsibilities = watch("responsibilities");
  const [responsibility, setResponsibility] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const useCurrentLocation = watch("useCurrentLocation");
  const { getLocation } = useCurrentLocationHook();
  const dispatch=useDispatch();

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  const handleDelete = (indx) => {
    const currentResponsibilities = watch("responsibilities");
    console.log("NOW AVILABLE RESPONSIBILITIES", currentResponsibilities);
    const filteredResp = currentResponsibilities.filter(
      (_, index) => index !== indx,
    );

    setValue("responsibilities", filteredResp);
  };

  const handleSkillSelect = (skill) => {
    console.log(skill, "SELECTED SKILL");

    const currentSelectedSkills = watch("skillsRequired");

    if (currentSelectedSkills.includes(skill)) {
      setValue(
        "skillsRequired",
        currentSelectedSkills.filter((s) => s !== skill),
      );
      return;
    }

    if (currentSelectedSkills.length >= 5) {
      alert("You can select a maximum of 5 skills.");
      return;
    }

    setValue("skillsRequired", [...currentSelectedSkills, skill]);
  };

  const handleResponsibilities = () => {
    const trimmedResponsibility = responsibility.trim();
    if (!trimmedResponsibility) return;
    setIsAdding(true);
    const currentResponsibilities = watch("responsibilities");
    if (currentResponsibilities.includes(trimmedResponsibility)) {
      return;
    }
    console.log("NOW AVILABLE RESPONSIBILITIES", currentResponsibilities);
    setValue("responsibilities", [
      ...currentResponsibilities,
      trimmedResponsibility,
    ]);
    setResponsibility("");
    setTimeout(() => {
      setIsAdding(false);
    }, 0);
  };

  const handleToggle = () => {
    const enabled = !useCurrentLocation;
    setValue("useCurrentLocation", enabled);
    if (enabled) {
      handleCurrentLocation();
    }
    {
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
      console.log(location, "LOCATION DATA");
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

  const onSubmit = async (data) => {
    console.log(data, "DATA SEND TO THE BACKEND");
    if (mode === "create") {
      // await fetch("/api/employer/job", {
      //   method: "POST",
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      //   body: JSON.stringify(data),
      // });

      dispatch(createJob({data}))
      
    } else {
      // await fetch(`/api/employer/job/${initialData._id}`, {
      //   method: "PUT",
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      //   body: JSON.stringify(data),
      // });
      dispatch(updateJob({data,id:initialData._id}));
    }

    router.push("/employerDashboard");
  };

  return (
    <div className="mx-auto max-w-5xl rounded-lg bg-white p-6 shadow">
      <h2>{mode === "create" ? "Create Job" : "Edit Job"}</h2>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-5 md:grid-cols-2"
      >
        {/* Job Name */}
        <InputField
          label="Job Title"
          placeholder="Enter Job Title"
          {...register("jobName", {
            required: "Job title is required",
            minLength: {
              value: 3,
              message: "Minimum 3 characters",
            },
            maxLength: {
              value: 100,
              message: "Maximum 100 characters",
            },
          })}
          error={errors.jobName?.message}
        />

        <SelectField
          label="Job Category"
          options={Object.keys(JOB_SKILLS).map((category) => ({
            value: category,
            label: category,
          }))}
          {...register("jobCategory", {
            required: "Job Category is required",
          })}
          error={errors.jobCategory?.message}
        />

        {/* Description */}
        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium">
            Job Description
          </label>

          <textarea
            rows={5}
            className="w-full rounded-lg border p-3 focus:border-blue-500 focus:outline-none"
            placeholder="Describe the job..."
            {...register("jobDescription", {
              required: "Job description is required",
              minLength: {
                value: 30,
                message: "Minimum 30 characters",
              },
              maxLength: {
                value: 5000,
                message: "Maximum 5000 characters",
              },
            })}
          />

          {errors.jobDescription && (
            <p className="mt-1 text-sm text-red-500">
              {errors.jobDescription.message}
            </p>
          )}
        </div>

        <div className="md:col-span-2 mt-4">
          <label className="mb-2 block text-sm font-medium">
            Required Skills
          </label>

          <div className="flex flex-wrap gap-2 w-full mt-4">
            {/* <ul> */}
            {skillsRequired.map((skill) => (
              <button
                key={skill}
                onClick={() => {
                  handleSkillSelect(skill);
                }}
                type="button"
                className={`rounded-full border px-4 py-2 text-sm transition cursor-pointer
    ${
      selectedSkills.includes(skill)
        ? "bg-blue-600 text-white border-blue-600"
        : "bg-white text-gray-700 hover:bg-blue-50"
    }
  `}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="block text-sm font-medium mb-1.5">
            Responsibilities
          </label>

          <div className="flex items-center gap-3 w-full mt-2">
            <div className="flex-1">
              <input
                placeholder="Enter a responsibility"
                value={responsibility}
                className=" w-full px-3 py-3 rounded-lg border text-sm
          placeholder:text-gray-400
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-offset-0 border-gray-300 focus:ring-blue-200 focus:border-blue-500"
                onChange={(e) => setResponsibility(e.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={handleResponsibilities}
              disabled={isAdding}
              className={`px-5 py-3 rounded-lg whitespace-nowrap text-white transition
    ${
      isAdding
        ? "bg-blue-400 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700"
    }`}
            >
              {isAdding ? "Adding" : "Add"}
            </button>
          </div>
        </div>
        {/* <div> */}
        {/* <div className="md:col-span-2 mt-2">
          {selectedResponsibilities.length > 0 && (
            <ul>
              {selectedResponsibilities.map((resp, index) => (
                <li
                  key={index}
                  className="text-gray-700 rounded-lg py-2 px-3 border list-disc list-inside space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span>{resp}</span>
                    <button
                      className="text-red-500"
                      onClick={() => handleDelete(index)}
                    >
                      X
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div> */}

        <div className="md:col-span-2 mt-2">
          {selectedResponsibilities.length > 0 && (
            <ul className="list-disc pl-6 space-y-2">
              {selectedResponsibilities.map((resp, index) => (
                <li key={index}>
                  <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                    <span>{resp}</span>

                    <button
                      disabled={loading}
                      type="button"
                      className="text-red-500 hover:text-red-700 font-semibold"
                      onClick={() => handleDelete(index)}
                    >
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* </div> */}
        {/* Gender */}
        <SelectField
          label="Preferred Gender"
          options={GENDER_TYPES}
          {...register("genderPreference", {
            required: "Please select a gender",
          })}
          error={errors.genderPreference?.message}
        />

        {/* Shift */}
        <SelectField
          label="Shift"
          options={SHIFT_TYPES}
          {...register("jobShift", {
            required: "Shift is required",
          })}
          error={errors.jobShift?.message}
        />

        {/* Availability */}
        <SelectField
          label="Joining"
          options={JOINING_TYPES}
          {...register("availability", {
            required: "Joining availability is required",
          })}
          error={errors.availability?.message}
        />

        {/* Salary Type */}
        <SelectField
          label="Salary Type"
          options={SALARY_CREDIT_TYPES}
          {...register("salaryType", {
            required: "Salary type is required",
          })}
          error={errors.salaryType?.message}
        />

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
            disabled={loading}
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

        {/* City */}
        <InputField
          label="City"
          placeholder="Kochi"
          {...register("city", {
            required: "City is required",
          })}
          error={errors.city?.message}
        />

        {/* State */}
        <InputField
          label="State"
          placeholder="Kerala"
          {...register("state", {
            required: "State is required",
          })}
          error={errors.state?.message}
        />

        {/* Country */}
        <InputField
          label="Country"
          placeholder="India"
          {...register("country", {
            required: "Country is required",
          })}
          error={errors.country?.message}
        />

        {/* Openings */}
        <InputField
          type="number"
          label="Number of Openings"
          {...register("numberOfOpenings", {
            required: "Number of openings is required",
            valueAsNumber: true,
            min: {
              value: 1,
              message: "Must be at least 1",
            },
          })}
          error={errors.numberOfOpenings?.message}
        />

        {/* Minimum Salary */}
        <InputField
          type="number"
          label="Minimum Salary Per Day"
          {...register("minSalary", {
            required: "Minimum salary is required",
            valueAsNumber: true,
            min: {
              value: 0,
              message: "Salary cannot be negative",
            },
          })}
          error={errors.minSalary?.message}
        />

        {/* Maximum Salary */}
        <InputField
          type="number"
          label="Maximum Salary Per Day"
          {...register("maxSalary", {
            required: "Maximum salary is required",
            valueAsNumber: true,
            validate: (value, formValues) =>
              value >= formValues.minSalary ||
              "Maximum salary must be greater than or equal to minimum salary",
          })}
          error={errors.maxSalary?.message}
        />

        <SelectField
          label="Status"
          options={JOB_STATUS}
          {...register("status", {
            required: "Status is required",
          })}
          error={errors.status?.message}
        />

        {/* Currency */}
        {/* <InputField
          label="Currency"
          {...register("currency", {
            required: "Currency is required",
          })}
          error={errors.currency?.message}
        /> */}

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full cursor-pointer rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
          >
            {isSubmitting
              ? mode === "create"
                ? "Creating..."
                : "Updating..."
              : mode === "create"
                ? "Create Job"
                : "Update Job"}
          </button>
        </div>

        {/* <div className="flex justify-center w-full">
          <button
            type="submit"
            className="w-72 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Create Job
          </button>
        </div> */}
      </form>
      {loading && <Loading />}
    </div>
  );
};

export default JobForm;
