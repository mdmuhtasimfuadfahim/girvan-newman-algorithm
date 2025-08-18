# Explanation of Girvan–Newman Implementation

## Step 1: Build the Graph
- Nodes and edges are parsed from `samplenetwork.txt`.
- Graph is undirected, stored as adjacency lists.

## Step 2: Edge Betweenness Centrality
- Implemented using Brandes algorithm (2001).
- For each node:
  - Run BFS to find shortest paths.
  - Count number of paths passing through each edge.
- Normalize results since the graph is undirected.

## Step 3: Edge Removal
- Identify edge with **highest betweenness** (most “between” communities).
- Remove it to weaken connection between clusters.

## Step 4: Community Detection
- After removal, graph is split into **connected components**.
- Each component = one community.

## Step 5: Visualization
- **Original graph**: shown with all edges, gray nodes.
- **After removal**: nodes are colored by community (D3 color scale).
- Bridge edges are removed and clusters appear separated.

---
