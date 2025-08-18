# Explanation of Girvan--Newman Implementation

This document explains **how the algorithm was implemented and
verified** against the assignment requirements.

------------------------------------------------------------------------

## Step 1: Build the Graph

-   `samplenetwork.txt` defines **at least 20 nodes and 25+ edges** (our
    demo file has 25 nodes, 34 edges).
-   `src/parser.js` reads the file:
    -   Lines like `n1 [x,y]` create nodes (coordinates optional).
    -   Lines like `edge(n1,n2)` create **undirected** edges.
    -   Comment lines starting with `%` or unknown tokens like `5mm` are
        **ignored**.
-   `src/graph.js` stores the graph as **adjacency lists** using
    `Map<node, Set<neighbor>>`.

------------------------------------------------------------------------

## Step 2: Edge Betweenness Centrality (Brandes Algorithm)

-   **Goal**: Find which edge lies on the greatest number of shortest
    paths.
-   For **every node s**:
    1.  Run **BFS shortest paths** to compute distances `dist[v]` and
        path counts `sigma[v]`.
    2.  Track **predecessors P\[w\]** of each node along shortest paths.
    3.  Back-propagate **dependency scores delta\[v\]** from farthest to
        nearest nodes.
    4.  Accumulate contributions to **edge betweenness scores**.
-   Because the graph is **undirected**, results are divided by 2 (each
    path counted twice).
-   Final result is a `Map<edgeKey, score>` where `edgeKey = u|v`
    (sorted).

------------------------------------------------------------------------

## Step 3: Edge Removal (One GN Step)

-   **Find max betweenness edge** (if ties → remove first in iteration
    order).
-   Clone the original graph and remove that edge.
-   **This is exactly what the assignment specifies:** one step of
    Girvan--Newman.

------------------------------------------------------------------------

## Step 4: Community Detection

-   After removing the bridge edge, compute **connected components** via
    DFS/BFS.
-   Each component is labeled with a **community ID** (0,1,2,...).
-   These labels are sent to the frontend to **color nodes by
    community**.

------------------------------------------------------------------------

## Step 5: Visualization (Part C)

-   The Express server (`server.js`) has an API endpoint `/api/graphs`:
    -   **Original graph** → nodes + links + betweenness scores +
        removed edge.
    -   **After removal** → nodes + links + community IDs.
-   `public/index.html` uses **D3.js v7** to render **two force-directed
    graphs side by side**:
    -   **Left: Original graph**
        -   Edge thickness ∝ betweenness.
        -   The removed edge is highlighted in **red**.
    -   **Right: After removal**
        -   Nodes are **colored by community** (green vs orange).
        -   Layout is centered for better comparison.

------------------------------------------------------------------------

## Verification Against Assignment

-   **Part A:** Graph created with ≥20 nodes and ≥25 edges ✅
-   **Part B:** Edge betweenness computed using Brandes algorithm +
    highest edge removed ✅
-   **Part C:** Two contrasting visualizations side-by-side (Original vs
    After) with community colors ✅

------------------------------------------------------------------------

## Key Files

-   `src/parser.js` → parses `samplenetwork.txt`
-   `src/graph.js` → betweenness calculation, community detection
-   `server.js` → API + static file hosting
-   `public/index.html` → D3.js visualization (green vs orange for
    communities)

------------------------------------------------------------------------
