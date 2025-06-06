import { graphviz } from "d3-graphviz";

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
          // Get the silly thing to fit inside the whole container
          const svg = document.querySelector(
            "#graph svg",
          ) as SVGSVGElement | null;
          if (!svg) return;

          // Remove forced width/height
          svg.removeAttribute("width");
          svg.removeAttribute("height");

          // Read actual bounding box
          const bbox = svg.getBBox();
          svg.setAttribute("viewBox", `0 0 ${bbox.width} ${bbox.height}`);
          svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

          // Stretch to fit container
          // svg.style.width = "100%";
          // svg.style.height = "auto";
          // svg.style.display = "block";
        });
      };

      reader.readAsText(file);
    });
  });
});
