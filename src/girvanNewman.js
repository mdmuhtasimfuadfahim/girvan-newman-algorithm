const edgeBetweennessCentrality = require('graphology-metrics/centrality/edge-betweenness');

function girvanNewman(graph) {
    const betweenness = edgeBetweennessCentrality(graph);
    let maxEdge = null;
    let maxValue = -Infinity;

    for (const edge of graph.edges()) {
        if (betweenness[edge] > maxValue) {
            maxValue = betweenness[edge];
            maxEdge = edge;
        }
    }

    console.log(`Removing edge: ${maxEdge} (betweenness: ${maxValue})`);
    graph.dropEdge(maxEdge);
}

module.exports = girvanNewman;
