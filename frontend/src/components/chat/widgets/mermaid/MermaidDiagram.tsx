import React, { useState, useEffect, useRef, memo } from "react";

export const MermaidDiagram = memo(({ chart }: { chart: string }) => {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let active = true;
    const renderChart = async () => {
      try {
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
        });
        const id = `mermaid-${Math.floor(Math.random() * 100000)}`;
        const { svg: renderedSvg } = await mermaid.render(id, chart);
        if (active) {
          setSvg(renderedSvg);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || "Failed to render diagram");
        }
      }
    };
    renderChart();
    return () => {
      active = false;
    };
  }, [chart]);

  if (error) {
    return (
      <div className="p-3 border border-red-500/20 bg-red-500/5 text-red-500 rounded-xl text-xs font-mono my-3">
        Failed to render Mermaid diagram. Raw code:
        <pre className="mt-2 p-2 bg-black/40 rounded overflow-x-auto text-[10px]">{chart}</pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="p-4 border rounded-xl animate-pulse bg-muted/20 flex items-center justify-center text-xs text-muted-foreground my-3">
        Generating diagram layout...
      </div>
    );
  }

  return (
    <div 
      className="p-4 border rounded-xl bg-muted/10 overflow-x-auto shadow-sm flex justify-center my-3"
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
});
MermaidDiagram.displayName = "MermaidDiagram";
export default MermaidDiagram;
