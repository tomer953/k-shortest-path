# KSP - K Shortest Path

### Computes the K shortest paths in a graph from node S to node T using [Yen's algorithm](https://en.wikipedia.org/wiki/Yen%27s_algorithm).

### Installation

Dillinger requires [Node.js](https://nodejs.org/) v4+ to run.

Install the dependencies and devDependencies and start the server.

```
npm i k-shortest-path
```

### How to use
This package needs [graphlib](https://github.com/dagrejs/graphlib) to work.

first install graphlib using:
```npm i graphlib```
or follow the latest instructions on their [official github](https://github.com/dagrejs/graphlib)

now build your graph:
```javascript
const graphlib = require('graphlib');

let g = new graphlib.Graph();

// create edge: (fromNode, toNode, weight)
g.setEdge('C', 'D', 3);
g.setEdge('C', 'E', 2);
g.setEdge('D', 'F', 4);
g.setEdge('E', 'D', 1);
g.setEdge('E', 'F', 2);
g.setEdge('E', 'G', 3);
g.setEdge('F', 'G', 2);
g.setEdge('F', 'H', 1);
g.setEdge('G', 'H', 2);

```

and finally use this library to calculate k shortest path:
```javascript
const ksp = require('k-shortest-path');

// (graph, startNode, targetNode, k)
ksp.ksp(g, 'C', 'H', k);
```

---
### Information & limitations
- Yen's algorithm computes loop-less paths only
- This Yen's algorithm use [Dijkstra algorithm](https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm) for finding the shortest path on each iteration, therefor works only with non-negative weights.

---

#### Credits
Thanks to [Brandon Smock](https://github.com/bsmock/k-shortest-paths) for implement Yen's algorithem on Java, Helped me a lot.

Tested with Node version `v10.16.3`
