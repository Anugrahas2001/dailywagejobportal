

// This looks like it's returning an object, but it's not. In JavaScript,
// () => { ... } with curly braces is a function body, not an object. Inside it,
// Fix: wrap the object in parentheses so JS knows it's an object literal, not a function body:
// jest.mock("next/navigation", () => ({
//   userRouter: jest.fn(),
// }));

// test("When user clicks the button navifgate to the dashboard", async() => {
//   const pushmock = jest.fn();
//   useRouter.mockReturnValue({
//     push: pushmock,
//   });

//   render(<Login />);
//   const user = userEvent.setup();
//   // Also — name: Login is wrong. Login here refers to your component (the whole file/function), not text.
//   //  name should be a string or regex matching the button's visible text, like /login/i (case-insensitive) or "Login".
//   const button = expect(
//     screen.getByRole("button", {
//       name:/login/i,
//     }),
//   );
//   await user.click(button);
//   expect(pushmock).toHaveBeenCalledWith("/dashboard");
// });


import userEvent from "@testing-library/user-event";
import Login from "./Login";
import { screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { render } from "@testing-library/react";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

test("When the user clicks the button navigate to dashboard", async () => {
  const pushMock = jest.fn();
  useRouter.mockReturnValue({ push: pushMock });
  const user = userEvent.setup();
  render(<Login />);
  const button = screen.getByText("Login");
  await user.click(button);
  // expect(screen.getByText("Done")).toBeInTheDocument();
  expect(pushMock).toHaveBeenCalledWith("/dashboard");
});
