import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import FoodCard from "../Components/FoodCard";

describe("FoodCard component", () => {
  it("renders name, price, category and adds the item to the cart", () => {
    const setCart = vi.fn();
    render(
      <FoodCard
        id={1}
        name="Paneer Tikka"
        price={150}
        category="Starters"
        cart={[]}
        setCart={setCart}
      />
    );

    expect(screen.getByText("Paneer Tikka")).toBeInTheDocument();
    expect(screen.getByText("Starters")).toBeInTheDocument();
    expect(screen.getByText(/150/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Add to Cart/i }));

    expect(setCart).toHaveBeenCalledTimes(1);
    expect(setCart.mock.calls[0][0]).toEqual([
      { id: 1, name: "Paneer Tikka", price: 150, quantity: 1 },
    ]);
  });

  it("uses the image returned by the API when available", () => {
    render(
      <FoodCard
        id={3}
        name="Chicken Biryani"
        price={250}
        category="Non-Veg"
        image="https://example.com/biryani.jpg"
        cart={[]}
        setCart={() => {}}
      />
    );

    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "https://example.com/biryani.jpg"
    );
  });

  it("appends to an existing cart", () => {
    const setCart = vi.fn();
    const existing = [{ id: 9, name: "Cola", price: 40, quantity: 1 }];
    render(
      <FoodCard
        id={2}
        name="Veg Biryani"
        price={200}
        category="Veg"
        cart={existing}
        setCart={setCart}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Add to Cart/i }));

    expect(setCart.mock.calls[0][0]).toHaveLength(2);
  });
});
