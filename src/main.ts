// src/main.js
import * as d3 from "d3";
import { graphviz } from "d3-graphviz";

document.addEventListener("DOMContentLoaded", () => {
  const renderer = graphviz("#graph");

  renderer.on("initEnd", () => {
    const input = document.getElementById("dot-file");

    input?.addEventListener("change", (event) => {
      const file = event.target?.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const dotSrc = e.target?.result;
        renderer.renderDot(dotSrc?.toString() ?? "");
      };
      reader.readAsText(file);
    });
  });
});
