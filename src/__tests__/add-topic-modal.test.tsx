// src/__tests__/add-topic-modal.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddTopicModal from "@/components/skill-tree/AddTopicModal";

describe("AddTopicModal", () => {
  it("renders nothing when isOpen is false", () => {
    const { container } = render(<AddTopicModal isOpen={false} onClose={vi.fn()} onSubmit={vi.fn()} />);
    expect(container.innerHTML).toBe("");
  });
  it("renders all form fields when isOpen is true", () => {
    render(<AddTopicModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />);
    expect(screen.getByText("Add a New Topic")).toBeTruthy();
    expect(screen.getByLabelText("Title")).toBeTruthy();
    expect(screen.getByLabelText("Subject")).toBeTruthy();
    expect(screen.getByLabelText("Difficulty (1-5)")).toBeTruthy();
    expect(screen.getByLabelText("Description")).toBeTruthy();
  });
  it("calls onClose when Cancel is clicked", async () => {
    const onClose = vi.fn();
    render(<AddTopicModal isOpen={true} onClose={onClose} onSubmit={vi.fn()} />);
    await userEvent.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
  it("calls onSubmit with form data and closes on submit", async () => {
    const onSubmit = vi.fn();
    const onClose = vi.fn();
    render(<AddTopicModal isOpen={true} onClose={onClose} onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText("Title"), "Linear Algebra");
    await userEvent.selectOptions(screen.getByLabelText("Subject"), "math");
    await userEvent.clear(screen.getByLabelText("Difficulty (1-5)"));
    await userEvent.type(screen.getByLabelText("Difficulty (1-5)"), "3");
    await userEvent.type(screen.getByLabelText("Description"), "Matrices and vectors");
    await userEvent.click(screen.getByText("Add Topic"));
    expect(onSubmit).toHaveBeenCalledWith({ title: "Linear Algebra", subject: "math", difficulty: 3, description: "Matrices and vectors" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
