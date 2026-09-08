import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  getIdToken,
} from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { auth } from "@/lib/firebaseClient";
import useLoading from "@/components/hooks/useLoading";
import { useDispatch, useSelector } from "react-redux";
import LoginForm from "@/app/(auth)/login/LoginForm";
import userEvent from "@testing-library/user-event";
import { render, screen } from "@testing-library/react";

jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock("react-redux", () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));

jest.mock("@/lib/firebaseClient", () => ({
  auth: { currentUser: null },
}));

jest.mock("@/components/hooks/useLoading");

// This bundles all the repetitive setup into one reusable function, so each test just calls
// setupMocks(...) with only the specific values it cares about.
function setupMocks({
  status = "idle",
  role = "worker",
  error = null,
  onboardPage = 2,
  isOnboardingCompleted = false,
} = {}) {
  const pushMock = jest.fn();
  const replaceMock = jest.fn();
  const dispatchMock = jest.fn(() => ({
    unwrap: jest.fn().mockResolvedValue({}),
  }));

  useRouter.mockReturnValue({ push: pushMock, replace: replaceMock });
  useSearchParams.mockReturnValue(new URLSearchParams(`role=${role}`));
  useDispatch.mockReturnValue(dispatchMock);
  useSelector.mockImplementation((selectorFn) =>
    selectorFn({
      user: {
        status,
        error,
        role,
        onboardPage,
        isOnboardingCompleted,
      },
    }),
  );
  useLoading.mockReturnValue({ loading: false, setLoading: jest.fn() });

  return { pushMock, replaceMock, dispatchMock };
}

describe("Login Form validation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
  });

  test("show alert when the email field is empty", async () => {
    setupMocks();
    render(<LoginForm />);
    const loginButton = screen.getByRole("button", { name: /login/i });
    await userEvent.click(loginButton);

    expect(window.alert).toHaveBeenCalledWith("Email is required");
  });

  test("show alert when the email is present and password field is empty", async () => {
    setupMocks();
    render(<LoginForm />);
    const emailInput = screen.getByPlaceholderText("Enter your email");
    await userEvent.type(emailInput, "test@gmail.com");

    const loginButton = screen.getByRole("button", { name: /login/i });
    await userEvent.click(loginButton);
    expect(window.alert).toHaveBeenCalledWith("Password is required");
  });

  test("password length should be 6", async () => {
    setupMocks();
    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText("Enter your email");
    await userEvent.type(emailInput, "test@gmail.com");
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    await userEvent.type(passwordInput, "Anu@1");

    const loginButton = screen.getByRole("button", { name: /login/i });
    await userEvent.click(loginButton);
    expect(window.alert).toHaveBeenCalledWith(
      "Password must be at least 6 characters",
    );
  });
});

describe("LocalStorage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  test("store selected role in the localStorage", async () => {
    const { dispatchMock } = setupMocks();

    const getIdTokenMock = jest.fn().mockReturnValue("mock-token");
    auth.currentUser = {
      getIdToken: getIdTokenMock,
    };

    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText("Enter your email");
    await userEvent.type(emailInput, "test@gmail.com");

    const passwordInput = screen.getByPlaceholderText("Enter your password");
    await userEvent.type(passwordInput, "test@017");

    const loginButton = screen.getByRole("button", { name: /login/i });
    await userEvent.click(loginButton);

    expect(localStorage.getItem("role")).toBe("worker");
    expect(getIdTokenMock).toHaveBeenCalled();
    expect(dispatchMock).toHaveBeenCalled();
  });
});

describe("Login with email and password", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.alert = jest.fn();
  });
  test("login with the existing user", async () => {
    const { dispatchMock } = setupMocks();

    auth.currentUser = {
      getIdToken: jest.fn().mockResolvedValue("mock-token"),
    };
    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText("Enter your email");
    await userEvent.type(emailInput, "test@gmail.com");

    const passwordInput = screen.getByPlaceholderText("Enter your password");
    await userEvent.type(passwordInput, "test@017");

    const loginButton = screen.getByRole("button", { name: /login/i });
    await userEvent.click(loginButton);

    expect(auth.currentUser.getIdToken).toHaveBeenCalled();

    expect(dispatchMock).toHaveBeenCalled();
    expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
  });

  test("signInWithEmailAndPassword if the user not exist", async () => {
    const { dispatchMock } = setupMocks();

    auth.currentUser = null;

    signInWithEmailAndPassword.mockResolvedValue({
      user: { getIdToken: jest.fn().mockResolvedValue("mock-token") },
    });

    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText("Enter your email");
    await userEvent.type(emailInput, "test@gmail.com");

    const passwordInput = screen.getByPlaceholderText("Enter your password");
    await userEvent.type(passwordInput, "test@017");

    const loginButton = screen.getByRole("button", {
      name: /login/i,
    });
    await userEvent.click(loginButton);

    expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      "test@gmail.com",
      "test@017",
    );

    expect(dispatchMock).toHaveBeenCalled();
  });

  test("createUserWithEmailAndPassword creating a new user", async () => {
    const { dispatchMock } = setupMocks();

    signInWithEmailAndPassword.mockRejectedValue({
      code: "auth/user-not-found" || "auth/invalid-credential",
    });

    createUserWithEmailAndPassword.mockResolvedValue({
      user: { getIdToken: jest.fn().mockResolvedValue("mock-token") },
    });

    render(<LoginForm />);

    const emailInput = screen.getByPlaceholderText("Enter your email");
    await userEvent.type(emailInput, "test@gmail.com");

    const passwordInput = screen.getByPlaceholderText("Enter your password");
    await userEvent.type(passwordInput, "test@017");

    const loginButton = screen.getByRole("button", { name: /login/i });
    await userEvent.click(loginButton);

    expect(dispatchMock).toHaveBeenCalled();
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(),
      "test@gmail.com",
      "test@017",
    );
  });

  test("Sign-in-with-google using signInWithPopup and dispatch", async () => {
    const { dispatchMock } = setupMocks();

    signInWithPopup.mockResolvedValue({
      user: { getIdToken: jest.fn().mockResolvedValue("mock-token") },
    });

    render(<LoginForm />);

    const googleSignInButton = screen.getByRole("button", {
      name: /Sign In with Google/i,
    });
    await userEvent.click(googleSignInButton);

    expect(signInWithPopup).toHaveBeenCalled();
    expect(dispatchMock).toHaveBeenCalled();
  });

  test("after login navigate to the next onboarding page", async () => {
    const { replaceMock } = setupMocks({
      onboardPage: 2,
      isOnboardingCompleted: false,
    });

    render(<LoginForm />);
    expect(replaceMock).toHaveBeenCalledWith("/onboarding/2");
  });

  // test("after login navigate to the dashboard", async () => {
  //   const { replaceMock } = setupMocks({
  //     onboardPage: 2,
  //     isOnboardingCompleted: true,
  //   });
  //   render(<LoginForm />);

  //   expect(replaceMock).toHaveBeenCalledWith("/workerDashboard");
  // });
  test.each([
    ["worker", "/workerDashboard"],
    ["employer", "/employerDashboard"],
  ])("redirects %s to %s", (role, expectedPath) => {
    const { replaceMock } = setupMocks({
      role,
      isOnboardingCompleted: true,
    });
    render(<LoginForm />);
    expect(replaceMock).toHaveBeenCalledWith(expectedPath);
  });
});
