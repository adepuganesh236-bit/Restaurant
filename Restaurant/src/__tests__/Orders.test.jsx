import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const { apiMock } = vi.hoisted(() => ({
  apiMock: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

vi.mock("../Services/api", () => ({
  default: apiMock,
  wakeBackend: vi.fn().mockResolvedValue(true),
  ensureBackendAwake: vi.fn().mockResolvedValue("ok"),
}));

vi.mock("../Components/Invoice", () => ({ default: () => null }));

import Orders from "../Pages/Orders";

describe("Orders page", () => {
  it("shows the empty state when there are no orders", async () => {
    apiMock.get.mockResolvedValueOnce({ data: [] });
    render(
      <MemoryRouter>
        <Orders />
      </MemoryRouter>
    );
    expect(await screen.findByText(/No orders found/i)).toBeInTheDocument();
  });

  it("renders a row per order with status and actions", async () => {
    apiMock.get.mockResolvedValueOnce({
      data: [
        {
          id: 7,
          food_name: "Paneer Tikka",
          quantity: 2,
          total_price: "300.00",
          status: "Pending",
          payment_status: "Pending",
          payment_method: "Online",
        },
      ],
    });

    render(
      <MemoryRouter>
        <Orders />
      </MemoryRouter>
    );

    expect(await screen.findByText("Paneer Tikka")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Cancel Order/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Pay Now/i })).toBeInTheDocument();
  });
});
