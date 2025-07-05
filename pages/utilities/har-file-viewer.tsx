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

type Status = "idle" | "unsupported" | "hover";

export default function HARFileViewer() {
  const [harData, setHarData] = useState<HarData | null>(null);
  const [status, setStatus] = useState<Status>("idle");

  const handleFileUpload = useCallback((file: File | undefined) => {
    if (!file) {
      return;
    }

    if (!file.name.endsWith(".har")) {
      setStatus("unsupported");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        setHarData(json);
        setStatus("idle");
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
      if (!file || !file.name.endsWith(".har")) {
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
              accept=".har"
              onChange={(event) => handleFileUpload(event.target.files?.[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <UploadIcon />
            <div>
              {status === "idle" && <p>Drop your .har file here</p>}
              {status === "hover" && <p>Drop it like it's hot 🔥</p>}
              {status === "unsupported" && <p>Invalid file format</p>}
            </div>
          </div>
        </Card>
      </section>

      {harData && (
        <section className="container max-w-7xl overflow-y-scroll">
          <HarTable entries={harData.log.entries} />
        </section>
      )}

      <CallToActionGrid />
      <section className="container max-w-2xl">
        <HarFileViewerSEO />
      </section>
    </main>
  );
}

interface FilterButtonProps {
  type: FilterType;
  active: boolean;
  onClick: () => void;
}

const FilterButton = (props: FilterButtonProps) => {
  return (
    <Button
      variant="outline"
      className={cn(props.active && "bg-border hover:bg-border")}
      onClick={props.onClick}
    >
      {props.type}
    </Button>
  );
};

type SortField = "size" | "time";
type SortOrder = "asc" | "desc";

const HarTable = ({ entries }: HarTableProps) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("All");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  useEffect(() => {
    setExpandedRow(null);
  }, [activeFilter]);

  const maxTime = useMemo(
    () => Math.max(...entries.map((entry) => entry.time)),
    [entries]
  );

  const filteredAndSortedEntries = useMemo(() => {
    const result =
      activeFilter === "All"
        ? entries
        : entries.filter((entry) => getFilterType(entry) === activeFilter);

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
  }, [entries, activeFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filterTypes: FilterType[] = [
    "All",
    "XHR",
    "JS",
    "CSS",
    "Img",
    "Media",
    "Other",
    "Errors",
  ];

  const tableHeaderStyles = "border p-2 px-3 text-left text-[14px]";
  const tableHeaderSortableStyles = `${tableHeaderStyles} cursor-pointer hover:bg-muted-foreground/10`;
  const tableCellStyles = "border p-2 px-3 min-w-[80px] max-w-[320px] w-full truncate"; //prettier-ignore
  const tableRowStyles = "text-[13px] leading-[1] hover:bg-muted-foreground/10";
  const tableRowOddStyles = "bg-muted";
  const tableRowErrorStyles = "bg-red-500/10";

  return (
    <div className="w-full mb-6">
      <div className="mb-4 flex space-x-2">
        {filterTypes.map((type) => (
          <FilterButton
            key={type}
            type={type}
            active={activeFilter === type}
            onClick={() => setActiveFilter(type)}
          />
        ))}
      </div>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={tableHeaderStyles}>Name</th>
            <th className={tableHeaderStyles}>Status</th>
            <th className={tableHeaderStyles}>Type</th>
            <th className={tableHeaderStyles}>Started at</th>
            <th
              className={tableHeaderSortableStyles}
              onClick={() => handleSort("size")}
            >
              Size {sortField === "size" && (sortOrder === "asc" ? " ▲" : " ▼")}
            </th>
            <th
              className={tableHeaderSortableStyles}
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
                <td className={cn(tableCellStyles, "cursor-pointer")}>
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
