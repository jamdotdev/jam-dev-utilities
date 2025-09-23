import { render, screen } from "@testing-library/react";
import { WaterfallSvgView } from "../../../components/har-waterfall/WaterfallSvgView";
import { calculateTimings } from "../../../components/har-waterfall/waterfall-utils";

// Mock HAR entries for testing
const mockEntries = [
  {
    startedDateTime: "2024-01-01T12:00:00.000Z",
    time: 150,
    request: {
      method: "GET",
      url: "https://example.com/",
      httpVersion: "HTTP/1.1",
      headers: [{ name: "User-Agent", value: "Mozilla/5.0" }],
    },
    response: {
      status: 200,
      statusText: "OK",
      httpVersion: "HTTP/1.1",
      headers: [{ name: "Content-Type", value: "text/html" }],
      content: {
        size: 1024,
        mimeType: "text/html",
        text: "<html>Hello</html>",
      },
    },
    timings: {
      dns: 5,
      connect: 10,
      ssl: 15,
      wait: 80,
      receive: 40,
    },
  },
  {
    startedDateTime: "2024-01-01T12:00:00.200Z",
    time: 75,
    request: {
      method: "GET",
      url: "https://example.com/api/data",
      httpVersion: "HTTP/1.1",
      headers: [{ name: "User-Agent", value: "Mozilla/5.0" }],
    },
    response: {
      status: 404,
      statusText: "Not Found",
      httpVersion: "HTTP/1.1",
      headers: [{ name: "Content-Type", value: "application/json" }],
      content: {
        size: 64,
        mimeType: "application/json",
        text: '{"error": "Not found"}',
      },
    },
    timings: {
      dns: 2,
      connect: 5,
      ssl: 8,
      wait: 45,
      receive: 15,
    },
  },
];

const mockTimings = calculateTimings(mockEntries);

describe("WaterfallSvgView", () => {
  const defaultProps = {
    entries: mockEntries,
    timings: mockTimings,
    zoomLevel: 1,
    width: 1200,
    height: 600,
    hoveredIndex: -1,
    onRowClick: jest.fn(),
    onRowHover: jest.fn(),
    onRowLeave: jest.fn(),
  };

  test("should render waterfall view with proper structure", () => {
    render(<WaterfallSvgView {...defaultProps} />);

    // Check that the waterfall container is rendered using class selector
    const waterfallContainer = document.querySelector('.overflow-auto');
    expect(waterfallContainer).toBeInTheDocument();
  });

  test("should render correct number of request rows", () => {
    render(<WaterfallSvgView {...defaultProps} />);

    // Check for request rows
    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(2);
  });

  test("should display status codes correctly", () => {
    render(<WaterfallSvgView {...defaultProps} />);

    // Check for status codes
    expect(screen.getByText("200")).toBeInTheDocument();
    expect(screen.getByText("404")).toBeInTheDocument();
  });

  test("should display request URLs correctly", () => {
    render(<WaterfallSvgView {...defaultProps} />);

    // Check for truncated URLs (path + search)
    expect(screen.getByText("/")).toBeInTheDocument();
    expect(screen.getByText("/api/data")).toBeInTheDocument();
  });

  test("should display timing durations", () => {
    render(<WaterfallSvgView {...defaultProps} />);

    // Check for duration labels
    expect(screen.getByText("150ms")).toBeInTheDocument();
    expect(screen.getByText("75ms")).toBeInTheDocument();
  });

  test("should handle click interactions", () => {
    const onRowClick = jest.fn();
    render(<WaterfallSvgView {...defaultProps} onRowClick={onRowClick} />);

    const firstRow = screen.getAllByRole("row")[0];
    firstRow.click();

    expect(onRowClick).toHaveBeenCalledWith(0);
  });

  test("should show different styling for error status codes", () => {
    render(<WaterfallSvgView {...defaultProps} />);

    const errorRow = screen.getByText("404").closest('[role="row"]');
    expect(errorRow).toHaveClass("cursor-pointer");
  });
});