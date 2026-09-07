import Step1 from "@/app/(onboarding)/onboarding/steps/Step1";
import Step2 from "@/app/(onboarding)/onboarding/steps/Step2";
import Step3 from "@/app/(onboarding)/onboarding/steps/Step3";
import Step4 from "@/app/(onboarding)/onboarding/steps/Step4";
import Step5 from "@/app/(onboarding)/onboarding/steps/Step5";

export const WORKER_ONBOARD_STEPS = {
  1: Step1,
  2: Step2,
  3: Step3,
  4: Step4,
  5: Step5,
};

export const EMPLOYER_ONBOARD_STEPS = {
  1: Step1,
  2: Step4,
  5: Step5,
};
