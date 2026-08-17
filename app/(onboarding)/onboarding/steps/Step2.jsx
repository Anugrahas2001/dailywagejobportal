"use client";
import InputField from "@/components/form/InputField";
import SelectField from "@/components/form/SelectField";
import Loading from "@/components/Loading";
import {
  JOB_SKILLS,
  JOINING_TYPES,
  SALARY_CREDIT_TYPES,
  SHIFT_TYPES,
} from "@/constants/constant";
import { step2Onboarding } from "@/lib/features/profiles/userThunk";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
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
      minSalary: 1000,
      maxSalary: 2000,
      salaryCreditType: "daily",
      joiningPeriod: "immediate",
      shiftType: "full_day",
      locRange: 10,
    },
  });
  const router = useRouter();

  const jobCategory = watch("jobCategory");
  console.log(jobCategory, "CATEGORY FROM THE FORM");
  const dispatch = useDispatch();
  // const role = useSelector((state) => state.user.role);
  // const onboardPage = useSelector((state) => state.user.onboardPage);
  const status = useSelector((state) => state.user.status);

  const onSubmit = async (data) => {
    try {
      const {role,onboardPage}=await dispatch(step2Onboarding({ body: data })).unwrap();
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

        {/* <InputField
          label="Job Category"
          placeholder="Job Category"
          {...register("jobCategory", {
            required: "Category is required",
            minLength: { value: 3, message: "At least 3 characters" },
          })}
          error={errors.jobCategory?.message}
        /> */}

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
          min={500}
          max={10000}
          {...register("minSalary", { valueAsNumber: true })}
          error={errors.minSalary?.message}
        />

        <InputField
          label="Maximum Salary/Day"
          type="number"
          placeholder="Maximum Salary"
          min={500}
          max={10000}
          {...register("maxSalary", { valueAsNumber: true })}
          error={errors.maxSalary?.message}
        />

        <InputField
          label="Location Range in KM"
          type="number"
          placeholder="Location Range"
          min={10}
          max={1000}
          {...register("locRange", { valueAsNumber: true })}
          error={errors.locRange?.message}
        />

        <SelectField
          label="Shift Type"
          options={SHIFT_TYPES}
          {...register("shiftType")}
        />

        {errors.shiftType && (
          <p className="text-red-500">{errors.shiftType?.message}</p>
        )}

        {/* <SelectField
          label="Salary Type"
          options={SALARY_TYPES}
          {...register("salaryType")}
        />
        {errors.salaryType && (
          <p className="text-red-500">{errors.salaryType?.message}</p>
        )} */}

        <SelectField
          label="Salary Credit Type"
          options={SALARY_CREDIT_TYPES}
          {...register("salaryCreditType")}
        />

        {errors.salaryCreditType && (
          <p className="text-red-500">{errors.salaryCreditType?.message}</p>
        )}

        <SelectField
          label="Joining Period"
          options={JOINING_TYPES}
          {...register("joiningPeriod")}
        />
        {errors.joiningPeriod && (
          <p className="text-red-500">{errors.joiningPeriod?.message}</p>
        )}

        <div className="flex justify-center w-full">
          <button
            type="submit"
            className="w-72 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Submit
          </button>
        </div>
      </form>

      {status === "pending" && <Loading />}
    </div>
  );
};

export default Step2;
