"use client";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import vscDarkPlus from "react-syntax-highlighter/dist/cjs/styles/prism/vsc-dark-plus";

interface CodeExampleProps {
  children: string;
}

export default function CodeExample(props: CodeExampleProps) {
  return (
    <div>
      <SyntaxHighlighter language="javascript" style={vscDarkPlus}>
        {props.children}
      </SyntaxHighlighter>
    </div>
  );
}
