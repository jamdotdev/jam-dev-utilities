import { useCallback, useMemo, useState, useEffect } from "react";
import {
  parseCSV,
  buildFacets,
  filterRows,
  detectLogLevel,
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
import { Search, X, ChevronDown, ChevronRight, Filter } from "lucide-react";
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

interface FacetSidebarProps {
  facets: Map<string, Facet>;
  filters: ColumnFilter[];
  onFilterChange: (column: string, values: string[]) => void;
  logLevelCounts: Map<LogLevel, number>;
  selectedLogLevels: LogLevel[];
  onLogLevelChange: (levels: LogLevel[]) => void;
}

function FacetSidebar({
  facets,
  filters,
  onFilterChange,
  logLevelCounts,
  selectedLogLevels,
  onLogLevelChange,
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
                    onChange={() => handleLogLevelToggle(level)}
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
                  <span className="text-muted-foreground text-xs">{count}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

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
                      onChange={() => handleValueToggle(column, value)}
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
                    onChange={() => handleToggle(item.value)}
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

interface LogsTableProps {
  rows: LogEntry[];
  headers: string[];
  searchQuery: string;
  facets: Map<string, Facet>;
  filters: ColumnFilter[];
  onFilterChange: (column: string, values: string[]) => void;
}

function LogsTable({
  rows,
  headers,
  searchQuery,
  facets,
  filters,
  onFilterChange,
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

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-muted/50">
            {headers.map((header) => {
              const facet = facets.get(header);
              const selectedValues = getSelectedValues(header);
              return (
                <th key={header} className={tableHeaderStyles}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate">{header}</span>
                    {facet && facet.values.length > 1 && (
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
          {rows.map((row, index) => {
            const logLevel = detectLogLevel(row);
            const isExpanded = expandedRow === index;

            return (
              <>
                <tr
                  key={index}
                  className={cn(
                    tableRowStyles,
                    getLogLevelColor(logLevel),
                    index % 2 === 0 && "bg-muted/30"
                  )}
                  onClick={() => setExpandedRow(isExpanded ? null : index)}
                >
                  {headers.map((header) => {
                    const value = row[header] || "";
                    const isDate =
                      rows.length > 0 && isDateColumn(header, rows[0][header]);
                    const displayValue = isDate ? formatDate(value) : value;

                    return (
                      <td
                        key={header}
                        className={cn(tableCellStyles, "max-w-xs truncate")}
                        title={value}
                      >
                        {searchQuery ? (
                          <SearchHighlightText
                            text={displayValue}
                            searchQuery={searchQuery}
                          />
                        ) : (
                          displayValue
                        )}
                      </td>
                    );
                  })}
                </tr>
                {isExpanded && (
                  <tr key={`${index}-expanded`}>
                    <td
                      colSpan={headers.length}
                      className="border p-4 bg-muted/20"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                              getLogLevelBadgeColor(logLevel)
                            )}
                          >
                            {logLevel.toUpperCase()}
                          </span>
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

  const facets = useMemo(() => {
    if (!csvData) return new Map<string, Facet>();
    return buildFacets(csvData.rows, csvData.headers);
  }, [csvData]);

  const logLevelCounts = useMemo(() => {
    const counts = new Map<LogLevel, number>();
    if (!csvData) return counts;

    csvData.rows.forEach((row) => {
      const level = detectLogLevel(row);
      counts.set(level, (counts.get(level) || 0) + 1);
    });

    return counts;
  }, [csvData]);

  const filteredRows = useMemo(() => {
    if (!csvData) return [];

    let result = filterRows(csvData.rows, filters, debouncedSearchQuery);

    if (selectedLogLevels.length > 0) {
      result = result.filter((row) =>
        selectedLogLevels.includes(detectLogLevel(row))
      );
    }

    return result;
  }, [csvData, filters, debouncedSearchQuery, selectedLogLevels]);

  const handleFilterChange = useCallback(
    (column: string, values: string[]) => {
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
    },
    []
  );

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
          <section className="container max-w-7xl mb-6">
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex flex-col gap-2">
                <div className="relative">
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

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredRows.length} of {csvData.rows.length} logs
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

          <section className="container max-w-7xl mb-6">
            <div className="flex gap-6">
              <FacetSidebar
                facets={facets}
                filters={filters}
                onFilterChange={handleFilterChange}
                logLevelCounts={logLevelCounts}
                selectedLogLevels={selectedLogLevels}
                onLogLevelChange={setSelectedLogLevels}
              />
              <div className="flex-1 overflow-hidden">
                <LogsTable
                  rows={filteredRows}
                  headers={csvData.headers}
                  searchQuery={debouncedSearchQuery}
                  facets={facets}
                  filters={filters}
                  onFilterChange={handleFilterChange}
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
