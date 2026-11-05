import "@testing-library/jest-dom/vitest";

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(window, "alert").mockImplementation(() => {});
});
