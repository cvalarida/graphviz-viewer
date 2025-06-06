export type Graph = {
  forward: Map<string, Set<string>>;
  reverse: Map<string, Set<string>>;
  edges: Set<string>;
};

export function parseDot(dot: string): Graph {
  const edgePattern = /^\s*"?([\w./-]+)"?\s*->\s*"?([\w./-]+)"?/gm;
  const forward = new Map<string, Set<string>>();
  const reverse = new Map<string, Set<string>>();
  const edges = new Set<string>();

  let match;
  while ((match = edgePattern.exec(dot)) !== null) {
    const [_, from, to] = match;

    if (!forward.has(from)) forward.set(from, new Set());
    if (!reverse.has(to)) reverse.set(to, new Set());

    forward.get(from)!.add(to);
    reverse.get(to)!.add(from);
    edges.add(`${from}->${to}`);
  }

  return { forward, reverse, edges };
}

export function collectRelatedNodes(graph: Graph, start: string): Set<string> {
  function dfs(
    from: string,
    map: Map<string, Set<string>>,
    visited: Set<string>,
  ) {
    if (visited.has(from)) return;
    visited.add(from);
    for (const neighbor of map.get(from) ?? []) {
      dfs(neighbor, map, visited);
    }
  }

  const upstream = new Set<string>();
  const downstream = new Set<string>();

  dfs(start, graph.reverse, upstream); // parents
  dfs(start, graph.forward, downstream); // children

  // Merge both
  const combined = new Set<string>([...upstream, ...downstream, start]);
  return combined;
}
