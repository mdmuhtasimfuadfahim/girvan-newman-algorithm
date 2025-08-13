import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import loadGraphFromFile from './loadGraph.js';
import girvanNewman from './girvanNewman.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.join(__dirname, '../src/', 'output');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const originalGraph = loadGraphFromFile(path.join(__dirname, '../src/', 'samplenetwork.txt'));
fs.writeFileSync(path.join(outputDir, 'graph_original.json'), JSON.stringify(originalGraph.export(), null, 2));

const afterGraph = loadGraphFromFile(path.join(__dirname, '../src/', 'samplenetwork.txt'));
girvanNewman(afterGraph);
fs.writeFileSync(path.join(outputDir, 'graph_after.json'), JSON.stringify(afterGraph.export(), null, 2));

console.log('Graphs exported: graph_original.json & graph_after.json');