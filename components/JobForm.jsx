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
  MAX_NUM_SKILLS,
  SALARY_CREDIT_TYPES,
  SHIFT_TYPE_OPTIONS,
} from "@/constants/constant";
import useLoading from "./hooks/useLoading";
import useCurrentLocationHook from "./hooks/useCurrentLocation";
import Loading from "./Loading";
import { useSelector } from "react-redux";
import Error from "./Error";
import { clearJobsError } from "@/lib/features/jobs/jobSlice";
import { createJob, updateJob } from "@/lib/features/jobs/jobThunk";
import useControls from "./hooks/useControls";

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
      genderPreference: "",
      jobDescription: "",
      jobShift: "",
      city: "",
      state: "",
      country: "India",
      availability: "",
      numberOfOpenings: 1,
      minSalary: 400,
      maxSalary: 800,
      currency: "INR",
      salaryType: "",
      skillsRequired: [],
      responsibilities: [],
      useCurrentLocation: false,
      loc: {
        type: "Point",
        coordinates: [0, 0],
      },
      status: "Active",
    },
  });
  const { loading, setLoading } = useLoading();
  const selectedCategory = watch("jobCategory");
  const skillsRequired = JOB_SKILLS[selectedCategory] || [];
  const selectedSkills = watch("skillsRequired");
  const selectedResponsibilities = watch("responsibilities");
  const [responsibility, setResponsibility] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const useCurrentLocation = watch("useCurrentLocation");
  const { getLocation } = useCurrentLocationHook();
  const {
    page,
    setPage,
    router,
    dispatch,
    runWithPending,
    isPending,
    initialLoading,
    setInitialLoading,
  } = useControls();

  console.log(SHIFT_TYPE_OPTIONS, "SHIFT TYPES VALUES");

  const error = useSelector((state) => state.jobs.error);
  const status = useSelector((state) => state.jobs.status);
  // const allJobsStatus = useSelector((state) => state.jobs.status);
  // const status = statusss || allJobsStatus;

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

    if (currentSelectedSkills.length >= MAX_NUM_SKILLS) {
      alert(`You can select a maximum of ${MAX_NUM_SKILLS} skills.`);
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
      setIsAdding(false); // <-- was missing, caused isAdding to stay true
      return;
    }

    // Max limit check
    if (currentResponsibilities.length >= 8) {
      alert("You can only add up to 8 responsibilities.");
      setIsAdding(false); // <-- reset here too
      return;
    }

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
      setValue("loc", {
        type: "Point",
        coordinates: [],
      });
    }
  };

  const handleCurrentLocation = async () => {
    try {
      setLoading(true);
      const location = await getLocation();
      setValue("loc", {
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

  // const onSubmit = async (data) => {
  //   console.log(data, "DATA SEND TO THE BACKEND");
  //   if (mode === "create") {
  //     dispatch(createJob({ body: data }));
  //   } else {
  //     dispatch(updateJob({ body: data, id: initialData._id }));
  //     await dispatch(fetchAvilableJobs({ page: 1 })).unwrap();
  //   }

  //   router.push("/employerDashboard");
  // };

  const onSubmit = async (data) => {
    try {
      if (mode === "create") {
        console.log(data, "===================%%%%%%%%%%%%%%%###########");
        await dispatch(createJob({ body: data })).unwrap();
      } else {
        await dispatch(updateJob({ body: data, id: initialData._id })).unwrap();
        // await dispatch(fetchAvilableJobs({ page: 1 })).unwrap();
      }
      router.push("/employerDashboard");
    } catch (error) {
      console.error(error);
      // show a toast / inline error to the user here
    }
  };

  return (
    <div className="mx-auto max-w-5xl rounded-lg bg-white p-6 shadow">
      {/* <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
    {mode === "create" ? "Create Job" : "Edit Job"}
  </h2> */}
      <div className="mb-8 flex items-center gap-3">
        <span className="h-10 w-1.5 rounded-full bg-blue-600" />
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            {mode === "create" ? "Create Job" : "Edit Job"}
          </h2>
          <p className="text-sm text-gray-500">
            {mode === "create"
              ? "Post a new opening"
              : "Modify your job posting"}
          </p>
        </div>
        <span
          className={`ml-auto rounded-full px-3 py-1 text-xs font-medium ${
            mode === "create"
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {mode === "create" ? "New" : "Editing"}
        </span>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-5 md:grid-cols-2 mt-6"
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
          options={Object.entries(GENDER_TYPES).map(([key, value]) => ({
            label: key,
            value: value,
          }))}
          {...register("genderPreference", {
            required: "Please select a gender",
          })}
          error={errors.genderPreference?.message}
        />

        {/* Shift */}
        <SelectField
          label="Shift"
          options={Object.entries(SHIFT_TYPE_OPTIONS).map(([key, value]) => ({
            value: value.value,
            label: value.label,
          }))}
          {...register("jobShift", {
            required: "Shift is required",
          })}
          error={errors.jobShift?.message}
        />

        {/* Availability */}
        <SelectField
          label="Joining"
          options={Object.entries(JOINING_TYPES).map(([key, value]) => ({
            label: key,
            value: value,
          }))}
          {...register("availability", {
            required: "Joining availability is required",
          })}
          error={errors.availability?.message}
        />

        {/* Salary Type */}
        <SelectField
          label="Salary Type"
          options={Object.entries(SALARY_CREDIT_TYPES).map(([key, value]) => ({
            label: key,
            value: value,
          }))}
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
      </form>
      {(status === "pending" || loading) && <Loading />}
      {error && (
        <Error error={error} onClick={() => dispatch(clearJobsError())} />
      )}
    </div>
  );
};

export default JobForm;
