"use client";
import Error from "@/components/Error";
import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";
import Loading from "@/components/Loading";
import {
  JOB_SKILLS,
  JOINING_TYPES,
  SALARY_CREDIT_TYPES,
  SHIFT_TYPES,
} from "@/constants/constant";
import { clearOnboardingError } from "@/lib/features/profiles/userSlice";
import { step2Onboarding } from "@/lib/features/profiles/userThunk";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

const Step2 = () => {
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      jobTitle: "",
      jobCategory: "",
      minSalary: 400,
      maxSalary: 800,
      salaryCreditType: "",
      joiningPeriod: "",
      shiftType: "",
      locRange: 10,
    },
  });
  const router = useRouter();
  const error = useSelector((state) => state.user.error);

  const jobCategory = watch("jobCategory");
  console.log(jobCategory, "CATEGORY FROM THE FORM");
  const dispatch = useDispatch();
  const status = useSelector((state) => state.user.status);

  const onSubmit = async (data) => {
    try {
      const { result } = await dispatch(
        step2Onboarding({ body: data }),
      ).unwrap();
      const { onboardPage, isOnboardingComplete } = result;

      router.push(`/onboarding/${onboardPage}?category=${jobCategory}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mx-5 md:mx-16">
      <div className="mb-8 mt-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
          Complete Your Job Preferences
        </h1>
        <p className="mt-2 text-sm md:text-base text-gray-500">
          {/* Tell us a bit about yourself so we can personalize your experience. */}
          Set your job preferences to help us find opportunities that fit you
          best.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <InputField
          label="Job Title"
          placeholder="Job Title"
          {...register("jobTitle", {
            required: "Title is required",
            minLength: { value: 3, message: "At least 3 characters" },
          })}
          error={errors.jobTitle?.message}
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

        <InputField
          label="Minimum Salary/Day"
          type="number"
          placeholder="Minimum Salary"
          min={400}
          max={10000}
          {...register("minSalary", {
            required: "Please select a minimum salary",
            valueAsNumber: true,
          })}
          error={errors.minSalary?.message}
        />

        <InputField
          label="Maximum Salary/Day"
          type="number"
          placeholder="Maximum Salary"
          min={800}
          max={10000}
          {...register("maxSalary", {
            required: "Please select a maximum salary",
            valueAsNumber: true,
          })}
          error={errors.maxSalary?.message}
        />

        <InputField
          label="Location Range in KM"
          type="number"
          placeholder="Location Range"
          min={10}
          max={1000}
          {...register("locRange", {
            required: "Location range is required",
            valueAsNumber: true,
          })}
          error={errors.locRange?.message}
        />

        <SelectField
          label="Shift Type"
          options={SHIFT_TYPES}
          {...register("shiftType", {
            required: "Please select a shift type",
          })}
          error={errors.shiftType?.message}
        />

        {/* {errors.shiftType && (
          <p className="text-red-500"></p>
        )} */}

        <SelectField
          label="Salary Credit Type"
          options={SALARY_CREDIT_TYPES}
          {...register("salaryCreditType", {
            required: "Please select a salary credit type",
          })}
          error={errors.salaryCreditType?.message}
        />

        {/* {errors.salaryCreditType && (
          <p className="text-red-500"></p>
        )} */}

        <SelectField
          label="Joining Period"
          options={JOINING_TYPES}
          {...register("joiningPeriod", {
            required: "Please select a joining period",
          })}
          error={errors.joiningPeriod?.message}
        />

        <div className="flex justify-center w-full">
          <button
            disabled={status === "pending"}
            type="submit"
            className="w-72 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {status === "pending" ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>

      {status === "pending" && <Loading />}
      {error && (
        <Error error={error} onClick={dispatch(clearOnboardingError())} />
      )}
    </div>
  );
};

export default Step2;
