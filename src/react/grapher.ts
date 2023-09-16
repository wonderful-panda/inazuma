export interface Edge {
  index: number;
  id: string;
  childId: string;
  color?: string;
}

export interface InterEdge extends Edge {}

export interface NodeEdge extends Edge {
  type: "P" | "C";
}

export interface NodeSymbol {
  index: number;
  color?: string;
}

export interface GraphFragment {
  id: string;
  interEdges: InterEdge[];
  nodeEdges: NodeEdge[];
  node: NodeSymbol;
  width: number;
}

/**
 * Color chooser for graph edges.
 */
class ColorPallete {
  _used: Record<string, number>;
  _queue: string[];
  constructor(public colors: string[]) {
    this._queue = [...colors];
    this._used = {};
    colors.forEach((c) => {
      this._used[c] = 0;
    });
  }

  pop(): string {
    if (this._queue.length === 0) {
      this._queue.splice(0, 0, ...this.colors);
    }
    const ret = this._queue.shift()!;
    this._used[ret] += 1;
    return ret;
  }

  push(color: string) {
    this._used[color] -= 1;
    if (this._used[color] === 0) {
      this._queue.push(color);
    }
  }
}

/**
 * Build graph fragments from dag nodes.
 */
export class Grapher {
  _prev: GraphFragment | null;
  _pallete: ColorPallete;
  _refs: Refs;
  constructor(
    public colors: string[],
    refs: Refs
  ) {
    this._prev = null;
    this._pallete = new ColorPallete(colors);
    this._refs = refs;
  }

  isMajorRef(id: string): boolean {
    const refs = this._refs.refsById[id];
    return refs && refs.some((r) => r.type === "branch" || r.type === "tag");
  }

  proceed(dagNode: DagNode): GraphFragment {
    const primaryParent = dagNode.parentIds[0];
    const secondaryParents = dagNode.parentIds.slice(1);
    const prevEdges = [] as InterEdge[];
    if (this._prev) {
      const prevId = this._prev.id;
      this._prev.interEdges.forEach((e) => {
        prevEdges[e.index] = e;
      });
      this._prev.nodeEdges.forEach(({ index, id, color, type }) => {
        if (type === "P") {
          prevEdges[index] = { index, id, childId: prevId, color };
        }
      });
    }
    let isMajor = this.isMajorRef(dagNode.id);
    let node: NodeSymbol | undefined;
    const interEdges: InterEdge[] = [];
    const nodeEdges: NodeEdge[] = [];
    const occupied: boolean[] = [];
    prevEdges.forEach((e) => {
      const { id, childId, index, color: prevColor } = e;
      if (id === dagNode.id) {
        isMajor ||= !!prevColor;
        nodeEdges.push({ type: "C", index, id, childId, color: prevColor });
        let edgeGoingOn = false;
        if (!node) {
          occupied[index] = true;
          const color = !prevColor && isMajor ? this._pallete.pop() : prevColor;
          node = { index, color };
          if (primaryParent) {
            const id = primaryParent;
            nodeEdges.push({ type: "P", index, id, childId: id, color });
            edgeGoingOn = true;
          }
        }
        if (!edgeGoingOn && prevColor) {
          this._pallete.push(prevColor);
        }
      } else {
        interEdges.push(e);
        occupied[index] = true;
        const pidx = secondaryParents.indexOf(id);
        if (pidx >= 0) {
          const color = !prevColor && isMajor ? this._pallete.pop() : prevColor;
          nodeEdges.push({ type: "P", index, id, childId: dagNode.id, color });
          secondaryParents.splice(pidx, 1);
        }
      }
    });
    for (let index = 0; ; ++index) {
      if (occupied[index]) {
        continue;
      }
      if (!node) {
        occupied[index] = true;
        const color = isMajor ? this._pallete.pop() : undefined;
        node = { index, color };
        if (primaryParent) {
          nodeEdges.push({ type: "P", index, id: primaryParent, childId: dagNode.id, color });
        }
      } else {
        const parentId = secondaryParents.shift();
        if (parentId) {
          occupied[index] = true;
          const color = isMajor ? this._pallete.pop() : undefined;
          nodeEdges.push({ type: "P", index, id: parentId, childId: dagNode.id, color });
        } else {
          break;
        }
      }
    }
    this._prev = {
      id: dagNode.id,
      node,
      interEdges,
      nodeEdges: nodeEdges.sort((a, b) => a.index - b.index),
      width: Math.max(prevEdges.length, occupied.length)
    };
    return this._prev;
  }
}
