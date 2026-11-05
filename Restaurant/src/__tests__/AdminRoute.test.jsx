import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const { apiMock } = vi.hoisted(() => ({
  apiMock: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

vi.mock("../Services/api", () => ({ default: apiMock }));

import AdminRoute from "../Components/AdminRoute";

function renderAt(entry) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <div>Admin Area</div>
            </AdminRoute>
          }
        />
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("AdminRoute", () => {
  it("redirects non-staff users to the home page", async () => {
    apiMock.get.mockResolvedValueOnce({ data: { is_staff: false } });
    renderAt("/admin");
    expect(await screen.findByText("Home Page")).toBeInTheDocument();
  });

  it("renders children for staff users", async () => {
    apiMock.get.mockResolvedValueOnce({ data: { is_staff: true } });
    renderAt("/admin");
    expect(await screen.findByText("Admin Area")).toBeInTheDocument();
  });
});
