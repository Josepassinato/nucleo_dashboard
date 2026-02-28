import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/dom";
import { ExecutionStatusIndicator } from "./ExecutionStatusIndicator";

describe("ExecutionStatusIndicator", () => {
  it("should render deployed status", () => {
    render(
      <ExecutionStatusIndicator
        status="deployed"
        phase={3}
        phaseName="Deployment"
        progressPercent={100}
      />
    );

    expect(screen.getByText("Implantado")).toBeDefined();
    expect(screen.getByText("Deployment")).toBeDefined();
  });

  it("should render deploying status with animation", () => {
    render(
      <ExecutionStatusIndicator
        status="deploying"
        phase={2}
        phaseName="Testing"
        progressPercent={50}
      />
    );

    expect(screen.getByText("Implantando")).toBeDefined();
    expect(screen.getByText("Testing")).toBeDefined();
  });

  it("should render failed status", () => {
    render(
      <ExecutionStatusIndicator
        status="failed"
        phase={1}
        phaseName="Code Generation"
        progressPercent={25}
      />
    );

    expect(screen.getByText("Falhou")).toBeDefined();
  });

  it("should render pending status", () => {
    render(
      <ExecutionStatusIndicator
        status="pending"
        phase={0}
        phaseName="Iniciando"
        progressPercent={0}
      />
    );

    expect(screen.getByText("Pendente")).toBeDefined();
  });

  it("should display progress percentage", () => {
    render(
      <ExecutionStatusIndicator
        status="deploying"
        phase={2}
        phaseName="Testing"
        progressPercent={75}
      />
    );

    expect(screen.getByText("75%")).toBeDefined();
  });

  it("should show live indicator when connected", () => {
    render(
      <ExecutionStatusIndicator
        status="deploying"
        phase={2}
        phaseName="Testing"
        progressPercent={50}
        isConnected={true}
      />
    );

    expect(screen.getByText("Live")).toBeDefined();
  });

  it("should show loading indicator", () => {
    render(
      <ExecutionStatusIndicator
        status="deploying"
        phase={2}
        phaseName="Testing"
        progressPercent={50}
        isLoading={true}
      />
    );

    expect(screen.getByText("Atualizando...")).toBeDefined();
  });

  it("should display phase number", () => {
    render(
      <ExecutionStatusIndicator
        status="deploying"
        phase={2}
        phaseName="Testing"
        progressPercent={50}
      />
    );

    expect(screen.getByText("Fase 2")).toBeDefined();
  });
});
