import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const { apiMock } = vi.hoisted(() => ({
  apiMock: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

vi.mock("../Services/api", () => ({ default: apiMock }));

import Contact from "../Pages/Contact";

function fillForm() {
  fireEvent.change(screen.getByPlaceholderText("Your Name"), {
    target: { value: "Bob" },
  });
  fireEvent.change(screen.getByPlaceholderText("Your Email"), {
    target: { value: "bob@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText("Your Message"), {
    target: { value: "Hello there" },
  });
}

describe("Contact page", () => {
  it("renders the contact information", () => {
    render(<Contact />);
    expect(screen.getByText(/Ganesh Home Foods/i)).toBeInTheDocument();
    expect(screen.getByText(/Hyderabad, Telangana/i)).toBeInTheDocument();
  });

  it("alerts when required fields are missing", () => {
    render(<Contact />);
    fireEvent.click(screen.getByRole("button", { name: /Send Message/i }));
    expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/fill in all fields/i));
  });

  it("requires the user to be logged in", () => {
    render(<Contact />);
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: /Send Message/i }));
    expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/login first/i));
  });

  it("sends the message when authenticated", async () => {
    localStorage.setItem("access", "token");
    apiMock.post.mockResolvedValueOnce({ data: {} });
    render(<Contact />);
    fillForm();
    fireEvent.click(screen.getByRole("button", { name: /Send Message/i }));

    await waitFor(() =>
      expect(apiMock.post).toHaveBeenCalledWith(
        "contacts/",
        expect.objectContaining({ name: "Bob" })
      )
    );
    expect(await screen.findByText(/Message sent successfully/i)).toBeInTheDocument();
  });
});
