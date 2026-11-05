import { describe, expect, it, vi } from "vitest";
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

import Register from "../Pages/Register";

describe("Register page", () => {
  it("renders all required fields", () => {
    const { container } = render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );
    expect(container.querySelector('[name="username"]')).toBeTruthy();
    expect(container.querySelector('[name="email"]')).toBeTruthy();
    expect(container.querySelector('[name="phone"]')).toBeTruthy();
    expect(container.querySelector('[name="password"]')).toBeTruthy();
  });

  it("submits the registration payload", async () => {
    apiMock.post.mockResolvedValueOnce({ data: {} });
    const { container } = render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>
    );

    const set = (name, value) =>
      fireEvent.change(container.querySelector(`[name="${name}"]`), {
        target: { value },
      });

    set("username", "bob");
    set("email", "bob@example.com");
    set("phone", "9999999999");
    set("password", "Passw0rd!");

    fireEvent.click(screen.getByRole("button", { name: /^Register$/i }));

    await waitFor(() =>
      expect(apiMock.post).toHaveBeenCalledWith(
        "register/",
        expect.objectContaining({ username: "bob", phone: "9999999999" })
      )
    );
  });
});
