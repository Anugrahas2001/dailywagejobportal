// import { render, screen } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
// import { useDispatch, useSelector } from "react-redux";
// import { useRouter } from "next/navigation";
// // import Loading from "@/components/Loading";
// import useCurrentLocationHook from "@/components/hooks/useCurrentLocation";
// import useLoading from "@/components/hooks/useLoading";
// import { step1Onboarding } from "@/lib/features/profiles/userThunk";
// // import DatePicker from "../DatePicker";
// import Step1 from "@/app/(onboarding)/onboarding/steps/Step1";

// jest.mock("next/navigation", () => ({
//   useRouter: jest.fn(),
// }));

// jest.mock("react-redux", () => ({
//   useDispatch: jest.fn(),
//   useSelector: jest.fn(),
// }));

// jest.mock("@/components/Loading");

// jest.mock("@/components/hooks/useLoading");

// jest.mock("@/components/hooks/useCurrentLocation");

// // ---- Mock the onboarding thunk ----
// jest.mock("@/lib/features/profiles/userThunk", () => ({
//   step1Onboarding: jest.fn(),
// }));

// // jest.mock("../DatePicker", (props) => (
// //   <input
// //     data-testid="dob-input"
// //     onChange={(e) => props.onChange(new Date(e.target.value))}
// //   />
// // ));

// function setupMocks({ status = "idle", role = worker, onboardPage = 2 } = {}) {
//   const pushMock = jest.fn();

//   const unwrapMock = jest.fn().mockResolvedValue({
//     result: { role, onboardPage },
//   });

//   const dispatchMock = jest.fn(() => ({
//     unwrap: unwrapMock,
//   }));

//   useRouter.mockReturnValue({ pushMock: jest.fn() });

//   useDispatch.mockReturnValue(dispatchMock);
//   // Give the values that we are taking from the slice uisng the useSelector.
//   useSelector.mockImplementation((selectorFn) => {
//     selectorFn({
//       user: {
//         status,
//         error,
//       },
//     });
//   });

//   return { pushMock, dispatchMock, unwrapMock };
// }

// describe("Step 1 onboarding process", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });

//      test("verify the name fields", async () => {
//       render(<Step1 />);

//       const nameInput = screen.getByPlaceholderText("Enter Your Name");
//       await userEvent.type(nameInput, "");
//       const submitBtn=screen.getByRole("button",{name:/submit/i});
//       await userEvent.click(submitBtn);
//       const error=screen.getByText("Name cannot be empty");
//       expect(error).toBeInTheDocument();

//     });

//   // test("Verify the input fields", async () => {

//   // });
// });

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Step1 from "@/app/(onboarding)/onboarding/steps/Step1";
import SelectField from "@/components/form/SelectField";
import { GENDER_TYPES } from "@/constants/constant";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("@/components/Loading", () => ({
  __esModule: true,
  default: () => <div data-testid="loading-spinner" />,
}));

jest.mock("@/components/hooks/useLoading", () => ({
  __esModule: true,
  default: jest.fn(() => ({ loading: false, setLoading: jest.fn() })),
}));

jest.mock("@/components/hooks/useCurrentLocation", () => ({
  __esModule: true,
  default: jest.fn(() => ({ getLocation: jest.fn() })),
}));

jest.mock("@/lib/features/profiles/userThunk", () => ({
  step1Onboarding: jest.fn(),
}));

// Matches Step1.jsx's "../DatePicker" import, resolved via the @/ alias
jest.mock("@/app/(onboarding)/onboarding/DatePicker", () => ({
  __esModule: true,
  default: ({ onChange }) => (
    <input
      data-testid="dob-input"
      type="date"
      onChange={(e) => onChange(new Date(e.target.value))}
    />
  ),
}));

function setupMocks({
  status = "idle",
  role = "worker",
  onboardPage = 2,
  error = null,
} = {}) {
  const pushMock = jest.fn();

  const unwrapMock = jest.fn().mockResolvedValue({
    result: { role, onboardPage },
  });

  const dispatchMock = jest.fn(() => ({
    unwrap: unwrapMock,
  }));

  useRouter.mockReturnValue({ push: pushMock });

  useDispatch.mockReturnValue(dispatchMock);

  useSelector.mockImplementation((selectorFn) =>
    selectorFn({
      user: { status, error },
    }),
  );

  return { pushMock, dispatchMock, unwrapMock };
}

describe("Step 1 onboarding process", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  test("verify the name fields", async () => {
    render(<Step1 />);

    const nameInput = screen.getByPlaceholderText("Enter Your Name");

    // Whitespace-only value: passes required/minLength/pattern,
    // fails only the custom `validate` rule
    await userEvent.type(nameInput, "   ");

    const submitBtn = screen.getByRole("button", { name: /submit/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Name cannot be empty")).toBeInTheDocument();
    });
  });

  test("shows 'Name is required' when field is left completely empty", async () => {
    render(<Step1 />);

    const submitBtn = screen.getByRole("button", { name: /submit/i });
    await userEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
    });
  });

  test("show 'Name must be at least 3 characters' error for name field", async () => {
    render(<Step1 />);

    const nameIP = screen.getByPlaceholderText("Enter Your Name");
    await userEvent.type(nameIP, "An");

    const submitBtn = screen.getByRole("button", { name: /submit/i });
    await userEvent.click(submitBtn);

    expect(
      screen.getByText("Name must be at least 3 characters"),
    ).toBeInTheDocument();
  });

  test("show 'Name cannot exceed 50 characters' error for the name", async () => {
    render(<Step1 />);

    const nameIp = screen.getByPlaceholderText("Enter Your Name");
    await userEvent.type(nameIp, "A".repeat(55));

    const submitBtn = screen.getByRole("button", { name: /submit/i });
    await userEvent.click(submitBtn);
    expect(
      screen.getByText("Name cannot exceed 50 characters"),
    ).toBeInTheDocument();
  });

  test("Show 'Only alphabets are allowed' error for name field", async () => {
    render(<Step1 />);
    const nameIp = screen.getByPlaceholderText("Enter Your Name");
    await userEvent.type(nameIp, "Anu@018");

    const submitBtn = screen.getByRole("button", { name: /submit/i });
    await userEvent.click(submitBtn);

    expect(screen.getByText("Only alphabets are allowed")).toBeInTheDocument();
  });

  test("user with valid name field", async () => {
    render(<Step1 />);

    const nameIp = screen.getByPlaceholderText("Enter Your Name");
    await userEvent.type(nameIp, "Anugraha S");

    const submitBtn = screen.getByRole("button", { name: /submit/i });
    await userEvent.click(submitBtn);

    expect(nameIp).toHaveValue("Anugraha S");
    expect(screen.queryByText("Name is required")).not.toBeInTheDocument();
  });
});

describe("SelectField data", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test("renders label and options", () => {
    render(<Step1 label="Gender" options={GENDER_TYPES} />);

    const genderLabel = screen.getByLabelText("Gender");
    expect(genderLabel).toBeInTheDocument();

    {
      GENDER_TYPES.map((opt) => {
        const optionInput = screen.getByRole("option", { name: opt.label });
        expect(optionInput).toBeInTheDocument();
      });
    }
  });

  test("Show error when the user submit the form without selecting a gender", async () => {
    render(
      <Step1
        placeholder="Please select a gender"
        label="Gender"
        options={GENDER_TYPES}
      />,
    );
    const submitBtn = screen.getByRole("button", { name: /submit/i });
    await userEvent.click(submitBtn);

    expect(screen.getByText("Please select a gender")).toBeInTheDocument();
  });

  test("user selected a gender field", async () => {
    render(<Step1 />);
    const labelIp = screen.getByLabelText("Gender");
    expect(labelIp).toBeInTheDocument();

    // const selectedGender = screen.getByRole("option", { name: /female/i });
    // expect(selectedGender).toBeInTheDocument();

    // This line was missing — actually perform the selection
    await userEvent.selectOptions(labelIp, "Female");
    expect(labelIp).toHaveValue("Female");

    const submitBtn = screen.getByRole("button", { name: /submit/i });
    await userEvent.click(submitBtn);

    expect(
      screen.queryByText("Please select a gender"),
    ).not.toBeInTheDocument();
  });
});
