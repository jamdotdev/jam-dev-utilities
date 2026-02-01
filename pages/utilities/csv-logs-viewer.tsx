import { useCallback, useMemo, useState, useEffect } from "react";
import {
  parseCSV,
  buildFacets,
  buildSmartFacets,
  filterRows,
  detectLogLevel,
  detectIfLogsFile,
  getLogLevelColor,
  getLogLevelBadgeColor,
  formatDate,
  isDateColumn,
  LogEntry,
  ParsedCSV,
  ColumnFilter,
  Facet,
  LogLevel,
} from "@/components/utils/csv-logs-viewer.utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ds/ButtonComponent";
import Meta from "@/components/Meta";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import { Card } from "@/components/ds/CardComponent";
import UploadIcon from "@/components/icons/UploadIcon";
import PageHeader from "@/components/PageHeader";
import CallToActionGrid from "@/components/CallToActionGrid";
import {
  Search,
  X,
  ChevronDown,
  ChevronRight,
  Filter,
  Info,
} from "lucide-react";
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
import SearchHighlightText from "@/components/SearchHighlightText";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FacetSidebarProps {
  facets: Map<string, Facet>;
  filters: ColumnFilter[];
  onFilterChange: (column: string, values: string[]) => void;
  logLevelCounts: Map<LogLevel, number>;
  selectedLogLevels: LogLevel[];
  onLogLevelChange: (levels: LogLevel[]) => void;
  devMode: boolean;
}

function FacetSidebar({
  facets,
  filters,
  onFilterChange,
  logLevelCounts,
  selectedLogLevels,
  onLogLevelChange,
  devMode,
}: FacetSidebarProps) {
  const [expandedFacets, setExpandedFacets] = useState<Set<string>>(
    new Set(["Status"])
  );

  const toggleFacet = (column: string) => {
    const newExpanded = new Set(expandedFacets);
    if (newExpanded.has(column)) {
      newExpanded.delete(column);
    } else {
      newExpanded.add(column);
    }
    setExpandedFacets(newExpanded);
  };

  const getSelectedValues = (column: string): string[] => {
    const filter = filters.find((f) => f.column === column);
    return filter?.selectedValues || [];
  };

  const handleValueToggle = (column: string, value: string) => {
    const currentValues = getSelectedValues(column);
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    onFilterChange(column, newValues);
  };

  const handleLogLevelToggle = (level: LogLevel) => {
    const newLevels = selectedLogLevels.includes(level)
      ? selectedLogLevels.filter((l) => l !== level)
      : [...selectedLogLevels, level];
    onLogLevelChange(newLevels);
  };

  const logLevels: { level: LogLevel; label: string }[] = [
    { level: "error", label: "Error" },
    { level: "warning", label: "Warn" },
    { level: "info", label: "Info" },
    { level: "debug", label: "Debug" },
  ];

  return (
    <div className="w-64 flex-shrink-0 border-r border-border pr-4 overflow-y-auto max-h-[calc(100vh-300px)]">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">
          Filters
        </span>
      </div>

      {devMode && (
        <div className="mb-4">
          <button
            onClick={() => toggleFacet("Status")}
            className="flex items-center gap-1 w-full text-left text-sm font-medium mb-2"
          >
            {expandedFacets.has("Status") ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            Status
          </button>
          {expandedFacets.has("Status") && (
            <div className="ml-5 space-y-1">
              {logLevels.map(({ level, label }) => {
                const count = logLevelCounts.get(level) || 0;
                if (count === 0) return null;
                return (
                  <label
                    key={level}
                    className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5"
                  >
                    <Checkbox
                      checked={selectedLogLevels.includes(level)}
                      onCheckedChange={() => handleLogLevelToggle(level)}
                    />
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        level === "error" && "bg-red-500",
                        level === "warning" && "bg-yellow-500",
                        level === "info" && "bg-blue-500",
                        level === "debug" && "bg-gray-400"
                      )}
                    />
                    <span className="flex-1">{label}</span>
                    <span className="text-muted-foreground text-xs">
                      {count}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {Array.from(facets.entries()).map(([column, facet]) => {
        const selectedValues = getSelectedValues(column);
        const isExpanded = expandedFacets.has(column);
        const displayValues = facet.values.slice(0, 10);
        const hasMore = facet.values.length > 10;

        return (
          <div key={column} className="mb-4">
            <button
              onClick={() => toggleFacet(column)}
              className="flex items-center gap-1 w-full text-left text-sm font-medium mb-2"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              {column}
              {selectedValues.length > 0 && (
                <span className="ml-auto text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                  {selectedValues.length}
                </span>
              )}
            </button>
            {isExpanded && (
              <div className="ml-5 space-y-1">
                {displayValues.map(({ value, count }) => (
                  <label
                    key={value}
                    className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5"
                  >
                    <Checkbox
                      checked={selectedValues.includes(value)}
                      onCheckedChange={() => handleValueToggle(column, value)}
                    />
                    <span className="flex-1 truncate" title={value}>
                      {value}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {count}
                    </span>
                  </label>
                ))}
                {hasMore && (
                  <div className="text-xs text-muted-foreground px-1">
                    +{facet.values.length - 10} more
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {facets.size === 0 && !devMode && (
        <p className="text-xs text-muted-foreground">
          No filterable columns detected. All columns have high cardinality.
        </p>
      )}
    </div>
  );
}

interface ColumnFilterDropdownProps {
  facet: Facet;
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
}

function ColumnFilterDropdown({
  facet,
  selectedValues,
  onSelectionChange,
}: ColumnFilterDropdownProps) {
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
          className={cn(
            "p-1 h-6 w-6",
            selectedValues.length > 0 && "bg-primary/10"
          )}
          title={
            selectedValues.length > 0
              ? `${selectedValues.length} values selected`
              : `Filter by ${facet.column}`
          }
        >
          <Filter className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-64">
        <Command>
          <CommandInput placeholder={`Search ${facet.column}...`} />
          <CommandList className="max-h-60">
            <CommandEmpty>No values found.</CommandEmpty>
            <CommandGroup>
              {facet.values.slice(0, 20).map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={() => handleToggle(item.value)}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    checked={selectedValues.includes(item.value)}
                    onCheckedChange={() => handleToggle(item.value)}
                  />
                  <span className="flex-1 truncate">{item.value}</span>
                  <span className="text-muted-foreground text-xs">
                    {item.count}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

type MarkerGroup = "primary" | "secondary";

interface MarkerInfo {
  group: MarkerGroup;
  insertionOrder: number;
}

function computeDisplayNumbers(
  markedRows: Map<number, MarkerInfo>,
  group: MarkerGroup
): Map<number, number> {
  const entries = Array.from(markedRows.entries())
    .filter(([, info]) => info.group === group)
    .sort((a, b) => a[1].insertionOrder - b[1].insertionOrder);

  const displayNumbers = new Map<number, number>();
  entries.forEach(([originalIndex], index) => {
    displayNumbers.set(originalIndex, index + 1);
  });
  return displayNumbers;
}

interface RowWithOriginalIndex {
  row: LogEntry;
  originalIndex: number;
  isMarkedButFiltered?: boolean;
}

interface LogsTableProps {
  rows: RowWithOriginalIndex[];
  headers: string[];
  searchQuery: string;
  facets: Map<string, Facet>;
  filters: ColumnFilter[];
  onFilterChange: (column: string, values: string[]) => void;
  markedRows: Map<number, MarkerInfo>;
  onToggleMark: (originalIndex: number, group: MarkerGroup) => void;
  primaryDisplayNumbers: Map<number, number>;
  secondaryDisplayNumbers: Map<number, number>;
  devMode: boolean;
}

function LogsTable({
  rows,
  headers,
  searchQuery,
  facets,
  filters,
  onFilterChange,
  markedRows,
  onToggleMark,
  primaryDisplayNumbers,
  secondaryDisplayNumbers,
  devMode,
}: LogsTableProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  useEffect(() => {
    setExpandedRow(null);
  }, [searchQuery, filters]);

  const getSelectedValues = (column: string): string[] => {
    const filter = filters.find((f) => f.column === column);
    return filter?.selectedValues || [];
  };

  const tableHeaderStyles = "border p-2 px-3 text-left text-[13px] font-medium";
  const tableCellStyles = "border p-2 px-3 text-[13px]";
  const tableRowStyles = "hover:bg-muted-foreground/5 cursor-pointer";

  const getColumnWidth = (header: string, index: number): string => {
    const lowerHeader = header.toLowerCase();
    if (lowerHeader.includes("date") || lowerHeader.includes("time")) {
      return "180px";
    }
    if (lowerHeader.includes("host") || lowerHeader.includes("service")) {
      return "200px";
    }
    if (
      lowerHeader.includes("content") ||
      lowerHeader.includes("message") ||
      lowerHeader.includes("log")
    ) {
      return "auto";
    }
    if (index === headers.length - 1) {
      return "auto";
    }
    return "150px";
  };

  return (
    <TooltipProvider>
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse table-fixed">
          <thead>
            <tr className="bg-muted/50">
              <th
                className={cn(tableHeaderStyles, "w-12 text-center")}
                style={{ width: "48px", minWidth: "48px" }}
              >
                #
              </th>
              {headers.map((header, index) => {
                const facet = facets.get(header);
                const selectedValues = getSelectedValues(header);
                const width = getColumnWidth(header, index);
                return (
                  <th
                    key={header}
                    className={tableHeaderStyles}
                    style={{
                      width,
                      minWidth: width === "auto" ? "200px" : width,
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate">{header}</span>
                      {devMode && facet && facet.values.length > 1 && (
                        <ColumnFilterDropdown
                          facet={facet}
                          selectedValues={selectedValues}
                          onSelectionChange={(values) =>
                            onFilterChange(header, values)
                          }
                        />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ row, originalIndex, isMarkedButFiltered }, index) => {
              const logLevel = detectLogLevel(row);
              const isExpanded = expandedRow === index;
              const markerInfo = markedRows.get(originalIndex);
              const isMarked = markerInfo !== undefined;
              const isPrimaryMarker = markerInfo?.group === "primary";
              const isSecondaryMarker = markerInfo?.group === "secondary";
              const displayNumber = isPrimaryMarker
                ? primaryDisplayNumbers.get(originalIndex)
                : isSecondaryMarker
                  ? secondaryDisplayNumbers.get(originalIndex)
                  : undefined;

              const getMarkerRowColor = () => {
                if (isPrimaryMarker) {
                  return "bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50";
                }
                if (isSecondaryMarker) {
                  return "bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50";
                }
                return devMode ? getLogLevelColor(logLevel) : "";
              };

              return (
                <>
                  <tr
                    key={originalIndex}
                    className={cn(
                      tableRowStyles,
                      getMarkerRowColor(),
                      !isMarked && index % 2 === 0 && "bg-muted/30",
                      isMarkedButFiltered && "opacity-60"
                    )}
                    onClick={() => setExpandedRow(isExpanded ? null : index)}
                  >
                    <td
                      className={cn(
                        tableCellStyles,
                        "text-center cursor-pointer select-none"
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        const group: MarkerGroup =
                          e.metaKey || e.ctrlKey ? "secondary" : "primary";
                        onToggleMark(originalIndex, group);
                      }}
                    >
                      {isMarked ? (
                        <span
                          className={cn(
                            "inline-flex items-center justify-center w-5 h-5 rounded-full text-white text-xs font-medium",
                            isPrimaryMarker ? "bg-blue-500" : "bg-green-500"
                          )}
                        >
                          {displayNumber}
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-muted-foreground/30 text-muted-foreground/50 text-xs hover:border-blue-500 hover:text-blue-500">
                          +
                        </span>
                      )}
                    </td>
                    {headers.map((header) => {
                      const value = row[header] || "";
                      const isDate =
                        rows.length > 0 &&
                        isDateColumn(header, rows[0].row[header]);
                      const displayValue = isDate ? formatDate(value) : value;
                      const isTruncated = value.length > 30;

                      const cellContent = (
                        <div className="truncate">
                          {searchQuery ? (
                            <SearchHighlightText
                              text={displayValue}
                              searchQuery={searchQuery}
                            />
                          ) : (
                            displayValue
                          )}
                        </div>
                      );

                      return (
                        <td
                          key={header}
                          className={cn(tableCellStyles, "max-w-xs")}
                        >
                          {isTruncated ? (
                            <Tooltip delayDuration={100}>
                              <TooltipTrigger asChild>
                                {cellContent}
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="max-w-md break-all"
                              >
                                {value}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            cellContent
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  {isExpanded && (
                    <tr key={`${originalIndex}-expanded`}>
                      <td
                        colSpan={headers.length + 1}
                        className="border p-4 bg-muted/20"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 mb-3">
                            {devMode && (
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                                  getLogLevelBadgeColor(logLevel)
                                )}
                              >
                                {logLevel.toUpperCase()}
                              </span>
                            )}
                            {isMarked && (
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                                  isPrimaryMarker
                                    ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                                    : "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
                                )}
                              >
                                {isPrimaryMarker ? "Flow A" : "Flow B"} #
                                {displayNumber}
                              </span>
                            )}
                          </div>
                          {headers.map((header) => (
                            <div key={header} className="flex text-sm">
                              <span className="font-medium min-w-[120px] text-muted-foreground">
                                {header}:
                              </span>
                              <span className="flex-1 break-all">
                                {searchQuery ? (
                                  <SearchHighlightText
                                    text={row[header] || ""}
                                    searchQuery={searchQuery}
                                  />
                                ) : (
                                  row[header] || ""
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </TooltipProvider>
  );
}

export default function CSVLogsViewer() {
  const [status, setStatus] = useState<"idle" | "unsupported" | "hover">(
    "idle"
  );
  const [csvData, setCsvData] = useState<ParsedCSV | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [filters, setFilters] = useState<ColumnFilter[]>([]);
  const [selectedLogLevels, setSelectedLogLevels] = useState<LogLevel[]>([]);
  const [markedRows, setMarkedRows] = useState<Map<number, MarkerInfo>>(
    new Map()
  );
  const [nextInsertionOrder, setNextInsertionOrder] = useState(1);
  const [devMode, setDevMode] = useState(false);

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

    const validExtensions = [".csv", ".tsv", ".txt", ".log"];
    const hasValidExtension = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExtension) {
      setStatus("unsupported");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = parseCSV(content);
        setCsvData(parsed);
        setStatus("idle");
        setFilters([]);
        setSelectedLogLevels([]);
        setMarkedRows(new Map());
        setNextInsertionOrder(1);
        setDevMode(detectIfLogsFile(parsed.headers, parsed.rows));
      } catch (error) {
        console.error("Error parsing CSV file:", error);
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

  // Build all facets for column filters (used in table headers)
  const allFacets = useMemo(() => {
    if (!csvData) return new Map<string, Facet>();
    return buildFacets(csvData.rows, csvData.headers);
  }, [csvData]);

  // Smart facets for sidebar (only low-cardinality, meaningful columns)
  const smartFacetResult = useMemo(() => {
    if (!csvData) return { facets: new Map<string, Facet>(), excludedColumns: [] };
    return buildSmartFacets(csvData.rows, csvData.headers);
  }, [csvData]);

  // Use smart facets in dev mode, all facets otherwise (for column filters)
  const sidebarFacets = smartFacetResult.facets;

  const logLevelCounts = useMemo(() => {
    const counts = new Map<LogLevel, number>();
    if (!csvData) return counts;

    csvData.rows.forEach((row) => {
      const level = detectLogLevel(row);
      counts.set(level, (counts.get(level) || 0) + 1);
    });

    return counts;
  }, [csvData]);

  const filteredRowsWithMarkers = useMemo((): RowWithOriginalIndex[] => {
    if (!csvData) return [];

    const filteredSet = new Set<number>();
    let filtered = filterRows(csvData.rows, filters, debouncedSearchQuery);

    if (selectedLogLevels.length > 0) {
      filtered = filtered.filter((row) =>
        selectedLogLevels.includes(detectLogLevel(row))
      );
    }

    filtered.forEach((row) => {
      const originalIndex = csvData.rows.indexOf(row);
      filteredSet.add(originalIndex);
    });

    const result: RowWithOriginalIndex[] = [];

    filtered.forEach((row) => {
      const originalIndex = csvData.rows.indexOf(row);
      result.push({ row, originalIndex, isMarkedButFiltered: false });
    });

    markedRows.forEach((_, originalIndex) => {
      if (!filteredSet.has(originalIndex)) {
        result.push({
          row: csvData.rows[originalIndex],
          originalIndex,
          isMarkedButFiltered: true,
        });
      }
    });

    result.sort((a, b) => a.originalIndex - b.originalIndex);

    return result;
  }, [csvData, filters, debouncedSearchQuery, selectedLogLevels, markedRows]);

  const primaryDisplayNumbers = useMemo(
    () => computeDisplayNumbers(markedRows, "primary"),
    [markedRows]
  );

  const secondaryDisplayNumbers = useMemo(
    () => computeDisplayNumbers(markedRows, "secondary"),
    [markedRows]
  );

  const handleToggleMark = useCallback(
    (originalIndex: number, group: MarkerGroup) => {
      setMarkedRows((prev) => {
        const newMap = new Map(prev);
        const existing = newMap.get(originalIndex);

        if (existing && existing.group === group) {
          newMap.delete(originalIndex);
        } else {
          newMap.set(originalIndex, {
            group,
            insertionOrder: nextInsertionOrder,
          });
          setNextInsertionOrder((n) => n + 1);
        }
        return newMap;
      });
    },
    [nextInsertionOrder]
  );

  const handleFilterChange = useCallback((column: string, values: string[]) => {
    setFilters((prev) => {
      const existing = prev.find((f) => f.column === column);
      if (existing) {
        if (values.length === 0) {
          return prev.filter((f) => f.column !== column);
        }
        return prev.map((f) =>
          f.column === column ? { ...f, selectedValues: values } : f
        );
      }
      if (values.length === 0) return prev;
      return [...prev, { column, selectedValues: values }];
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters([]);
    setSelectedLogLevels([]);
    setSearchQuery("");
  }, []);

  const hasActiveFilters =
    filters.length > 0 || selectedLogLevels.length > 0 || searchQuery;

  return (
    <main>
      <Meta
        title="CSV Logs Viewer | Analyze Log Files Online Free"
        description="View, search, and filter CSV log files online for free. Quickly scan through logs with color-coded severity levels. Open source & ad-free."
      />
      <Header />
      <CMDK />
      <section className="container max-w-2xl mb-12">
        <PageHeader
          title="CSV Logs Viewer"
          description="Fast, free, open source, ad-free tools."
        />
      </section>

      <section className="container max-w-2xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={() => setStatus("idle")}
            className="relative flex flex-col border border-dashed border-border p-6 text-center text-muted-foreground rounded-lg min-h-40 items-center justify-center bg-muted"
          >
            <input
              type="file"
              data-testid="input"
              accept=".csv,.tsv,.txt,.log"
              onChange={(event) => handleFileUpload(event.target.files?.[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <UploadIcon />
            <div>
              {status === "idle" && (
                <p>Drop your .csv, .tsv, or .log file here</p>
              )}
              {status === "hover" && <p>Drop it like it&apos;s hot</p>}
              {status === "unsupported" && <p>Invalid file format</p>}
            </div>
          </div>
        </Card>
      </section>

      {csvData && (
        <>
          <section className="px-6 mb-6">
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-4">
                  <div className="relative max-w-md flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search in all columns..."
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
                  <TooltipProvider>
                    <div className="flex items-center gap-2">
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <Checkbox
                              checked={devMode}
                              onCheckedChange={(checked) =>
                                setDevMode(checked === true)
                              }
                            />
                            <span className="text-sm font-medium">
                              Dev Mode
                            </span>
                            <Info className="h-3.5 w-3.5 text-muted-foreground" />
                          </label>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="max-w-xs">
                          <p>
                            <strong>OFF:</strong> Clean table view for generic
                            CSV files with basic search.
                          </p>
                          <p className="mt-1">
                            <strong>ON:</strong> Log analysis mode with smart
                            facet filters, color-coded severity levels, and
                            Datadog-style filtering. Auto-detected for log
                            files.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TooltipProvider>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredRowsWithMarkers.length} of{" "}
                    {csvData.rows.length} {devMode ? "logs" : "rows"}
                    {markedRows.size > 0 && (
                      <>
                        {Array.from(markedRows.values()).filter(
                          (m) => m.group === "primary"
                        ).length > 0 && (
                          <span className="ml-2 text-blue-600 dark:text-blue-400">
                            (
                            {
                              Array.from(markedRows.values()).filter(
                                (m) => m.group === "primary"
                              ).length
                            }{" "}
                            Flow A)
                          </span>
                        )}
                        {Array.from(markedRows.values()).filter(
                          (m) => m.group === "secondary"
                        ).length > 0 && (
                          <span className="ml-2 text-green-600 dark:text-green-400">
                            (
                            {
                              Array.from(markedRows.values()).filter(
                                (m) => m.group === "secondary"
                              ).length
                            }{" "}
                            Flow B)
                          </span>
                        )}
                      </>
                    )}
                  </p>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-xs"
                    >
                      Clear all filters
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="px-6 mb-6">
            <div className="flex gap-6">
              {devMode && (
                <FacetSidebar
                  facets={sidebarFacets}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  logLevelCounts={logLevelCounts}
                  selectedLogLevels={selectedLogLevels}
                  onLogLevelChange={setSelectedLogLevels}
                  devMode={devMode}
                />
              )}
              <div className="flex-1 overflow-hidden">
                <LogsTable
                  rows={filteredRowsWithMarkers}
                  headers={csvData.headers}
                  searchQuery={debouncedSearchQuery}
                  facets={allFacets}
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  markedRows={markedRows}
                  onToggleMark={handleToggleMark}
                  primaryDisplayNumbers={primaryDisplayNumbers}
                  secondaryDisplayNumbers={secondaryDisplayNumbers}
                  devMode={devMode}
                />
              </div>
            </div>
          </section>
        </>
      )}

      <CallToActionGrid />
    </main>
  );
}
