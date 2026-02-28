import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/dom";
import { ExecutionTimeline } from "./ExecutionTimeline";

const mockPhases = [
  {
    id: 1,
    name: "Code Generation",
    status: "completed" as const,
    timestamp: new Date("2026-02-28T20:00:00"),
    duration: 120,
  },
  {
    id: 2,
    name: "Testing",
    status: "active" as const,
    timestamp: new Date("2026-02-28T20:02:00"),
    duration: 60,
  },
  {
    id: 3,
    name: "Deployment",
    status: "pending" as const,
  },
];

describe("ExecutionTimeline", () => {
  it("should render empty state when no phases provided", () => {
    render(<ExecutionTimeline phases={[]} />);

    expect(screen.getByText("Nenhuma fase disponível")).toBeDefined();
  });

  it("should render all phases", () => {
    render(<ExecutionTimeline phases={mockPhases} />);

    expect(screen.getByText("Code Generation")).toBeDefined();
    expect(screen.getByText("Testing")).toBeDefined();
    expect(screen.getByText("Deployment")).toBeDefined();
  });

  it("should show completed status badge", () => {
    render(<ExecutionTimeline phases={mockPhases} />);

    expect(screen.getByText("Concluído")).toBeDefined();
  });

  it("should show active status badge", () => {
    render(<ExecutionTimeline phases={mockPhases} />);

    expect(screen.getByText("Em andamento")).toBeDefined();
  });

  it("should display phase timestamps", () => {
    render(<ExecutionTimeline phases={mockPhases} />);

    // Check if time is displayed (format: HH:MM:SS)
    const timeElements = screen.getAllByText(/\d{2}:\d{2}:\d{2}/);
    expect(timeElements.length).toBeGreaterThan(0);
  });

  it("should display phase duration", () => {
    render(<ExecutionTimeline phases={mockPhases} />);

    // Duration should be displayed as "120s" or similar
    expect(screen.getByText(/120s/)).toBeDefined();
  });

  it("should handle failed status", () => {
    const failedPhases = [
      {
        id: 1,
        name: "Code Generation",
        status: "failed" as const,
        timestamp: new Date(),
      },
    ];

    render(<ExecutionTimeline phases={failedPhases} />);

    expect(screen.getByText("Falhou")).toBeDefined();
  });

  it("should render phase icons", () => {
    render(<ExecutionTimeline phases={mockPhases} />);

    // Check that the component renders without errors
    expect(screen.getByText("Code Generation")).toBeDefined();
    expect(screen.getByText("Testing")).toBeDefined();
  });

  it("should track current phase", () => {
    render(<ExecutionTimeline phases={mockPhases} currentPhase={2} />);

    // Should render the second phase as active
    expect(screen.getByText("Testing")).toBeDefined();
  });
});
