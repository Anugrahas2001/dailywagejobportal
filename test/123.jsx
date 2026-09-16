// Step1.test.jsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Step1 from "@/app/onboarding/step1/Step1"; // 👈 adjust to your real path

import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import useLoading from "@/components/hooks/useLoading";
import useCurrentLocationHook from "@/components/hooks/useCurrentLocation";
import { step1Onboarding } from "@/lib/features/profiles/userThunk";

// ---- Mock Next.js navigation ----
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// ---- Mock Redux ----
jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

// ---- Mock loading hook ----
jest.mock("@/components/hooks/useLoading");

// ---- Mock current location hook ----
jest.mock("@/components/hooks/useCurrentLocation");

// ---- Mock the onboarding thunk ----
jest.mock("@/lib/features/profiles/userThunk", () => ({
  step1Onboarding: jest.fn(),
}));

// ---- Mock DatePicker with a plain input standing in for it ----
jest.mock("../DatePicker", () => (props) => (
  <input
    data-testid="dob-input"
    onChange={(e) => props.onChange(new Date(e.target.value))}
  />
));

function setupMocks({ status = "idle", error = null } = {}) {
  const pushMock = jest.fn();
  const dispatchMock = jest.fn(() => ({
    unwrap: jest.fn().mockResolvedValue({
      result: { role: "worker", onboardPage: "step2" },
    }),
  }));

  useRouter.mockReturnValue({ push: pushMock });
  useDispatch.mockReturnValue(dispatchMock);
  useSelector.mockImplementation((selectorFn) =>
    selectorFn({ user: { status, error } })
  );
  useLoading.mockReturnValue({ loading: false, setLoading: jest.fn() });
  useCurrentLocationHook.mockReturnValue({
    getLocation: jest.fn().mockResolvedValue({
      city: "Kochi",
      state: "Kerala",
      country: "India",
      coordinates: [76.26, 9.93],
    }),
  });

  return { pushMock, dispatchMock };
}

describe("Step1 form rendering", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders all expected fields", () => {
    setupMocks();
    render(<Step1 />);

    expect(screen.getByPlaceholderText("Enter Your Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter Your City")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter Your State")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter Your Country")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /submit/i })
    ).toBeInTheDocument();
  });
});

describe("Step1 form validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows required errors when submitted empty", async () => {
    setupMocks();
    const user = userEvent.setup();
    render(<Step1 />);

    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(await screen.findByText("Name is required")).toBeInTheDocument();
    expect(
      await screen.findByText("Please select a gender")
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Date of birth is required")
    ).toBeInTheDocument();
    expect(await screen.findByText("City is required")).toBeInTheDocument();
    expect(await screen.findByText("State is required")).toBeInTheDocument();
    expect(
      await screen.findByText("Country is required")
    ).toBeInTheDocument();
  });

  test("rejects a name containing numbers", async () => {
    setupMocks();
    const user = userEvent.setup();
    render(<Step1 />);

    await user.type(screen.getByPlaceholderText("Enter Your Name"), "John123");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(
      await screen.findByText("Only alphabets are allowed")
    ).toBeInTheDocument();
  });

  test("rejects an invalid mobile number", async () => {
    setupMocks();
    const user = userEvent.setup();
    render(<Step1 />);

    await user.type(
      screen.getByPlaceholderText("Enter 10-digit mobile number"),
      "12345"
    );
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(
      await screen.findByText("Enter a valid 10-digit mobile number")
    ).toBeInTheDocument();
  });

  test("allows an empty mobile number since it's optional", async () => {
    setupMocks();
    const user = userEvent.setup();
    render(<Step1 />);

    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(
      screen.queryByText("Enter a valid 10-digit mobile number")
    ).not.toBeInTheDocument();
  });

  test("rejects a date of birth under 18 years old", async () => {
    setupMocks();
    const user = userEvent.setup();
    render(<Step1 />);

    const recentYear = new Date().getFullYear() - 10; // definitely under 18
    await user.type(
      screen.getByTestId("dob-input"),
      `${recentYear}-01-01`
    );
    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(
      await screen.findByText("You must be at least 18 years old")
    ).toBeInTheDocument();
  });
});

describe("Step1 current location toggle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("auto-fills city, state, and country when toggled on", async () => {
    setupMocks();
    const user = userEvent.setup();
    render(<Step1 />);

    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("aria-checked", "false");

    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(await screen.findByDisplayValue("Kochi")).toBeInTheDocument();
    expect(await screen.findByDisplayValue("Kerala")).toBeInTheDocument();
    expect(await screen.findByDisplayValue("India")).toBeInTheDocument();
  });

  test("clears city, state, and country when toggled off", async () => {
    setupMocks();
    const user = userEvent.setup();
    render(<Step1 />);

    const toggle = screen.getByRole("switch");

    await user.click(toggle); // turn on
    await user.click(toggle); // turn off

    expect(screen.getByPlaceholderText("Enter Your City")).toHaveValue("");
    expect(screen.getByPlaceholderText("Enter Your State")).toHaveValue("");
    expect(screen.getByPlaceholderText("Enter Your Country")).toHaveValue("");
  });
});

describe("Step1 form submission", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("submits valid data and navigates to the returned onboardPage", async () => {
    const { pushMock, dispatchMock } = setupMocks();
    const user = userEvent.setup();
    render(<Step1 />);

    await user.type(screen.getByPlaceholderText("Enter Your Name"), "John Doe");
    await user.selectOptions(screen.getByLabelText(/gender/i), "Male"); // match your real GENDER_TYPES value
    await user.type(screen.getByTestId("dob-input"), "2000-01-01");
    await user.type(screen.getByPlaceholderText("Enter Your City"), "Kochi");
    await user.type(screen.getByPlaceholderText("Enter Your State"), "Kerala");
    await user.type(
      screen.getByPlaceholderText("Enter Your Country"),
      "India"
    );

    await user.click(screen.getByRole("button", { name: /submit/i }));

    expect(dispatchMock).toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith("/onboarding/step2");
  });

  test("disables submit button while status is pending", () => {
    setupMocks({ status: "pending" });
    render(<Step1 />);

    expect(
      screen.getByRole("button", { name: /submitting/i })
    ).toBeDisabled();
  });

  test("shows an error message when there is a submission error", () => {
    setupMocks({ error: "Something went wrong" });
    render(<Step1 />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
  });
});