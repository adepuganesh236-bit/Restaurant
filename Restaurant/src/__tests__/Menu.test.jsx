import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const { axiosGet, apiMock } = vi.hoisted(() => ({
  axiosGet: vi.fn(),
  apiMock: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

vi.mock("axios", () => ({ default: { get: axiosGet } }));
vi.mock("../Services/api", () => ({
  default: apiMock,
  wakeBackend: vi.fn().mockResolvedValue(true),
  ensureBackendAwake: vi.fn().mockResolvedValue("ok"),
}));

import Menu from "../Pages/Menu";

const FOODS = [
  { id: 1, name: "Paneer Tikka", category: "Starters", price: "150.00", available: true },
  { id: 2, name: "Veg Biryani", category: "Veg", price: "200.00", available: true },
];

describe("Menu page", () => {
  it("loads and renders food items from the API", async () => {
    axiosGet.mockResolvedValue({ data: FOODS });
    apiMock.get.mockResolvedValue({ data: { active_users: 0 } });

    render(
      <MemoryRouter>
        <Menu cart={[]} setCart={() => {}} />
      </MemoryRouter>
    );

    expect(await screen.findByText("Paneer Tikka")).toBeInTheDocument();
    expect(screen.getByText("Veg Biryani")).toBeInTheDocument();
  });

  it("filters by category", async () => {
    axiosGet.mockResolvedValue({ data: FOODS });
    apiMock.get.mockResolvedValue({ data: { active_users: 0 } });

    render(
      <MemoryRouter>
        <Menu cart={[]} setCart={() => {}} />
      </MemoryRouter>
    );

    await screen.findByText("Paneer Tikka");
    fireEvent.click(screen.getByRole("button", { name: "Drinks" }));
    expect(screen.getByText(/No food items found/i)).toBeInTheDocument();
  });

  it("filters by search text", async () => {
    axiosGet.mockResolvedValue({ data: FOODS });
    apiMock.get.mockResolvedValue({ data: { active_users: 0 } });

    render(
      <MemoryRouter>
        <Menu cart={[]} setCart={() => {}} />
      </MemoryRouter>
    );

    await screen.findByText("Veg Biryani");
    fireEvent.change(screen.getByPlaceholderText(/Search food items/i), {
      target: { value: "Paneer" },
    });
    await waitFor(() => expect(screen.queryByText("Veg Biryani")).not.toBeInTheDocument());
  });

  it("shows a retry state when the API fails", async () => {
    axiosGet.mockRejectedValue(new Error("offline"));
    apiMock.get.mockResolvedValue({ data: { active_users: 0 } });

    vi.useFakeTimers();
    render(
      <MemoryRouter>
        <Menu cart={[]} setCart={() => {}} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    vi.useRealTimers();
  });
});
