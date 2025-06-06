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
  const visited = new Set<string>();

  function dfs(current: string, map: Map<string, Set<string>>) {
    if (visited.has(current)) return;
    visited.add(current);
    for (const neighbor of map.get(current) ?? []) {
      dfs(neighbor, map);
    }
  }

  dfs(start, graph.forward); // downstream
  dfs(start, graph.reverse); // upstream

  return visited;
}
