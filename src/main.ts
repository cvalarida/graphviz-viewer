import { select, selectAll } from "d3-selection";
import { graphviz } from "d3-graphviz";
import { type Graph, parseDot, collectRelatedNodes } from "./parseDot";

function bindHoverBehavior(graph: Graph) {
  selectAll("g.node").each(function () {
    const g = select(this);
    const id = g.select("title").text();

    g.on("mouseenter", () => {
      const related = collectRelatedNodes(graph, id);
      related.add(id); // Include the hovered node

      // Highlight related nodes
      selectAll("g.node").each(function () {
        const node = select(this);
        const nodeId = node.select("title").text();
        node
          .classed("highlight", related.has(nodeId))
          .classed("dimmed", !related.has(nodeId));
      });

      // Highlight edges that connect related nodes
      selectAll("g.edge").each(function () {
        const edge = select(this);
        const label = edge.select("title").text(); // Format: "a->b"

        const [from, to] = label.split("->").map((s) => s.trim());
        const isRelevant =
          related.has(from) && related.has(to) && graph.edges.has(label);

        edge.classed("highlight", isRelevant).classed("dimmed", !isRelevant);
      });
    });

    g.on("mouseleave", () => {
      selectAll("g.node, g.edge")
        .classed("highlight", false)
        .classed("dimmed", false);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const renderer = graphviz("#graph");

  renderer.on("initEnd", () => {
    const input = document.getElementById("dot-file");

    input?.addEventListener("change", (event) => {
      // @ts-expect-error It's gonna have files.
      const file = event.target?.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const dotSrc = e.target?.result?.toString() ?? "";

        renderer.renderDot(dotSrc, () => {
          const graph = parseDot(dotSrc);
          bindHoverBehavior(graph);

          // Get the silly thing to fit inside the whole container
          const svg = document.querySelector(
            "#graph svg",
          ) as SVGSVGElement | null;
          if (!svg) return;
          svg.removeAttribute("width");
          svg.removeAttribute("height");
          const bbox = svg.getBBox();
          svg.setAttribute("viewBox", `0 0 ${bbox.width} ${bbox.height}`);
          svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        });
      };

      reader.readAsText(file);
    });
  });
});
