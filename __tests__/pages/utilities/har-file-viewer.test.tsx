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
  test("should render the component and display the drop zone text", () => {
    render(<HARFileViewer />);

    expect(
      screen.getByText("Drop your .har or .json file here")
    ).toBeInTheDocument();
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

  test("should filter requests based on search query", async () => {
    const user = userEvent.setup();
    render(<HARFileViewer />);

    // Upload a HAR file
    const file = new File([JSON.stringify(mockHarData)], "test.har", {
      type: "application/json",
    });
    const fileInput = screen.getByTestId("input");
    await user.upload(fileInput, file);

    // Wait for all requests to be displayed
    await screen.findByText("https://example.com/api/test");
    await screen.findByText("https://example.com/css/style.css");

    // Find the search input
    const searchInput = screen.getByPlaceholderText(
      "Search in URLs, headers, requests, and responses..."
    );

    // Search for "api" - should only show the first request
    await user.type(searchInput, "api");

    // Wait for debounce (300ms) + rendering time
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Should still see the api request
    expect(screen.getByText("https://example.com/api/test")).toBeInTheDocument();

    // Should not see the css request (it should be filtered out)
    const rows = screen.queryAllByTestId("table-row");
    expect(rows.length).toBe(1);
  });

  test("should clear search query when clear button is clicked", async () => {
    const user = userEvent.setup();
    render(<HARFileViewer />);

    // Upload a HAR file
    const file = new File([JSON.stringify(mockHarData)], "test.har", {
      type: "application/json",
    });
    const fileInput = screen.getByTestId("input");
    await user.upload(fileInput, file);

    // Wait for requests to be displayed
    await screen.findByText("https://example.com/api/test");

    // Find and use the search input
    const searchInput = screen.getByPlaceholderText(
      "Search in URLs, headers, requests, and responses..."
    );
    await user.type(searchInput, "api");

    // Wait for debounce
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Find the clear button (it should appear when there's text)
    const clearButton = screen.getByTitle("Clear search");
    await user.click(clearButton);

    // Search input should be empty
    expect(searchInput).toHaveValue("");

    // Both requests should be visible again
    await screen.findByText("https://example.com/api/test");
    await screen.findByText("https://example.com/css/style.css");
  });
});
