import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const { apiMock } = vi.hoisted(() => ({
  apiMock: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

vi.mock("../Services/api", () => ({
  default: apiMock,
  wakeBackend: vi.fn().mockResolvedValue(true),
  ensureBackendAwake: vi.fn().mockResolvedValue("ok"),
}));

import ForgotPassword from "../Pages/ForgotPassword";

function renderPage() {
  return render(
    <MemoryRouter>
      <ForgotPassword />
    </MemoryRouter>
  );
}

describe("ForgotPassword page", () => {
  beforeEach(() => {
    apiMock.post.mockReset();
  });

  it("sends the OTP without depending on a leaked value", async () => {
    apiMock.post.mockResolvedValueOnce({ data: { message: "OTP sent successfully" } });

    renderPage();
    fireEvent.change(screen.getByPlaceholderText(/Enter 10-digit mobile number/i), {
      target: { value: "9876543210" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send OTP/i }));

    await waitFor(() =>
      expect(apiMock.post).toHaveBeenCalledWith("send-otp/", { phone: "9876543210" })
    );
    expect(await screen.findByPlaceholderText(/Enter 6-digit OTP/i)).toBeInTheDocument();
  });

  it("uses the verification token issued by verify-otp when resetting", async () => {
    apiMock.post
      .mockResolvedValueOnce({ data: { message: "OTP sent successfully" } })
      .mockResolvedValueOnce({ data: { message: "OTP verified", reset_token: "signed-token" } })
      .mockResolvedValueOnce({ data: { message: "Password reset successfully" } });

    renderPage();

    fireEvent.change(screen.getByPlaceholderText(/Enter 10-digit mobile number/i), {
      target: { value: "9876543210" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Send OTP/i }));

    const otpInput = await screen.findByPlaceholderText(/Enter 6-digit OTP/i);
    fireEvent.change(otpInput, { target: { value: "123456" } });
    fireEvent.click(screen.getByRole("button", { name: /Verify OTP/i }));

    const passwordInput = await screen.findByPlaceholderText(/Enter new password/i);
    fireEvent.change(passwordInput, { target: { value: "NewPassw0rd!" } });
    fireEvent.click(screen.getByRole("button", { name: /Reset Password/i }));

    await waitFor(() =>
      expect(apiMock.post).toHaveBeenCalledWith("reset-password/", {
        phone: "9876543210",
        new_password: "NewPassw0rd!",
        token: "signed-token",
      })
    );
  });
});
