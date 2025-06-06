import { select, selectAll } from "d3-selection";
import { graphviz } from "d3-graphviz";
import { type Graph, parseDot, collectRelatedNodes } from "./parseDot";

function bindHoverBehavior(graph: Graph) {
  const labelEl = document.getElementById("node-label")!;
  const ancestorEl = document.getElementById("ancestors")!;
  const descendantEl = document.getElementById("descendants")!;

  selectAll("g.node").each(function () {
    const g = select(this);
    const id = g.select("title").text();

    g.on("mouseenter", () => {
      const ancestors = collectRelatedNodes(id, graph.reverse);
      const descendants = collectRelatedNodes(id, graph.forward);
      const all = new Set([id, ...ancestors, ...descendants]);

      // Highlight nodes
      selectAll("g.node").each(function () {
        const nodeId = select(this).select("title").text();
        select(this)
          .classed("highlight", all.has(nodeId))
          .classed("dimmed", !all.has(nodeId));
      });

      // Highlight edges
      selectAll("g.edge").each(function () {
        const label = select(this).select("title").text();
        const [from, to] = label.split("->").map((s) => s.trim());
        const show = all.has(from) && all.has(to) && graph.edges.has(label);
        select(this).classed("highlight", show).classed("dimmed", !show);
      });

      // Update sidebar
      labelEl.textContent = id;
      ancestorEl.innerHTML = [...ancestors]
        .map((n) => `<li>${n}</li>`)
        .join("");
      descendantEl.innerHTML = [...descendants]
        .map((n) => `<li>${n}</li>`)
        .join("");
    });

    g.on("mouseleave", () => {
      selectAll("g.node, g.edge")
        .classed("highlight", false)
        .classed("dimmed", false);
      labelEl.textContent = "";
      ancestorEl.innerHTML = "";
      descendantEl.innerHTML = "";
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
