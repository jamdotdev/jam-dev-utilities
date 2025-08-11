import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import SVGViewer from "../../../pages/utilities/svg-viewer";

// Mock SVG content for testing
const mockSVGContent = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
</svg>`;

describe("SVGViewer", () => {
  test("should render both paste and upload tabs", () => {
    render(<SVGViewer />);

    expect(
      screen.getByRole("tab", { name: "Paste SVG Code" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tab", { name: "Upload SVG File" })
    ).toBeInTheDocument();
  });

  test("should display SVG code textarea in paste tab by default", () => {
    render(<SVGViewer />);

    expect(screen.getByLabelText("SVG code input")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Paste SVG code here")
    ).toBeInTheDocument();
  });

  test("should switch to upload tab and show upload component", async () => {
    const user = userEvent.setup();
    render(<SVGViewer />);

    const uploadTab = screen.getByRole("tab", { name: "Upload SVG File" });
    await user.click(uploadTab);

    expect(
      screen.getByText("Drag and drop your SVG file here, or click to select")
    ).toBeInTheDocument();
    expect(screen.getByText("Max size 2MB")).toBeInTheDocument();
  });

  test("should accept and process SVG file upload", async () => {
    const user = userEvent.setup();
    render(<SVGViewer />);

    // Switch to upload tab
    const uploadTab = screen.getByRole("tab", { name: "Upload SVG File" });
    await user.click(uploadTab);

    // Create a mock SVG file
    const file = new File([mockSVGContent], "test.svg", {
      type: "image/svg+xml",
    });

    // Find the hidden file input
    const fileInput = screen
      .getByRole("tabpanel", { name: "Upload SVG File" })
      .querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    // Upload the file
    await user.upload(fileInput, file);

    // Wait for the uploaded content to appear
    await waitFor(() => {
      expect(screen.getByLabelText("Uploaded SVG code")).toBeInTheDocument();
    });

    // Check that the SVG content is displayed in the textarea
    const uploadedTextarea = screen.getByLabelText(
      "Uploaded SVG code"
    ) as HTMLTextAreaElement;
    expect(uploadedTextarea.value).toContain("<svg");
    expect(uploadedTextarea.value).toContain("circle");
  });

  test("paste tab should work with manual input", async () => {
    const user = userEvent.setup();
    render(<SVGViewer />);

    const textarea = screen.getByLabelText("SVG code input");
    await user.type(textarea, mockSVGContent);

    expect(textarea).toHaveValue(mockSVGContent);
  });

  test("should show error for invalid SVG content", async () => {
    const user = userEvent.setup();
    render(<SVGViewer />);

    const textarea = screen.getByLabelText("SVG code input");
    await user.type(textarea, "not an svg");

    await waitFor(() => {
      expect(
        screen.getByText("Input does not contain an SVG tag")
      ).toBeInTheDocument();
    });
  });

  test("uploaded content should be accessible in paste tab", async () => {
    const user = userEvent.setup();
    render(<SVGViewer />);

    // Upload file in upload tab
    const uploadTab = screen.getByRole("tab", { name: "Upload SVG File" });
    await user.click(uploadTab);

    const file = new File([mockSVGContent], "test.svg", {
      type: "image/svg+xml",
    });

    const fileInput = screen
      .getByRole("tabpanel", { name: "Upload SVG File" })
      .querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(fileInput, file);

    // Wait for upload to complete
    await waitFor(() => {
      expect(screen.getByLabelText("Uploaded SVG code")).toBeInTheDocument();
    });

    // Switch to paste tab
    const pasteTab = screen.getByRole("tab", { name: "Paste SVG Code" });
    await user.click(pasteTab);

    // Check that the uploaded content is available in the paste tab
    const pasteTextarea = screen.getByLabelText(
      "SVG code input"
    ) as HTMLTextAreaElement;
    expect(pasteTextarea.value).toContain("<svg");
    expect(pasteTextarea.value).toContain("circle");
  });
});
