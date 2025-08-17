/**
 * server.js
 * Express server that:
 *  - Parses data/samplenetwork.txt to build an undirected graph
 *  - Computes edge betweenness centrality (Brandes algorithm for edges)
 *  - Removes the single edge with highest betweenness (one GN step)
 *  - Detects communities (connected components) after removal
 *  - Serves an HTML visualization that contrasts original vs after
 */
const express = require('express');
const path = require('path');
const fs = require('fs');

const { parseNetworkFile } = require('./src/parser');
const { Graph } = require('./src/graph');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

function buildGraphs() {
  // Read and parse the network file
  const raw = fs.readFileSync(path.join(__dirname, 'data', 'samplenetwork.txt'), 'utf-8');
  const { nodes, edges } = parseNetworkFile(raw);

  // Build Graph
  const g = new Graph();
  nodes.forEach(n => g.addNode(n.id, n.x, n.y));
  edges.forEach(e => g.addEdge(e.source, e.target));

  // Compute edge betweenness on the original graph
  const betweenness = g.edgeBetweenness();

  // Find the single edge with the highest betweenness
  let maxEdge = null;
  let maxVal = -Infinity;
  for (const [edgeKey, val] of Object.entries(betweenness)) {
    if (val > maxVal) {
      maxVal = val;
      maxEdge = edgeKey; // format "u|v"
    }
  }

  // Create a copy and remove the highest-betweenness edge
  const after = g.clone();
  if (maxEdge) {
    const [u, v] = maxEdge.split('|');
    after.removeEdge(u, v);
  }

  // Compute communities (connected components) after removal
  const communities = after.connectedComponents(); // array of arrays of node ids
  const communityMap = new Map();
  communities.forEach((comp, idx) => {
    comp.forEach(nodeId => communityMap.set(nodeId, idx));
  });

  // Prepare D3-friendly payloads
  const originalPayload = g.toD3();
  originalPayload.betweenness = betweenness;
  originalPayload.removedEdge = maxEdge;

  const afterPayload = after.toD3((id) => communityMap.get(id));

  return { original: originalPayload, after: afterPayload };
}

let cache = buildGraphs();

// Simple hot reload of data without restarting server (optional)
app.get('/api/reload', (req, res) => {
  try {
    cache = buildGraphs();
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get('/api/graphs', (req, res) => {
  res.json(cache);
});

// Fallback index
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
