import { render, screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import HARFileViewer from "../../../pages/utilities/har-file-viewer";

// Mock HAR file data
const mockHarData = {
  log: {
    entries: [
      {
        request: {
          url: "https://example.com/api/test",
          method: "GET",
          headers: [
            { name: "User-Agent", value: "Mozilla/50" },
            { name: "Accept", value: "application/json" },
          ],
        },
        response: {
          status: 200,
          content: {
            size: 124,
            mimeType: "application/json",
            text: '{"message": "success"}',
          },
          headers: [{ name: "Content-Type", value: "application/json" }],
        },
        time: 150,
        startedDateTime: "2023-01-01T00:00:00",
      },
      {
        request: {
          url: "https://example.com/css/style.css",
          method: "GET",
          headers: [{ name: "User-Agent", value: "Mozilla/50" }],
        },
        response: {
          status: 404,
          content: {
            size: 248,
            mimeType: "text/css",
            text: "body { color: red; }",
          },
          headers: [{ name: "Content-Type", value: "text/css" }],
        },
        time: 75,
        startedDateTime: "2023-01-01T00:00:01.000Z",
      },
    ],
  },
};

describe("HARFileViewer", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test("should render the component and display the drop zone text", () => {
    render(<HARFileViewer />);

    expect(screen.getByText("Drop your .har or .json file here")).toBeInTheDocument();
  });

  test("should list all requests after uploading a har file", async () => {
    const user = userEvent.setup();
    render(<HARFileViewer />);

    // Create a mock file
    const file = new File([JSON.stringify(mockHarData)], "test.har", {
      type: "application/json",
    });

    // Find the file input and upload the file
    const fileInput = screen.getByTestId("input");
    await user.upload(fileInput, file);

    // Wait for the requests to be displayed
    await screen.findByText("https://example.com/api/test");
    await screen.findByText("https://example.com/css/style.css");
  });

  test("should list the status code for every request", async () => {
    const user = userEvent.setup();
    render(<HARFileViewer />);

    // Create a mock file
    const file = new File([JSON.stringify(mockHarData)], "test.har", {
      type: "application/json",
    });

    // Find the file input and upload the file
    const fileInput = screen.getByTestId("input");
    await user.upload(fileInput, file);

    // Get all rows
    const rows = await screen.findAllByTestId("table-row");

    // For the 1st row, get status code column and verify if its 200
    const row1 = within(rows[0]).getByTestId("column-status-code");
    expect(row1).toHaveTextContent("200");

    // For the 2nd row, get status code column and verify if its 404
    const row2 = within(rows[1]).getByTestId("column-status-code");
    expect(row2).toHaveTextContent("404");
  });

  test("should accept and process .json file extension", async () => {
    const user = userEvent.setup();
    render(<HARFileViewer />);

    // Create a mock file with .json extension
    const file = new File([JSON.stringify(mockHarData)], "test.json", {
      type: "application/json",
    });

    // Find the file input and upload the file
    const fileInput = screen.getByTestId("input");
    await user.upload(fileInput, file);

    // Wait for the requests to be displayed - this verifies the file was accepted
    await screen.findByText("https://example.com/api/test");
    await screen.findByText("https://example.com/css/style.css");

    // Verify status codes are displayed correctly
    const rows = await screen.findAllByTestId("table-row");
    const row1 = within(rows[0]).getByTestId("column-status-code");
    expect(row1).toHaveTextContent("200");
  });

  test("should default to table view when no localStorage value exists", async () => {
    // Clear localStorage to ensure we test the default behavior
    localStorage.clear();
    
    const user = userEvent.setup();
    render(<HARFileViewer />);
    
    // Upload a HAR file first to show the view buttons
    const file = new File([JSON.stringify(mockHarData)], "test.har", {
      type: "application/json",
    });
    const fileInput = screen.getByTestId("input");
    await user.upload(fileInput, file);

    // Wait for the table rows to appear (this means HAR is loaded)
    const rows = await screen.findAllByTestId("table-row");
    expect(rows).toHaveLength(2);
    
    // Check that localStorage has the default table view saved
    expect(localStorage.getItem("har-viewer-view-mode")).toBe("table");
  });

  test("should load waterfall view from localStorage if previously saved", async () => {
    // Set localStorage to waterfall view
    localStorage.setItem("har-viewer-view-mode", "waterfall");
    
    const user = userEvent.setup();
    render(<HARFileViewer />);
    
    // Upload a HAR file
    const file = new File([JSON.stringify(mockHarData)], "test.har", {
      type: "application/json",
    });
    const fileInput = screen.getByTestId("input");
    await user.upload(fileInput, file);

    // Wait for HAR data to load - in waterfall view we should see the HarWaterfall component
    // Since waterfall view doesn't show table rows, we need to check for the component differently
    // Let's wait for the filter buttons to appear which appear in both views
    await screen.findByRole("button", { name: "All" });
    
    // Verify localStorage still has waterfall
    expect(localStorage.getItem("har-viewer-view-mode")).toBe("waterfall");
  });

  test("should save view mode to localStorage when user switches views", async () => {
    localStorage.clear();
    
    const user = userEvent.setup();
    render(<HARFileViewer />);
    
    // Upload a HAR file first
    const file = new File([JSON.stringify(mockHarData)], "test.har", {
      type: "application/json",
    });
    const fileInput = screen.getByTestId("input");
    await user.upload(fileInput, file);

    // Wait for the table rows to appear (means we're in table view initially)
    const rows = await screen.findAllByTestId("table-row");
    expect(rows).toHaveLength(2);
    
    // Initially should be table view
    expect(localStorage.getItem("har-viewer-view-mode")).toBe("table");
    
    // Click waterfall button
    const waterfallButton = screen.getByRole("button", { name: /waterfall/i });
    await user.click(waterfallButton);
    
    // Should save to localStorage
    expect(localStorage.getItem("har-viewer-view-mode")).toBe("waterfall");
    
    // Click table button
    const tableButton = screen.getByRole("button", { name: /table view/i });
    await user.click(tableButton);
    
    // Should save to localStorage and we should see table rows again
    expect(localStorage.getItem("har-viewer-view-mode")).toBe("table");
    await screen.findAllByTestId("table-row");
  });

  test("should handle localStorage errors gracefully", () => {
    // Mock localStorage to throw an error
    const mockGetItem = jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("localStorage not available");
    });
    
    // Should not crash when localStorage throws
    expect(() => render(<HARFileViewer />)).not.toThrow();
    
    mockGetItem.mockRestore();
  });
});
