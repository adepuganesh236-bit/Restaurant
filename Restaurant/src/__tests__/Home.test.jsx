import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const { apiMock } = vi.hoisted(() => ({
  apiMock: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("../Services/api", () => ({
  default: apiMock,
  wakeBackend: vi.fn().mockResolvedValue(true),
  ensureBackendAwake: vi.fn().mockResolvedValue("ok"),
}));

import Home from "../Pages/Home";

describe("Home page", () => {
  it("renders the hero and links to the menu", () => {
    apiMock.get.mockResolvedValue({ data: { active_users: 0 } });
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText(/Welcome to Our Restaurant/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /View Menu/i })).toHaveAttribute("href", "/menu");
    expect(screen.getByRole("link", { name: /Order Now/i })).toHaveAttribute("href", "/menu");
  });
});
