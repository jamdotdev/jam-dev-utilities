import { useCallback, useMemo, useState, Fragment, useEffect } from "react";
import { BeforeMount, Editor } from "@monaco-editor/react";
import {
  FilterType,
  getColorForTime,
  getFilterType,
  HarData,
  HarEntry,
  HarTableProps,
  isBase64,
  tryParseJSON,
} from "@/components/utils/har-utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ds/ButtonComponent";
import Meta from "@/components/Meta";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import { Card } from "@/components/ds/CardComponent";
import UploadIcon from "@/components/icons/UploadIcon";
import PageHeader from "@/components/PageHeader";
import CallToActionGrid from "@/components/CallToActionGrid";
import HarFileViewerSEO from "@/components/seo/HarFileViewerSEO";
import { HarWaterfall } from "@/components/har-waterfall";
import { Table, BarChart3, Filter, Search, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ds/PopoverComponent";
import { Input } from "@/components/ds/InputComponent";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ds/CommandMenu";
import { Checkbox } from "@/components/ds/CheckboxComponent";

interface MultiSelectComboboxProps {
  data: { value: string; label: string }[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
}

function MultiSelectCombobox({
  data,
  selectedValues,
  onSelectionChange,
}: MultiSelectComboboxProps) {
  const [open, setOpen] = useState(false);

  const handleToggle = (value: string) => {
    const newSelection = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onSelectionChange(newSelection);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="p-2 h-8 w-8"
          title={
            selectedValues.length > 0
              ? `${selectedValues.length} status codes selected`
              : "Filter by status code"
          }
        >
          <Filter className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-64">
        <Command>
          <CommandInput placeholder="Search status codes..." />
          <CommandList className="max-h-60">
            <CommandEmpty>No status codes found.</CommandEmpty>
            <CommandGroup>
              {data.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.label}
                  onSelect={() => handleToggle(item.value)}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    checked={selectedValues.includes(item.value)}
                    onChange={() => handleToggle(item.value)}
                  />
                  <span>{item.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default function HARFileViewer() {
  const [status, setStatus] = useState<"idle" | "unsupported" | "hover">(
    "idle"
  );
  const [harData, setHarData] = useState<HarData | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [viewMode, setViewMode] = useState<"table" | "waterfall">("table");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Load view mode from localStorage on component mount
  useEffect(() => {
    try {
      const savedViewMode = localStorage.getItem("har-viewer-view-mode");
      if (savedViewMode === "table" || savedViewMode === "waterfall") {
        setViewMode(savedViewMode);
      }
    } catch (error) {
      // localStorage not available or error occurred, use default
    }
    setIsInitialized(true);
  }, []);

  // Save view mode to localStorage when it changes (but not on initial load)
  useEffect(() => {
    if (!isInitialized) return;

    try {
      localStorage.setItem("har-viewer-view-mode", viewMode);
    } catch (error) {
      // localStorage not available or error occurred
    }
  }, [viewMode, isInitialized]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleFileUpload = useCallback((file: File | undefined) => {
    if (!file) {
      return;
    }

    if (!file.name.endsWith(".har") && !file.name.endsWith(".json")) {
      setStatus("unsupported");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        setHarData(json);
        setStatus("idle");
        setStatusFilter([]); // Reset status filter when new file is loaded
      } catch (error) {
        console.error("Error parsing HAR file:", error);
        setStatus("unsupported");
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setStatus("hover");

      const file = event.dataTransfer.files[0];
      if (
        !file ||
        (!file.name.endsWith(".har") && !file.name.endsWith(".json"))
      ) {
        setStatus("unsupported");
        return;
      }

      handleFileUpload(file);
      setStatus("idle");
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setStatus("hover");
    },
    []
  );

  // Calculate filtered results count
  const getFilteredCount = useCallback(() => {
    if (!harData) return 0;

    let result = harData.log.entries;

    // Apply content type filter
    if (activeFilter !== "All") {
      result = result.filter((entry) => getFilterType(entry) === activeFilter);
    }

    // Apply status code filter
    if (statusFilter.length > 0) {
      result = result.filter((entry) =>
        statusFilter.includes(entry.response.status.toString())
      );
    }

    // Apply search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter((entry) => {
        // Search in URL
        if (entry.request.url.toLowerCase().includes(query)) return true;

        // Search in request headers
        const requestHeaderMatch = entry.request.headers.some(
          (header) =>
            header.name.toLowerCase().includes(query) ||
            header.value.toLowerCase().includes(query)
        );
        if (requestHeaderMatch) return true;

        // Search in response headers
        const responseHeaderMatch = entry.response.headers.some(
          (header) =>
            header.name.toLowerCase().includes(query) ||
            header.value.toLowerCase().includes(query)
        );
        if (responseHeaderMatch) return true;

        // Search in request payload
        if (entry.request.postData?.text) {
          if (entry.request.postData.text.toLowerCase().includes(query))
            return true;
        }

        // Search in response content
        if (entry.response.content.text) {
          let contentToSearch = entry.response.content.text;
          if (isBase64(contentToSearch)) {
            try {
              contentToSearch = atob(contentToSearch);
            } catch (e) {
              // If decode fails, search in original
            }
          }
          if (contentToSearch.toLowerCase().includes(query)) return true;
        }

        return false;
      });
    }

    return result.length;
  }, [harData, activeFilter, statusFilter, debouncedSearchQuery]);

  return (
    <main>
      <Meta
        title="HAR File Viewer | Analyze HTTP Archive Files Online Free"
        description="Easily view and analyze HAR files online for free. Debug web traffic and network performance. No installation required. Open source & ad-free."
      />
      <Header />
      <CMDK />
      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="HAR file viewer"
          description="Fast, free, open source, ad-free tools."
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={() => setStatus("idle")}
            className="relative flex flex-col border border-dashed bor der-border p-6 text-center text-muted-foreground rounded-lg min-h-40 items-center justify-center bg-muted"
          >
            <input
              type="file"
              data-testid="input"
              accept=".har,.json"
              onChange={(event) => handleFileUpload(event.target.files?.[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <UploadIcon />
            <div>
              {status === "idle" && <p>Drop your .har or .json file here</p>}
              {status === "hover" && <p>Drop it like it's hot 🔥</p>}
              {status === "unsupported" && <p>Invalid file format</p>}
            </div>
          </div>
        </Card>
      </section>

      {harData && (
        <>
          <section className="container max-w-7xl mb-6">
            <div className="flex flex-col gap-4 mb-4">
              {/* Search Input */}
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search in URLs, headers, requests, and responses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-10"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      title="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {/* Results count */}
                {(debouncedSearchQuery || activeFilter !== "All" || statusFilter.length > 0) && (
                  <p className="text-sm text-muted-foreground">
                    Showing {getFilteredCount()} of {harData.log.entries.length} requests
                  </p>
                )}
              </div>

              {/* Filters and View Mode */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {(
                    [
                      "All",
                      "XHR",
                      "JS",
                      "CSS",
                      "Img",
                      "Media",
                      "Other",
                      "Errors",
                    ] as FilterType[]
                  ).map((type) => (
                    <Button
                      key={type}
                      variant="outline"
                      className={cn(
                        activeFilter === type && "bg-border hover:bg-border"
                      )}
                      onClick={() => setActiveFilter(type)}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={viewMode === "waterfall" ? "default" : "outline"}
                    onClick={() => setViewMode("waterfall")}
                    className="h-8 relative"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Waterfall
                    <span className="ml-2 inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                      New
                    </span>
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === "table" ? "default" : "outline"}
                    onClick={() => setViewMode("table")}
                    className="h-8"
                  >
                    <Table className="h-4 w-4 mr-2" />
                    Table view
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <section className="container max-w-7xl">
            {viewMode === "table" ? (
              <HarTable
                entries={harData.log.entries}
                activeFilter={activeFilter}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                searchQuery={debouncedSearchQuery}
              />
            ) : (
              <HarWaterfall
                entries={harData.log.entries}
                activeFilter={activeFilter}
                searchQuery={debouncedSearchQuery}
                className="mb-6"
              />
            )}
          </section>
        </>
      )}

      <CallToActionGrid />
      <section className="container max-w-2xl">
        <HarFileViewerSEO />
      </section>
    </main>
  );
}

type SortField = "size" | "time";
type SortOrder = "asc" | "desc";

interface HarTableComponentProps extends HarTableProps {
  activeFilter: FilterType;
  statusFilter: string[];
  onStatusFilterChange: (statusCodes: string[]) => void;
  searchQuery: string;
}

const HarTable = ({
  entries,
  activeFilter,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
}: HarTableComponentProps) => {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  useEffect(() => {
    setExpandedRow(null);
  }, [activeFilter, searchQuery]);

  // Helper function to get status text
  const getStatusText = (statusCode: number): string => {
    const statusTexts: Record<number, string> = {
      101: "Switching Protocols",
      200: "OK",
      201: "Created",
      204: "No Content",
      206: "Partial Content",
      301: "Moved Permanently",
      302: "Found",
      304: "Not Modified",
      400: "Bad Request",
      401: "Unauthorized",
      403: "Forbidden",
      404: "Not Found",
      500: "Internal Server Error",
      502: "Bad Gateway",
      503: "Service Unavailable",
    };
    return statusTexts[statusCode] || "Unknown";
  };

  // Extract unique status codes for the filter
  const uniqueStatusCodes = useMemo(() => {
    const statusCodes = new Set(
      entries.map((entry) => entry.response.status.toString())
    );
    return Array.from(statusCodes)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .map((code) => ({
        value: code,
        label: `${code} - ${getStatusText(parseInt(code))}`,
      }));
  }, [entries]);

  const maxTime = useMemo(
    () => Math.max(...entries.map((entry) => entry.time)),
    [entries]
  );

  const filteredAndSortedEntries = useMemo(() => {
    let result = entries;

    // Apply content type filter
    if (activeFilter !== "All") {
      result = result.filter((entry) => getFilterType(entry) === activeFilter);
    }

    // Apply status code filter
    if (statusFilter.length > 0) {
      result = result.filter((entry) =>
        statusFilter.includes(entry.response.status.toString())
      );
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter((entry) => {
        // Search in URL
        if (entry.request.url.toLowerCase().includes(query)) return true;

        // Search in request headers
        const requestHeaderMatch = entry.request.headers.some(
          (header) =>
            header.name.toLowerCase().includes(query) ||
            header.value.toLowerCase().includes(query)
        );
        if (requestHeaderMatch) return true;

        // Search in response headers
        const responseHeaderMatch = entry.response.headers.some(
          (header) =>
            header.name.toLowerCase().includes(query) ||
            header.value.toLowerCase().includes(query)
        );
        if (responseHeaderMatch) return true;

        // Search in request payload
        if (entry.request.postData?.text) {
          if (entry.request.postData.text.toLowerCase().includes(query))
            return true;
        }

        // Search in response content
        if (entry.response.content.text) {
          // For base64 content, try to decode and search
          let contentToSearch = entry.response.content.text;
          if (isBase64(contentToSearch)) {
            try {
              contentToSearch = atob(contentToSearch);
            } catch (e) {
              // If decode fails, search in original
            }
          }
          if (contentToSearch.toLowerCase().includes(query)) return true;
        }

        return false;
      });
    }

    // Apply sorting
    if (sortField) {
      result.sort((a, b) => {
        let comparison = 0;

        if (sortField === "size") {
          comparison = a.response.content.size - b.response.content.size;
        } else if (sortField === "time") {
          comparison = a.time - b.time;
        }

        return sortOrder === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [entries, activeFilter, statusFilter, searchQuery, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const tableHeaderStyles = "border p-2 px-3 text-left text-[14px]";
  const tableHeaderSortableStyles = `${tableHeaderStyles} cursor-pointer hover:bg-muted-foreground/10`;
  const tableCellStyles = "border p-2 px-3 truncate"; //prettier-ignore
  const tableRowStyles = "text-[13px] leading-[1] hover:bg-muted-foreground/10";
  const tableRowOddStyles = "bg-muted";
  const tableRowErrorStyles = "bg-red-500/10";

  return (
    <div className="w-full mb-6">
      <table className="w-full border-collapse table-fixed">
        <thead>
          <tr>
            <th className={`${tableHeaderStyles} w-[40%]`}>Name</th>
            <th className={`${tableHeaderStyles} w-[12%]`}>
              <div className="flex items-center justify-between">
                <span>Status</span>
                <div className="ml-2">
                  <MultiSelectCombobox
                    data={uniqueStatusCodes}
                    selectedValues={statusFilter}
                    onSelectionChange={onStatusFilterChange}
                  />
                </div>
              </div>
            </th>
            <th className={`${tableHeaderStyles} w-[15%]`}>Type</th>
            <th className={`${tableHeaderStyles} w-[15%]`}>Started at</th>
            <th
              className={`${tableHeaderSortableStyles} w-[8%]`}
              onClick={() => handleSort("size")}
            >
              Size {sortField === "size" && (sortOrder === "asc" ? " ▲" : " ▼")}
            </th>
            <th
              className={`${tableHeaderSortableStyles} w-[10%]`}
              onClick={() => handleSort("time")}
            >
              Time {sortField === "time" && (sortOrder === "asc" ? " ▲" : " ▼")}
            </th>
          </tr>
        </thead>

        <tbody>
          {filteredAndSortedEntries.map((entry, index) => (
            <Fragment key={index}>
              <tr
                data-testid="table-row"
                className={cn(
                  tableRowStyles,
                  index % 2 === 0 && tableRowOddStyles,
                  entry.response.status >= 400 && tableRowErrorStyles
                )}
                onClick={() => {
                  setExpandedRow(expandedRow === index ? null : index);
                }}
              >
                <td
                  className={cn(
                    tableCellStyles,
                    "max-w-xs cursor-pointer truncate"
                  )}
                >
                  {entry.request.url}
                </td>
                <td
                  data-testid="column-status-code"
                  className={cn(tableCellStyles, "cursor-pointer")}
                >
                  {entry.response.status}
                </td>
                <td className={cn(tableCellStyles, "cursor-pointer")}>
                  {entry.response.content.mimeType}
                </td>
                <td className={cn(tableCellStyles, "cursor-pointer")}>
                  {new Date(entry.startedDateTime).toLocaleTimeString()}
                </td>
                <td className={cn(tableCellStyles, "cursor-pointer")}>
                  {(entry.response.content.size / 1024).toFixed(1) + "kB"}
                </td>
                <td className={tableCellStyles}>
                  <div className="relative mb-1 h-2">
                    <div
                      className={cn(
                        "absolute h-[3px] rounded-xl",
                        getColorForTime(entry.time)
                      )}
                      style={{
                        width: (entry.time / maxTime) * 100 + "%",
                      }}
                    />
                  </div>
                  {entry.time.toFixed(0) + "ms"}
                </td>
              </tr>

              {expandedRow === index && (
                <tr className={cn(index % 2 === 0 && tableRowOddStyles)}>
                  <td colSpan={6} className={tableCellStyles}>
                    <ExpandedDetails entry={entry} />
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ExpandedDetails = ({ entry }: { entry: HarEntry }) => {
  const [activeTab, setActiveTab] = useState("headers");

  const decodeContent = useCallback((content: string) => {
    if (isBase64(content)) {
      const decoded = atob(content);
      return tryParseJSON(decoded);
    }
    return tryParseJSON(content);
  }, []);

  const formatContent = useCallback((content: object | string) => {
    return typeof content === "object" && content !== null
      ? JSON.stringify(content, null, 2)
      : content;
  }, []);

  const beforeMount: BeforeMount = (monaco) => {
    monaco.editor.defineTheme("customTheme", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#1F1928",
      },
    });
  };

  const editorOptions = {
    minimap: { enabled: false },
    fontSize: 13,
    scrollBeyondLastLine: false,
    padding: { top: 24 },
    readOnly: true,
  };

  const renderContent = (content: string, mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return (
        <div className="flex h-[600px] items-center justify-center rounded bg-[#1F1928]">
          <img
            src={`data:${mimeType};base64,${content}`}
            alt="Response content"
            className="max-h-full max-w-full object-contain"
          />
        </div>
      );
    }

    return (
      <div className="overflow-hidden rounded">
        <Editor
          value={formatContent(decodeContent(content))}
          height="600px"
          theme="customTheme"
          defaultLanguage="json"
          options={editorOptions}
          beforeMount={beforeMount}
        />
      </div>
    );
  };

  const TabHeader = ({ id, label }: { id: string; label: string }) => {
    return (
      <Button
        size="sm"
        variant="outline"
        className={cn(
          activeTab === id && "bg-border border hover:bg-border/80"
        )}
        onClick={() => setActiveTab(id)}
      >
        {label}
      </Button>
    );
  };

  return (
    <div>
      <div className="mb-3 flex gap-1 px-4 py-2">
        <TabHeader id="headers" label="Headers" />
        {entry.request.postData && <TabHeader id="payload" label="Payload" />}
        {entry.response.content.text && (
          <TabHeader id="response" label="Response" />
        )}
      </div>

      {activeTab === "headers" && (
        <div>
          <div className="p-4">
            <h5 className="mb-4">Response Headers:</h5>
            {entry.response.headers.map((header, index) => (
              <div key={index} className="flex break-all text-[13px]">
                <span className="flex min-w-[260px] font-medium">
                  {header.name}:{" "}
                </span>
                <span className="flex">{header.value}</span>
              </div>
            ))}

            <h5 className="py-4">Request Headers:</h5>
            {entry.request.headers.map((header, index) => (
              <div key={index} className="flex break-all text-[13px]">
                <span className="flex min-w-[260px] font-medium">
                  {header.name}:{" "}
                </span>
                <span className="flex">{header.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "payload" && entry.request.postData && (
        <div>
          {renderContent(
            entry.request.postData.text,
            entry.request.postData.mimeType
          )}
        </div>
      )}

      {activeTab === "response" && entry.response.content.text && (
        <div>
          {renderContent(
            entry.response.content.text,
            entry.response.content.mimeType
          )}
        </div>
      )}
    </div>
  );
};
