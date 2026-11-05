import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../Components/protectedRoute";

function renderAt(entry) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route
          path="/secret"
          element={
            <ProtectedRoute>
              <div>Secret Area</div>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<div>Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  it("redirects to /login when there is no token", () => {
    renderAt("/secret");
    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Secret Area")).not.toBeInTheDocument();
  });

  it("renders children when a token is present", () => {
    localStorage.setItem("access", "token");
    renderAt("/secret");
    expect(screen.getByText("Secret Area")).toBeInTheDocument();
  });
});
