import { graphviz } from "d3-graphviz";

document.addEventListener("DOMContentLoaded", () => {
  const renderer = graphviz("#graph");

  renderer.on("initEnd", () => {
    const input = document.getElementById("dot-file");

    input?.addEventListener("change", (event) => {
      // @ts-expect-error It's gonna have files. 🤫
      const file = event.target?.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const dotSrc = e.target?.result;
        renderer.renderDot(dotSrc?.toString() ?? "", () => {
          console.log('"Graph rendering complete."');
          const svg = document.querySelector(
            "#graph svg",
          ) as SVGSVGElement | null;
          if (svg) {
            // Remove hardcoded dimensions
            svg.removeAttribute("width");
            svg.removeAttribute("height");

            // Ensure responsive sizing
            svg.setAttribute("width", "100%");
            svg.setAttribute("height", "100%");
            svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
            svg.setAttribute(
              "viewBox",
              `0 0 ${svg.getBBox().width} ${svg.getBBox().height}`,
            );
          }
        });
      };
      reader.readAsText(file);
    });
  });
});
