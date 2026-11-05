import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const srcDir = path.join(projectRoot, "src");
const backendDir = path.resolve(projectRoot, "..", "RestaurantBackend");

function read(relative) {
  return fs.readFileSync(path.join(projectRoot, relative), "utf8");
}

function exists(relative) {
  return fs.existsSync(path.join(projectRoot, relative));
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full));
    } else if (/\.(jsx?|mjs)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

describe("Frontend structure", () => {
  const pages = [
    "Home",
    "Menu",
    "Login",
    "Register",
    "Contact",
    "Cart",
    "Orders",
    "OrderHistory",
    "Checkout",
    "Payment",
    "Profile",
    "Dashboard",
    "FoodManagement",
    "AddFood",
    "UserLogins",
    "ForgotPassword",
  ];

  it.each(pages)("page %s exists", (page) => {
    expect(exists(`src/Pages/${page}.jsx`)).toBe(true);
  });

  it("routes every page in App.jsx", () => {
    const app = read("src/App.jsx");
    const routes = [
      "/",
      "/menu",
      "/login",
      "/register",
      "/contact",
      "/cart",
      "/orders",
      "/order-history",
      "/checkout",
      "/payment",
      "/profile",
      "/dashboard",
      "/food-management",
      "/add-food",
      "/user-logins",
      "/forgot-password",
    ];
    const configured = [...app.matchAll(/<Route\s+path="([^"]+)"/g)].map((m) => m[1]);
    for (const route of routes) {
      expect(configured, `route ${route} missing`).toContain(route);
    }
  });

  it("imports the custom stylesheet (regression guard)", () => {
    const app = read("src/App.jsx");
    expect(app).toMatch(/import\s+["']\.\/App\.css["']/);
  });
});

// The frontend must only call endpoints that actually exist in the backend
// URLconf. Endpoints are discovered from the Django source, not assumed.
describe("API endpoint consistency (frontend vs backend urls)", () => {
  function backendEndpoints() {
    const appUrls = fs.readFileSync(
      path.join(backendDir, "restaurant", "urls.py"),
      "utf8"
    );
    const projectUrls = fs.readFileSync(
      path.join(backendDir, "RestaurantBackend", "urls.py"),
      "utf8"
    );

    const endpoints = new Set();
    for (const m of appUrls.matchAll(/router\.register\(r"([^"]+)"/g)) {
      endpoints.add(m[1]);
    }
    for (const m of appUrls.matchAll(/path\(\s*"([^"]*)"/g)) {
      const value = m[1].replace(/\/$/, "");
      if (value) endpoints.add(value);
    }
    for (const m of projectUrls.matchAll(/path\(\s*['"]([^'"]*)['"]/g)) {
      const value = m[1].replace(/^api\//, "").replace(/\/$/, "");
      if (value) endpoints.add(value);
    }
    return endpoints;
  }

  function frontendCalls() {
    const calls = new Set();
    const re = /API\.(?:get|post|patch|put|delete)\(\s*[`"']([^`"']+)[`"']/g;
    for (const file of walk(srcDir)) {
      const content = fs.readFileSync(file, "utf8");
      for (const m of content.matchAll(re)) {
        const segment = m[1].split("/")[0];
        if (segment) calls.add(segment);
      }
    }
    return calls;
  }

  it("every frontend endpoint exists in the backend URLconf", () => {
    const known = backendEndpoints();
    const used = frontendCalls();
    expect(used.size).toBeGreaterThan(0);
    for (const endpoint of used) {
      expect([...known], `unknown endpoint: ${endpoint}`).toContain(endpoint);
    }
  });
});

describe("Restaurant background image", () => {
  it("image asset exists and is not empty", () => {
    const file = path.join(projectRoot, "public", "restaurant-bg.jpg");
    expect(fs.existsSync(file)).toBe(true);
    expect(fs.statSync(file).size).toBeGreaterThan(1000);
  });

  it("App.css references the image", () => {
    const css = read("src/App.css");
    expect(css).toMatch(/url\(["']?\/restaurant-bg\.jpg["']?\)/);
  });

  it("menu page is wired to the .menu-page background container", () => {
    const menu = read("src/Pages/Menu.jsx");
    expect(menu).toContain('className="menu-page"');
    const css = read("src/App.css");
    expect(css).toMatch(/\.menu-page\s*\{/);
  });
});

describe("Food image sizing", () => {
  it("food images fill their container without distortion", () => {
    const css = read("src/App.css");
    const match = css.match(/\.food-img\s*\{[^}]*\}/);
    expect(match, ".food-img rule missing").not.toBeNull();
    expect(match[0]).toMatch(/width:\s*100%/);
    expect(match[0]).toMatch(/object-fit:\s*cover/);
  });
});
