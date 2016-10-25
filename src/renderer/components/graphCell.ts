import * as Vue from "vue";
import { NodeEdge, InterEdge, GraphFragment } from "../../grapher";
import { component, prop } from "vueit";

export interface GraphCellProps {
    graph: GraphFragment;
    gridWidth: number;
    height: number;
}

@component({
    compiledTemplate: require("./graphCell.pug")
})
export class GraphCell extends Vue implements GraphCellProps {
    @prop.required gridWidth: number;
    @prop.required height: number;
    @prop.required graph: GraphFragment;

    c2x(c: number): number {
        return c * this.gridWidth + this.gridWidth / 2;
    }
    nodeEdgePath(edge: NodeEdge): string {
        const x1 = this.c2x(edge.index);
        const x2 = this.nodeX;
        const y1 = edge.type === "P" ? this.height : 0;
        const y2 = this.height / 2;
        const rx = this.gridWidth / 2;
        const ry = this.height / 2;
        const sweep = (edge.type === "P") === (x1 < x2) ? 1 : 0;
        const ex = x1 < x2 ? rx : -1 * rx;
        const ey = y1 < y2 ? ry : -1 * ry;
        return `M ${x1},${y1} a ${rx},${ry} 0 0,${sweep} ${ex},${ey} H ${x2}`;
    }
    nodeEdgeMask(edge: NodeEdge, index: number): string {
        if (index == 0 || index == this.graph.nodeEdges.length - 1) {
            return "url(#mask-node)";
        }
        else {
            return "url(#mask-line)";
        }
    }
    nodeEdgeKey(edge: NodeEdge) {
        return `${edge.type}:${edge.index}`;
    }
    interEdgeKey(edge: InterEdge) {
        return `I:${edge.index}`;
    }
    get width(): number {
        return this.graph.width * this.gridWidth;
    }
    get radius(): number {
        return this.height >= 30 ? 6 : 5;
    }
    get nodeX(): number {
        return this.c2x(this.graph.node.index);
    }
    get nodeY(): number {
        return this.height / 2;
    }
    get nodeIdx(): number {
        return this.graph.node.index;
    }
    get foregroundEdges(): NodeEdge[] {
        const edges = this.graph.nodeEdges;
        const ret = <NodeEdge[]>[];
        if (edges.length === 0) {
            return ret;
        }
        if (edges[0].index < this.nodeIdx) {
            ret.push(edges[0]);
        }
        if (this.nodeIdx < edges[edges.length - 1].index) {
            ret.push(edges[edges.length - 1]);
        }
        return ret;
    }
}
