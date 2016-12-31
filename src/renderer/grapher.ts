import * as _ from "lodash";

export interface InterEdge {
    index: number;
    id: string;
    childId: string;
    color: string;
}

export interface NodeEdge {
    index: number;
    id: string;
    color: string;
    type: "P" | "C";
}

export interface NodeSymbol {
    index: number;
    color: string;
}

export interface GraphFragment {
    id: string;
    interEdges: InterEdge[];
    nodeEdges: NodeEdge[];
    node?: NodeSymbol;
    width: number;
}

/**
 * Color chooser for graph edges.
 */
class ColorPallete {
    _used: { [color: string]: number };
    _queue: string[];
    constructor(public colors: string[]) {
        this._queue = [ ...colors ];
        this._used = {};
        colors.forEach(c => this._used[c] = 0);
    }
    pop(): string {
        if (this._queue.length === 0) {
            this._queue.splice(0, 0, ...this.colors);
        }
        const ret = this._queue.shift();
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
    _prev: GraphFragment;
    _pallete: ColorPallete;
    constructor(public colors: string[]) {
        this._prev = null;
        this._pallete = new ColorPallete(colors);
    }

    proceed(dagNode: DagNode): GraphFragment {
        const primaryParent = dagNode.parentIds[0];
        const secondaryParents = dagNode.parentIds.slice(1);
        const prevEdges = <InterEdge[]>[];
        if (this._prev) {
            this._prev.interEdges.forEach(e => {
                prevEdges[e.index] = e;
            });
            this._prev.nodeEdges.forEach(({ index, id, color, type }) => {
                if (type === "P") {
                    prevEdges[index] = { index, id, childId: id, color };
                }
            });
        }
        let node: NodeSymbol = undefined;
        const interEdges = <InterEdge[]>[];
        const nodeEdges = <NodeEdge[]>[];
        const occupied = <boolean[]>[];
        prevEdges.forEach(e => {
            const { id, childId, index, color } = e;
            if (id === dagNode.id) {
                nodeEdges.push({ type: "C", index, id: childId, color });
                let edgeGoingOn = false;
                if (!node) {
                    occupied[index] = true;
                    node = { index, color };
                    if (primaryParent) {
                        nodeEdges.push({ type: "P", index, id: primaryParent, color });
                        edgeGoingOn = true;
                    }
                }
                if (!edgeGoingOn) {
                    this._pallete.push(color);
                }
            }
            else {
                interEdges.push(e);
                occupied[index] = true;
                const pidx = secondaryParents.indexOf(id);
                if (pidx >= 0) {
                    nodeEdges.push({ type: "P", index, id, color });
                    secondaryParents.splice(pidx, 1);
                }
            }
        });
        for (let index = 0; !node || secondaryParents.length > 0; ++index) {
            if (occupied[index]) {
                continue;
            }
            occupied[index] = true;
            const color = this._pallete.pop();
            if (!node) {
                node = { index, color };
                if (primaryParent) {
                    nodeEdges.push({ type: "P", index, id: primaryParent, color });
                }
            }
            else {
                nodeEdges.push({ type: "P", index, id: secondaryParents.shift(), color });
            }
        }
        this._prev = {
            id: dagNode.id,
            node,
            interEdges,
            nodeEdges: _.sortBy(nodeEdges, "index"),
            width: Math.max(prevEdges.length, occupied.length)
        };
        return this._prev;
    }
}
