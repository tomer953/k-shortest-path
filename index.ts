import * as graphlib from 'graphlib';

export interface Edge {
  fromNode: string;
  toNode: string;
  weight: number;
}

export interface IPath {
  totalCost: number;
  edges: Edge[];
}

export function ksp(g: graphlib.Graph, source: string, target: string, K: number, weightFunc?: any, edgeFunc?: any): IPath[] {
  let _g = graphlib.json.read(graphlib.json.write(g));
  let ksp: IPath[] = [];
  let candidates: IPath[] = [];

  const getDijkstra = (g: graphlib.Graph, source: string, target: string, weightFunc?: any, edgeFunc?: any): IPath | undefined => {
    if (!weightFunc) {
      weightFunc = (e: any) => g.edge(e);
    }

    const dijkstra = graphlib.alg.dijkstra(g, source, weightFunc, edgeFunc);
    return extractIPathFromDijkstra(g, dijkstra, source, target, weightFunc, edgeFunc);
  };

  const extractIPathFromDijkstra = (g: graphlib.Graph, dijkstra: any, source: string, target: string, weightFunc?: any, edgeFunc?: any): IPath | undefined => {
    if (dijkstra[target].distance === Number.POSITIVE_INFINITY) {
      return undefined;
    }

    let edges: Edge[] = [];
    let currentNode = target;
    while (currentNode !== source) {
      let previousNode = dijkstra[currentNode].predecessor;
      let weightValue: number;

      if (weightFunc) {
        weightValue = weightFunc({ v: previousNode, w: currentNode });
      } else {
        weightValue = g.edge(previousNode, currentNode);
      }

      let edge: Edge = { fromNode: previousNode, toNode: currentNode, weight: weightValue };
      edges.push(edge);
      currentNode = previousNode;
    }

    return {
      totalCost: dijkstra[target].distance,
      edges: edges.reverse(),
    };
  };

  const addEdges = (g: graphlib.Graph, edges: Edge[]) => {
    edges.forEach((e) => {
      g.setEdge(e.fromNode, e.toNode, e.weight);
    });
  };

  const removeNode = (g: graphlib.Graph, rn: string, weightFunc?: any): Edge[] => {
    let remEdges: Edge[] = [];
    let edges = g.edges();
    edges.forEach((edge) => {
      if (edge.v === rn || edge.w === rn) {
        let weightValue: number;

        if (weightFunc) {
          weightValue = weightFunc(edge);
        } else {
          weightValue = g.edge(edge);
        }

        let e: Edge = { fromNode: edge.v, toNode: edge.w, weight: weightValue };
        remEdges.push(e);
      }
    });
    g.removeNode(rn);
    return remEdges;
  };

  const cloneIPathTo = (IPath: IPath, i: number): IPath => {
    let newIPath: IPath = { totalCost: 0, edges: [] };
    let edges: Edge[] = [];
    let l = IPath.edges.length;
    if (i > l) {
      i = 1;
    }

    for (let j = 0; j < i; j++) {
      edges.push(IPath.edges[j]);
    }

    newIPath.totalCost = 0;
    edges.forEach((edge) => {
      newIPath.totalCost += edge.weight;
    });
    newIPath.edges = edges;
    return newIPath;
  };

  const isIPathEqual = (IPath1: IPath, IPath2: IPath | undefined): boolean => {
    if (IPath2 === undefined) {
      return false;
    }

    let numEdges1 = IPath1.edges.length;
    let numEdges2 = IPath2.edges.length;

    if (numEdges1 !== numEdges2) {
      return false;
    }

    for (let i = 0; i < numEdges1; i++) {
      let edge1 = IPath1.edges[i];
      let edge2 = IPath2.edges[i];
      if (edge1.fromNode !== edge2.fromNode) {
        return false;
      }
      if (edge1.toNode !== edge2.toNode) {
        return false;
      }
    }

    return true;
  };

  const cloneObject = (obj: any): any => {
    return JSON.parse(JSON.stringify(obj));
  };

  const isIPathExistInArray = (candidates: IPath[], IPath: IPath): boolean => {
    candidates.forEach((candi) => {
      if (isIPathEqual(candi, IPath)) {
        return true;
      }
    });
    return false;
  };

  const removeBestCandidate = (candidates: IPath[]): IPath | undefined => {
    return candidates.sort((a, b) => a.totalCost - b.totalCost).shift();
  };

  let kthIPath = getDijkstra(_g, source, target, weightFunc, edgeFunc);
  if (!kthIPath) {
    return ksp;
  }
  ksp.push(kthIPath);

  for (let k = 1; k < K; k++) {
    let previousIPath = cloneObject(ksp[k - 1]);

    if (!previousIPath) {
      break;
    }

    for (let i = 0; i < previousIPath.edges.length; i++) {
      let removedEdges: Edge[] = [];
      let spurNode = previousIPath.edges[i].fromNode;
      let rootIPath = cloneIPathTo(previousIPath, i);

      ksp.forEach((p) => {
        p = cloneObject(p);
        let stub = cloneIPathTo(p, i);

        if (isIPathEqual(rootIPath, stub)) {
          let re = p.edges[i];
          _g.removeEdge(re.fromNode, re.toNode);
          removedEdges.push(re);
        }
      });

      rootIPath.edges.forEach((rootIPathEdge) => {
        let rn = rootIPathEdge.fromNode;
        if (rn !== spurNode) {
          let removedEdgeFromNode = removeNode(_g, rn, weightFunc);
          removedEdges.push(...removedEdgeFromNode);
        }
      });

      let spurIPath = getDijkstra(_g, spurNode, target, weightFunc, edgeFunc);

      if (spurIPath !== undefined) {
        let totalIPath = cloneObject(rootIPath);
        let edgesToAdd = cloneObject(spurIPath.edges);
        totalIPath.edges.push(...edgesToAdd);
        totalIPath.totalCost += spurIPath.totalCost;

        if (!isIPathExistInArray(candidates, totalIPath)) {
          candidates.push(totalIPath);
        }
      }

      addEdges(_g, removedEdges);
    }

    let isNewIPath;
    do {
      kthIPath = removeBestCandidate(candidates);
      isNewIPath = true;
      if (kthIPath !== undefined) {
        for (let p of ksp) {
          if (isIPathEqual(p, kthIPath)) {
            isNewIPath = false;
            break;
          }
        }
      }
    } while (!isNewIPath);

    if (kthIPath === undefined) {
      break;
    }

    ksp.push(kthIPath);
  }
  return ksp;
}
