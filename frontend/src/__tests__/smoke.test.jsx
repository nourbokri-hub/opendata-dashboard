import React from "react";
import { render, screen } from "@testing-library/react";
import { expect, test } from "@jest/globals";

function DummyComponent() {
  return <h1>Dashboard</h1>;
}

test("smoke test: render works", () => {
  render(<DummyComponent />);
  expect(screen.getByText("Dashboard")).toBeInTheDocument();
});
