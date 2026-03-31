export type MermaidDirection = "TD" | "LR" | "TB" | "RL";
export type MermaidNodeShape =
  | "rectangle"
  | "round"
  | "stadium"
  | "subroutine"
  | "circle"
  | "diamond";
export type MermaidEdgeStyle = "solid" | "dashed" | "thick";

export interface MermaidNode {
  id: string;
  label: string;
  shape: MermaidNodeShape;
}

export interface MermaidEdge {
  from: string;
  to: string;
  label?: string;
  style: MermaidEdgeStyle;
}

export interface MermaidDiagram {
  direction: MermaidDirection;
  nodes: MermaidNode[];
  edges: MermaidEdge[];
}

const shapeWrappers: Record<
  MermaidNodeShape,
  { open: string; close: string }
> = {
  rectangle: { open: "[", close: "]" },
  round: { open: "(", close: ")" },
  stadium: { open: "([", close: "])" },
  subroutine: { open: "[[", close: "]]" },
  circle: { open: "((", close: "))" },
  diamond: { open: "{", close: "}" },
};

const edgeTokens: Record<MermaidEdgeStyle, string> = {
  solid: "-->",
  dashed: "-.->",
  thick: "==>",
};

const edgeTokenToStyle: Record<string, MermaidEdgeStyle> = {
  "-->": "solid",
  "-.->": "dashed",
  "==>": "thick",
};

const sanitizeId = (value: string) => {
  const sanitized = value.trim().replace(/[^a-zA-Z0-9_]/g, "_");
  return sanitized.length ? sanitized : "node";
};

const escapeLabel = (value: string) => value.replace(/\|/g, "\\|");

export const buildMermaidText = ({
  direction,
  nodes,
  edges,
}: MermaidDiagram): string => {
  const header = `flowchart ${direction}`;
  const nodeLines = nodes.map((node) => {
    const wrapper = shapeWrappers[node.shape];
    const label = escapeLabel(node.label || node.id);
    return `${node.id}${wrapper.open}${label}${wrapper.close}`;
  });
  const edgeLines = edges.map((edge) => {
    const token = edgeTokens[edge.style];
    const label = edge.label ? `|${escapeLabel(edge.label)}|` : "";
    return `${edge.from} ${token}${label} ${edge.to}`;
  });
  return [header, ...nodeLines, ...edgeLines].join("\n");
};

const getDirection = (text: string): MermaidDirection => {
  const match = text.match(/^(flowchart|graph)\s+([A-Za-z]{2})/m);
  const direction = (match?.[2] || "TD").toUpperCase();
  if (direction === "LR" || direction === "TB" || direction === "RL") {
    return direction;
  }
  return "TD";
};

const parseNodeLine = (line: string): MermaidNode | null => {
  const trimmed = line.trim();
  if (!trimmed) {
    return null;
  }
  const idMatch = trimmed.match(/^([A-Za-z0-9_]+)\s*(.*)$/);
  if (!idMatch) {
    return null;
  }
  const [, rawId, rest] = idMatch;
  const id = sanitizeId(rawId);
  if (!rest) {
    return { id, label: id, shape: "rectangle" };
  }

  const shapePairs: Array<[MermaidNodeShape, string, string]> = [
    ["circle", "((", "))"],
    ["subroutine", "[[", "]]"],
    ["stadium", "([", "])"],
    ["diamond", "{", "}"],
    ["round", "(", ")"],
    ["rectangle", "[", "]"],
  ];

  for (const [shape, open, close] of shapePairs) {
    if (rest.startsWith(open) && rest.endsWith(close)) {
      const label = rest.slice(open.length, rest.length - close.length);
      return { id, label: label || id, shape };
    }
  }

  return { id, label: rest.trim() || id, shape: "rectangle" };
};

const parseEdgeLine = (line: string): MermaidEdge | null => {
  const trimmed = line.trim();
  if (!trimmed) {
    return null;
  }

  const labeled = trimmed.match(
    /^([A-Za-z0-9_]+)\s+([-.=]+>)\|(.+)\|\s+([A-Za-z0-9_]+)$/
  );
  if (labeled) {
    const [, fromRaw, token, label, toRaw] = labeled;
    const style = edgeTokenToStyle[token] || "solid";
    return {
      from: sanitizeId(fromRaw),
      to: sanitizeId(toRaw),
      label: label.trim(),
      style,
    };
  }

  const unlabeled = trimmed.match(
    /^([A-Za-z0-9_]+)\s+([-.=]+>)\s+([A-Za-z0-9_]+)$/
  );
  if (unlabeled) {
    const [, fromRaw, token, toRaw] = unlabeled;
    const style = edgeTokenToStyle[token] || "solid";
    return {
      from: sanitizeId(fromRaw),
      to: sanitizeId(toRaw),
      style,
    };
  }

  return null;
};

export const parseMermaidText = (text: string): MermaidDiagram => {
  const direction = getDirection(text);
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const nodes: MermaidNode[] = [];
  const edges: MermaidEdge[] = [];
  const nodeIds = new Set<string>();

  for (const line of lines) {
    if (/^(flowchart|graph)\s+/i.test(line)) {
      continue;
    }
    const edge = parseEdgeLine(line);
    if (edge) {
      edges.push(edge);
      nodeIds.add(edge.from);
      nodeIds.add(edge.to);
      continue;
    }
    const node = parseNodeLine(line);
    if (node && !nodeIds.has(node.id)) {
      nodes.push(node);
      nodeIds.add(node.id);
    }
  }

  for (const id of nodeIds) {
    if (!nodes.find((node) => node.id === id)) {
      nodes.push({ id, label: id, shape: "rectangle" });
    }
  }

  return { direction, nodes, edges };
};

let mermaidInitialized = false;

const ensureMermaidInitialized = async () => {
  const mermaid = (await import("mermaid")).default;
  if (!mermaidInitialized) {
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "default",
      fontFamily: "inherit",
    });
    mermaidInitialized = true;
  }
  return mermaid;
};

export const renderMermaidToSvg = async (diagramText: string) => {
  if (typeof window === "undefined") {
    return "";
  }
  const mermaid = await ensureMermaidInitialized();
  const id = `mermaid-${Math.random().toString(36).slice(2)}`;
  const { svg } = await mermaid.render(id, diagramText);
  return svg;
};

export const downloadTextAsFile = (
  content: string,
  fileName: string,
  mimeType: string
) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

export const svgToPngDataUrl = (svg: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Canvas context is not available"));
        return;
      }
      canvas.width = image.width || 800;
      canvas.height = image.height || 600;
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to render SVG to PNG"));
    };
    image.src = url;
  });

export const downloadDataUrl = (dataUrl: string, fileName: string) => {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  link.click();
};
