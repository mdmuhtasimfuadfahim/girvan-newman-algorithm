/**
 * src/parser.js
 * Parses a file with lines:
 *   n1 [x,y]
 *   n2 [x,y]
 *   edge(n1,n3)
 * Comments/unknown lines are ignored.
 */
function parseNetworkFile(text) {
  const nodes = new Map();
  const edges = [];

  const nodeRe = /^\s*([A-Za-z0-9_]+)\s*\[\s*([+-]?\d+(?:\.\d+)?)\s*,\s*([+-]?\d+(?:\.\d+)?)\s*\]\s*$/;
  const nodeNoCoordRe = /^\s*([A-Za-z0-9_]+)\s*$/;
  const edgeRe = /^\s*edge\s*\(\s*([A-Za-z0-9_]+)\s*,\s*([A-Za-z0-9_]+)\s*\)\s*$/;

  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().length === 0) continue;
    if (line.trim().startsWith('%')) continue; // comment
    // Try edge first
    let m = line.match(edgeRe);
    if (m) {
      const u = m[1]; const v = m[2];
      if (!nodes.has(u)) nodes.set(u, { id: u });
      if (!nodes.has(v)) nodes.set(v, { id: v });
      edges.push({ source: u, target: v });
      continue;
    }
    // Try node with coords
    m = line.match(nodeRe);
    if (m) {
      const id = m[1];
      const x = Number(m[2]);
      const y = Number(m[3]);
      nodes.set(id, { id, x, y });
      continue;
    }
    // Try node without coords
    m = line.match(nodeNoCoordRe);
    if (m) {
      const id = m[1];
      if (!nodes.has(id)) nodes.set(id, { id });
      continue;
    }
    // else ignore (allows "5mm", etc.)
  }
  return { nodes: Array.from(nodes.values()), edges };
}

module.exports = { parseNetworkFile };
