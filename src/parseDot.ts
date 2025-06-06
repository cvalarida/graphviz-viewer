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
  start: string,
  map: Map<string, Set<string>>,
): Set<string> {
  const visited = new Set<string>();
  const stack = [start];
  while (stack.length > 0) {
    const current = stack.pop()!;
    for (const neighbor of map.get(current) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        stack.push(neighbor);
      }
    }
  }
  return visited;
}
