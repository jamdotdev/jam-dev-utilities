import { useCallback, useMemo, useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ds/CardComponent";
import Header from "@/components/Header";
import { CMDK } from "@/components/CMDK";
import CallToActionGrid from "@/components/CallToActionGrid";
import Meta from "@/components/Meta";
import { Textarea } from "@/components/ds/TextareaComponent";
import { Label } from "@/components/ds/LabelComponent";
import { Input } from "@/components/ds/InputComponent";
import { Button } from "@/components/ds/ButtonComponent";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ds/TabsComponent";
import { useCopyToClipboard } from "@/components/hooks/useCopyToClipboard";
import {
  buildMermaidText,
  downloadDataUrl,
  downloadTextAsFile,
  parseMermaidText,
  renderMermaidToSvg,
  svgToPngDataUrl,
  MermaidDirection,
  MermaidEdge,
  MermaidEdgeStyle,
  MermaidNode,
  MermaidNodeShape,
} from "@/components/utils/mermaid-diagram.utils";

const initialNodes: MermaidNode[] = [
  { id: "Start", label: "Start", shape: "stadium" },
  { id: "Decide", label: "Decision", shape: "diamond" },
  { id: "Ship", label: "Ship it", shape: "rectangle" },
  { id: "Refine", label: "Refine", shape: "round" },
];

const initialEdges: MermaidEdge[] = [
  { from: "Start", to: "Decide", label: "Review", style: "solid" },
  { from: "Decide", to: "Ship", label: "Yes", style: "solid" },
  { from: "Decide", to: "Refine", label: "No", style: "dashed" },
];

const directionOptions: MermaidDirection[] = ["TD", "LR", "TB", "RL"];
const nodeShapeOptions: { value: MermaidNodeShape; label: string }[] = [
  { value: "rectangle", label: "Rectangle" },
  { value: "round", label: "Round" },
  { value: "stadium", label: "Stadium" },
  { value: "subroutine", label: "Subroutine" },
  { value: "circle", label: "Circle" },
  { value: "diamond", label: "Diamond" },
];
const edgeStyleOptions: { value: MermaidEdgeStyle; label: string }[] = [
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
  { value: "thick", label: "Thick" },
];

const buildInitialText = () =>
  buildMermaidText({
    direction: "TD",
    nodes: initialNodes,
    edges: initialEdges,
  });

export default function MermaidDiagramBuilder() {
  const [direction, setDirection] = useState<MermaidDirection>("TD");
  const [nodes, setNodes] = useState<MermaidNode[]>(initialNodes);
  const [edges, setEdges] = useState<MermaidEdge[]>(initialEdges);
  const [diagramText, setDiagramText] = useState(buildInitialText);
  const [importText, setImportText] = useState(buildInitialText);
  const [previewSvg, setPreviewSvg] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  const { buttonText: copyButtonText, handleCopy } =
    useCopyToClipboard("Copy Mermaid");

  const [newNodeId, setNewNodeId] = useState("");
  const [newNodeLabel, setNewNodeLabel] = useState("");
  const [newNodeShape, setNewNodeShape] =
    useState<MermaidNodeShape>("rectangle");

  const [newEdgeFrom, setNewEdgeFrom] = useState("");
  const [newEdgeTo, setNewEdgeTo] = useState("");
  const [newEdgeLabel, setNewEdgeLabel] = useState("");
  const [newEdgeStyle, setNewEdgeStyle] =
    useState<MermaidEdgeStyle>("solid");

  const nodeOptions = useMemo(
    () => nodes.map((node) => ({ id: node.id, label: node.label })),
    [nodes]
  );

  useEffect(() => {
    let isActive = true;
    if (!diagramText.trim()) {
      setPreviewSvg(null);
      setRenderError(null);
      return;
    }
    renderMermaidToSvg(diagramText)
      .then((svg) => {
        if (!isActive) {
          return;
        }
        setPreviewSvg(svg);
        setRenderError(null);
      })
      .catch((error) => {
        if (!isActive) {
          return;
        }
        setPreviewSvg(null);
        setRenderError(
          error instanceof Error ? error.message : "Failed to render diagram."
        );
      });
    return () => {
      isActive = false;
    };
  }, [diagramText]);

  const syncFromBuilder = useCallback(() => {
    const text = buildMermaidText({ direction, nodes, edges });
    setDiagramText(text);
    setImportText(text);
  }, [direction, nodes, edges]);

  const handleImportToBuilder = useCallback(() => {
    const parsed = parseMermaidText(importText);
    setDirection(parsed.direction);
    setNodes(parsed.nodes);
    setEdges(parsed.edges);
    setDiagramText(importText);
  }, [importText]);

  const addNode = useCallback(() => {
    const id = newNodeId.trim();
    if (!id) {
      return;
    }
    if (nodes.some((node) => node.id === id)) {
      return;
    }
    const label = newNodeLabel.trim() || id;
    setNodes((prev) => [...prev, { id, label, shape: newNodeShape }]);
    setNewNodeId("");
    setNewNodeLabel("");
  }, [newNodeId, newNodeLabel, newNodeShape, nodes]);

  const removeNode = useCallback((id: string) => {
    setNodes((prev) => prev.filter((node) => node.id !== id));
    setEdges((prev) => prev.filter((edge) => edge.from !== id && edge.to !== id));
  }, []);

  const addEdge = useCallback(() => {
    if (!newEdgeFrom || !newEdgeTo) {
      return;
    }
    setEdges((prev) => [
      ...prev,
      {
        from: newEdgeFrom,
        to: newEdgeTo,
        label: newEdgeLabel.trim() || undefined,
        style: newEdgeStyle,
      },
    ]);
    setNewEdgeLabel("");
  }, [newEdgeFrom, newEdgeTo, newEdgeLabel, newEdgeStyle]);

  const removeEdge = useCallback((index: number) => {
    setEdges((prev) => prev.filter((_, idx) => idx !== index));
  }, []);

  const handleCopyMarkdown = useCallback(() => {
    handleCopy(`\`\`\`mermaid\n${diagramText}\n\`\`\``);
  }, [diagramText, handleCopy]);

  const handleDownloadSvg = useCallback(() => {
    if (!previewSvg) {
      return;
    }
    downloadTextAsFile(previewSvg, "diagram.svg", "image/svg+xml");
  }, [previewSvg]);

  const handleDownloadPng = useCallback(async () => {
    if (!previewSvg) {
      return;
    }
    const pngDataUrl = await svgToPngDataUrl(previewSvg);
    downloadDataUrl(pngDataUrl, "diagram.png");
  }, [previewSvg]);

  return (
    <main>
      <Meta
        title="Mermaid Diagram Builder | Free, Open Source & Ad-free"
        description="Build and preview Mermaid diagrams in your browser. Generate diagrams with a builder, import Mermaid text, and export SVG or PNG."
      />
      <Header />
      <CMDK />

      <section className="container max-w-3xl mb-12">
        <PageHeader
          title="Mermaid Diagram Builder"
          description="Build Mermaid diagrams with a live preview and export options."
        />
      </section>

      <section className="container max-w-3xl mb-6">
        <Card className="flex flex-col p-6 hover:shadow-none shadow-none rounded-xl">
          <Tabs defaultValue="editor" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="editor">Editor</TabsTrigger>
              <TabsTrigger value="builder">Builder</TabsTrigger>
              <TabsTrigger value="import">Import</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="space-y-4">
              <div>
                <Label>Mermaid Text</Label>
                <Textarea
                  rows={10}
                  value={diagramText}
                  onChange={(event) => setDiagramText(event.target.value)}
                  placeholder="flowchart TD\n  A[Start] --> B[End]"
                  aria-label="Mermaid text input"
                />
              </div>
            </TabsContent>

            <TabsContent value="builder" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <Label>Direction</Label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm"
                    value={direction}
                    onChange={(event) =>
                      setDirection(event.target.value as MermaidDirection)
                    }
                  >
                    {directionOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <Button variant="secondary" onClick={syncFromBuilder}>
                    Generate Mermaid Text
                  </Button>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <Label>Add Node</Label>
                  <Input
                    placeholder="Node ID (unique)"
                    value={newNodeId}
                    onChange={(event) => setNewNodeId(event.target.value)}
                  />
                  <Input
                    placeholder="Label (optional)"
                    value={newNodeLabel}
                    onChange={(event) => setNewNodeLabel(event.target.value)}
                  />
                  <select
                    className="flex h-10 w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm"
                    value={newNodeShape}
                    onChange={(event) =>
                      setNewNodeShape(event.target.value as MermaidNodeShape)
                    }
                  >
                    {nodeShapeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <Button onClick={addNode} variant="secondary">
                    Add Node
                  </Button>
                </div>

                <div className="space-y-4">
                  <Label>Add Edge</Label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm"
                    value={newEdgeFrom}
                    onChange={(event) => setNewEdgeFrom(event.target.value)}
                  >
                    <option value="">From</option>
                    {nodeOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <select
                    className="flex h-10 w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm"
                    value={newEdgeTo}
                    onChange={(event) => setNewEdgeTo(event.target.value)}
                  >
                    <option value="">To</option>
                    {nodeOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <Input
                    placeholder="Label (optional)"
                    value={newEdgeLabel}
                    onChange={(event) => setNewEdgeLabel(event.target.value)}
                  />
                  <select
                    className="flex h-10 w-full rounded-lg border border-input bg-muted px-3 py-2 text-sm"
                    value={newEdgeStyle}
                    onChange={(event) =>
                      setNewEdgeStyle(event.target.value as MermaidEdgeStyle)
                    }
                  >
                    {edgeStyleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <Button onClick={addEdge} variant="secondary">
                    Add Edge
                  </Button>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nodes</Label>
                  <div className="space-y-2">
                    {nodes.map((node) => (
                      <div
                        key={node.id}
                        className="flex items-center justify-between rounded-lg border border-input bg-muted px-3 py-2 text-sm"
                      >
                        <span>
                          {node.id} · {node.label} · {node.shape}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeNode(node.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Edges</Label>
                  <div className="space-y-2">
                    {edges.map((edge, index) => (
                      <div
                        key={`${edge.from}-${edge.to}-${index}`}
                        className="flex items-center justify-between rounded-lg border border-input bg-muted px-3 py-2 text-sm"
                      >
                        <span>
                          {edge.from} → {edge.to}
                          {edge.label ? ` · ${edge.label}` : ""}
                          {` · ${edge.style}`}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeEdge(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="import" className="space-y-4">
              <div>
                <Label>Paste Mermaid Text</Label>
                <Textarea
                  rows={10}
                  value={importText}
                  onChange={(event) => setImportText(event.target.value)}
                  placeholder="flowchart TD\n  A[Start] --> B[End]"
                  aria-label="Mermaid import text input"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={handleImportToBuilder}>
                  Load into Builder
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDiagramText(importText)}
                >
                  Preview Only
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Import supports flowchart diagrams (TD/LR/TB/RL) generated by
                this tool.
              </p>
            </TabsContent>
          </Tabs>

          <div className="mt-6 space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={handleCopyMarkdown}>
                {copyButtonText}
              </Button>
              <Button variant="outline" onClick={handleDownloadSvg}>
                Download SVG
              </Button>
              <Button variant="outline" onClick={handleDownloadPng}>
                Download PNG
              </Button>
            </div>
            <div className="rounded-lg border border-input bg-muted p-4">
              {renderError && (
                <p className="text-sm text-red-600" role="alert">
                  {renderError}
                </p>
              )}
              {!renderError && previewSvg && (
                <div
                  className="w-full overflow-auto"
                  dangerouslySetInnerHTML={{ __html: previewSvg }}
                />
              )}
              {!renderError && !previewSvg && (
                <p className="text-sm text-muted-foreground">
                  Enter Mermaid text to see a preview.
                </p>
              )}
            </div>
          </div>
        </Card>
      </section>

      <CallToActionGrid />
    </main>
  );
}
