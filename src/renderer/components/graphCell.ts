import { NodeEdge, InterEdge, GraphFragment } from "../grapher";
import * as typed from "vue-typed-component";
const p = typed.PropOptions;

export interface GraphCellProps {
    graph: GraphFragment;
    gridWidth: number;
    height: number;
}

@typed.component<GraphCellProps>({
    ...<CompiledTemplate>require("./graphCell.pug"),
    props: {
        graph: p.Obj,
        gridWidth: p.Num.Required,
        height: p.Num.Required
    }
})
export class GraphCell extends typed.TypedComponent<GraphCellProps> {
    c2x(c: number): number {
        return c * this.$props.gridWidth + this.$props.gridWidth / 2;
    }
    nodeEdgePath(edge: NodeEdge): string {
        const x1 = this.c2x(edge.index);
        const x2 = this.nodeX;
        const y1 = edge.type === "P" ? this.$props.height : 0;
        const y2 = this.$props.height / 2;
        const rx = this.$props.gridWidth;
        const ry = this.$props.height / 2;
        const sweep = (edge.type === "P") === (x1 < x2) ? 1 : 0;
        const ex = x1 < x2 ? rx : -1 * rx;
        const ey = y1 < y2 ? ry : -1 * ry;
        return `M ${x1},${y1} a ${rx},${ry} 0 0,${sweep} ${ex},${ey} H ${x2}`;
    }
    maskUrl(id: string) {
        return `url(#${ id })`;
    }
    nodeEdgeMask(edge: NodeEdge, index: number): string {
        if (index === 0 || index === this.$props.graph.nodeEdges.length - 1) {
            return this.maskUrl(this.nodeMaskId);
        }
        else {
            return this.maskUrl(this.lineMaskId);
        }
    }
    nodeEdgeKey(edge: NodeEdge) {
        return `${edge.type}:${edge.index}`;
    }
    interEdgeKey(edge: InterEdge) {
        return `I:${edge.index}`;
    }
    get width(): number {
        return this.$props.graph.width * this.$props.gridWidth;
    }
    get radius(): number {
        return this.$props.height >= 30 ? 6 : 5;
    }
    get nodeX(): number {
        return this.c2x(this.$props.graph.node.index);
    }
    get nodeY(): number {
        return this.$props.height / 2;
    }
    get nodeIdx(): number {
        return this.$props.graph.node.index;
    }
    get nodeMaskId() {
        return `mask-node-${ this.$props.graph.id.substring(0, 8) }`;
    }
    get lineMaskId() {
        return `mask-line-${ this.$props.graph.id.substring(0, 8) }`;
    }
    get foregroundEdges(): NodeEdge[] {
        const edges = this.$props.graph.nodeEdges;
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
