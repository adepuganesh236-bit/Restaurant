import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
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

import Checkout from "../Pages/Checkout";

describe("Checkout page", () => {
  let alertSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it("blocks placing an order when the cart is empty", () => {
    localStorage.setItem("access", "token");
    render(
      <MemoryRouter>
        <Checkout cart={[]} setCart={() => {}} />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: /Place Order/i }));
    expect(alertSpy).toHaveBeenCalledWith("Your cart is empty.");
    expect(apiMock.post).not.toHaveBeenCalled();
  });

  it("requires authentication before ordering", () => {
    render(
      <MemoryRouter>
        <Checkout cart={[{ id: 1, name: "X", price: 10, quantity: 1 }]} setCart={() => {}} />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: /Place Order/i }));
    expect(alertSpy).toHaveBeenCalledWith("You must be logged in to place an order.");
    expect(apiMock.post).not.toHaveBeenCalled();
  });

  it("posts one order per item without sending total_price", async () => {
    localStorage.setItem("access", "token");
    apiMock.post.mockResolvedValue({ data: { id: 99 } });
    const setCart = vi.fn();
    render(
      <MemoryRouter>
        <Checkout cart={[{ id: 7, name: "Dish", price: 25, quantity: 2 }]} setCart={setCart} />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: /Place Order/i }));
    await vi.waitFor(() => {
      expect(apiMock.post).toHaveBeenCalledWith("orders/", { food: 7, quantity: 2 });
    });
    expect(setCart).toHaveBeenCalledWith([]);
  });
});
