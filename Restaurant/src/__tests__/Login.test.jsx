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

import Login from "../Pages/Login";

describe("Login page", () => {
  it("renders username and password fields", () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Login$/i })).toBeInTheDocument();
  });

  it("stores access and refresh tokens on success", async () => {
    apiMock.post
      .mockResolvedValueOnce({ data: { access: "acc-token", refresh: "ref-token" } })
      .mockResolvedValueOnce({ data: {} });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "alice" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "secret" } });
    fireEvent.click(screen.getByRole("button", { name: /^Login$/i }));

    await waitFor(() => expect(localStorage.getItem("access")).toBe("acc-token"));
    expect(localStorage.getItem("refresh")).toBe("ref-token");
  });

  it("does not store tokens when the API returns no tokens", async () => {
    apiMock.post.mockResolvedValueOnce({ data: {} });
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: "alice" } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: "secret" } });
    fireEvent.click(screen.getByRole("button", { name: /^Login$/i }));

    await waitFor(() => expect(window.alert).toHaveBeenCalled());
    expect(localStorage.getItem("access")).toBeNull();
    expect(localStorage.getItem("refresh")).toBeNull();
  });
});
