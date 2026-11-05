import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

const { apiMock } = vi.hoisted(() => ({
  apiMock: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

vi.mock("../Services/api", () => ({
  default: apiMock,
  wakeBackend: vi.fn().mockResolvedValue(true),
  ensureBackendAwake: vi.fn().mockResolvedValue("ok"),
}));

import Cart from "../Pages/Cart";

describe("Cart page", () => {
  it("shows an empty state when there are no items", () => {
    apiMock.get.mockResolvedValue({ data: { active_users: 0 } });
    render(
      <MemoryRouter>
        <Cart cart={[]} setCart={() => {}} />
      </MemoryRouter>
    );
    expect(screen.getByText(/Your cart is empty/i)).toBeInTheDocument();
  });

  it("lists items, totals the price and removes an item", () => {
    apiMock.get.mockResolvedValue({ data: { active_users: 0 } });
    const setCart = vi.fn();
    const cart = [
      { id: 1, name: "Paneer Tikka", price: 150, quantity: 2 },
      { id: 2, name: "Veg Biryani", price: 200, quantity: 1 },
    ];
    render(
      <MemoryRouter>
        <Cart cart={cart} setCart={setCart} />
      </MemoryRouter>
    );

    expect(screen.getByText("Paneer Tikka")).toBeInTheDocument();
    expect(screen.getByText("Veg Biryani")).toBeInTheDocument();
    expect(screen.getByText(/Total:/)).toBeInTheDocument();
    expect(screen.getByText(/500/)).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /Remove/i })[0]);
    expect(setCart).toHaveBeenCalledWith([cart[1]]);
  });
});
