import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";

// Smoke test: the app should mount at the home route without crashing,
// and the navbar should show the actual site brand.
test("renders the Mublat Bake & Blends navbar on the home page", () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </MemoryRouter>
  );

  const brand = screen.getAllByText(/Mublat Bake & Blends/i);
  expect(brand.length).toBeGreaterThan(0);
});
