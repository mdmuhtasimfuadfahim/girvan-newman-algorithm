/**
 * src/graph.js
 * Undirected graph + Brandes edge betweenness + Girvan–Newman one-step utilities.
 */
class Graph {
  constructor() {
    // Map: nodeId -> { id, x?, y? }
    this.nodes = new Map();
    // Map: nodeId -> Set(neighborId)
    this.adj = new Map();
  }

  addNode(id, x = null, y = null) {
    if (!this.nodes.has(id)) {
      this.nodes.set(id, { id, x, y });
      this.adj.set(id, new Set());
    } else {
      // Update coords if provided
      const n = this.nodes.get(id);
      if (x !== null) n.x = x;
      if (y !== null) n.y = y;
    }
  }

  _edgeKey(u, v) {
    return (u < v) ? `${u}|${v}` : `${v}|${u}`;
  }

  addEdge(u, v) {
    if (!this.nodes.has(u) || !this.nodes.has(v)) {
      throw new Error(`Both endpoints must exist before adding edge: ${u}-${v}`);
    }
    if (u === v) return; // Ignore self-loops
    this.adj.get(u).add(v);
    this.adj.get(v).add(u);
  }

  removeEdge(u, v) {
    if (this.adj.has(u)) this.adj.get(u).delete(v);
    if (this.adj.has(v)) this.adj.get(v).delete(u);
  }

  clone() {
    const g = new Graph();
    for (const [id, n] of this.nodes.entries()) {
      g.addNode(id, n.x ?? null, n.y ?? null);
    }
    for (const [u, nbrs] of this.adj.entries()) {
      for (const v of nbrs) {
        if (u < v) g.addEdge(u, v);
      }
    }
    return g;
  }

  /**
   * Brandes algorithm for edge betweenness centrality on undirected graphs.
   * Returns an object: { "u|v": score, ... } for each undirected edge u-v.
   * Reference: Brandes (2001). A faster algorithm for betweenness centrality.
   */
  edgeBetweenness() {
    const nodes = Array.from(this.nodes.keys());
    // Initialize edge scores to 0
    const edgeScore = {};
    for (const u of nodes) {
      for (const v of this.adj.get(u)) {
        if (u < v) edgeScore[this._edgeKey(u, v)] = 0;
      }
    }

    // For each source node s
    for (const s of nodes) {
      // Single-source shortest-paths
      const S = []; // stack of vertices in order of nondecreasing distance
      const P = new Map(); // predecessor lists
      const sigma = new Map(); // sigma[v]: # of shortest paths from s to v
      const dist = new Map(); // dist[v]: distance from s (-1 means not seen)
      const Q = []; // queue for BFS

      for (const v of nodes) {
        P.set(v, []);
        sigma.set(v, 0);
        dist.set(v, -1);
      }
      sigma.set(s, 1);
      dist.set(s, 0);
      Q.push(s);

      // BFS
      while (Q.length > 0) {
        const v = Q.shift();
        S.push(v);
        for (const w of this.adj.get(v)) {
          if (dist.get(w) < 0) {
            dist.set(w, dist.get(v) + 1);
            Q.push(w);
          }
          if (dist.get(w) === dist.get(v) + 1) {
            sigma.set(w, sigma.get(w) + sigma.get(v));
            P.get(w).push(v);
          }
        }
      }

      // Accumulation
      const delta = new Map();
      for (const v of nodes) delta.set(v, 0);

      while (S.length > 0) {
        const w = S.pop();
        for (const v of P.get(w)) {
          const c = (sigma.get(v) / (sigma.get(w) || 1)) * (1 + delta.get(w));
          const key = this._edgeKey(v, w);
          // Because undirected, we sum contributions once here; we'll divide by 2 after all sources.
          edgeScore[key] += c;
          delta.set(v, delta.get(v) + c);
        }
      }
    }

    // For undirected graphs, each shortest path is counted twice (once from each direction)
    for (const k of Object.keys(edgeScore)) {
      edgeScore[k] /= 2.0;
    }
    return edgeScore;
  }

  /**
   * Connected components using BFS.
   * Returns an array of components, each is an array of node ids.
   */
  connectedComponents() {
    const visited = new Set();
    const comps = [];
    for (const start of this.nodes.keys()) {
      if (visited.has(start)) continue;
      const comp = [];
      const q = [start];
      visited.add(start);
      while (q.length) {
        const v = q.shift();
        comp.push(v);
        for (const w of this.adj.get(v)) {
          if (!visited.has(w)) {
            visited.add(w);
            q.push(w);
          }
        }
      }
      comps.push(comp);
    }
    return comps;
  }

  /**
   * Produce a D3-friendly { nodes, links } object.
   * Optionally provide a function communityOf(id)->number to attach "community" per node.
   */
  toD3(communityOf = null) {
    const d3nodes = Array.from(this.nodes.values()).map(n => ({
      id: n.id,
      label: n.id,
      // If coordinates exist in file, pass as "fx","fy" for initial positioning; D3 can still move them.
      fx: (typeof n.x === 'number') ? n.x : null,
      fy: (typeof n.y === 'number') ? n.y : null,
      community: communityOf ? communityOf(n.id) : null
    }));

    const links = [];
    const seen = new Set();
    for (const [u, nbrs] of this.adj.entries()) {
      for (const v of nbrs) {
        const key = this._edgeKey(u, v);
        if (seen.has(key)) continue;
        seen.add(key);
        links.push({ source: u, target: v });
      }
    }
    return { nodes: d3nodes, links };
  }
}

module.exports = { Graph };
