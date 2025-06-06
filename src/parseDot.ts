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

export function collectRelatedNodes(
  graph: Graph,
  start: string,
  direction: "forward" | "reverse",
): Set<string> {
  const visited = new Set<string>();
  const stack = [start];
  const edges = graph[direction];

  while (stack.length > 0) {
    const node = stack.pop()!;
    if (!visited.has(node)) {
      visited.add(node);
      for (const neighbor of edges.get(node) ?? []) {
        stack.push(neighbor);
      }
    }
  }

  return visited;
}
