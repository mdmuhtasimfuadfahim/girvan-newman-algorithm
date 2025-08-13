const fs = require('fs');
const Graph = require('graphology');

function loadGraphFromFile(filePath) {
    const lines = fs.readFileSync(filePath, 'utf8')
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);

    const graph = new Graph({ type: 'undirected' });

    lines.forEach(line => {
        if (line.startsWith('n')) {
            // Node definition
            const [node, coords] = line.split(' ');
            const name = node.trim();
            let x = 0, y = 0;
            if (coords) {
                const [xStr, yStr] = coords.replace('[', '').replace(']', '').split(',');
                x = parseFloat(xStr);
                y = parseFloat(yStr);
            }
            graph.addNode(name, { x, y });
        } else if (line.startsWith('edge')) {
            // Edge definition
            const [n1, n2] = line.replace('edge(', '').replace(')', '').split(',');
            graph.addUndirectedEdge(n1.trim(), n2.trim());
        }
    });

    return graph;
}

module.exports = loadGraphFromFile;
