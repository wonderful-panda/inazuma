import { VNode } from "vue";
import { NodeEdge, InterEdge, GraphFragment } from "core/grapher";
import * as tsx from "vue-tsx-support";
import p from "vue-strict-prop";

// @vue/component
export default tsx.component({
  name: "LogTableCellGraph",
  props: {
    graph: p.ofObject<GraphFragment>().required,
    gridWidth: p(Number).required,
    height: p(Number).required
  },
  computed: {
    width(): number {
      return this.graph.width * this.gridWidth;
    },
    radius(): number {
      return this.height >= 30 ? 6 : 5;
    },
    nodeX(): number {
      return this.c2x(this.graph.node.index);
    },
    nodeY(): number {
      return this.height / 2;
    },
    nodeIdx(): number {
      return this.graph.node.index;
    },
    nodeMaskId(): string {
      return `mask-node-${this.graph.id.substring(0, 8)}`;
    },
    lineMaskId(): string {
      return `mask-line-${this.graph.id.substring(0, 8)}`;
    },
    foregroundEdges(): NodeEdge[] {
      const edges = this.graph.nodeEdges;
      const ret: NodeEdge[] = [];
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
  },
  methods: {
    c2x(c: number): number {
      return c * this.gridWidth + this.gridWidth / 2;
    },
    nodeEdgePath(edge: NodeEdge): string {
      const x1 = this.c2x(edge.index);
      const x2 = this.nodeX;
      const y1 = edge.type === "P" ? this.height : 0;
      const y2 = this.height / 2;
      const rx = this.gridWidth;
      const ry = this.height / 2;
      let sweep: number;
      if (edge.type === "P") {
        sweep = x1 < x2 ? 1 : 0;
      } else {
        sweep = x1 < x2 ? 0 : 1;
      }
      const ex = x1 < x2 ? rx : -1 * rx;
      const ey = y1 < y2 ? ry : -1 * ry;
      return `M ${x1},${y1} a ${rx},${ry} 0 0,${sweep} ${ex},${ey} H ${x2}`;
    },
    maskUrl(id: string) {
      return `url(#${id})`;
    },
    nodeEdgeMask(index: number): string {
      if (index === 0 || index === this.graph.nodeEdges.length - 1) {
        return this.maskUrl(this.nodeMaskId);
      } else {
        return this.maskUrl(this.lineMaskId);
      }
    },
    nodeEdgeKey(edge: NodeEdge): string {
      return `${edge.type}:${edge.index}`;
    },
    interEdgeKey(edge: InterEdge): string {
      return `I:${edge.index}`;
    }
  },
  render(): VNode {
    return (
      <svg height={this.height} width={this.width}>
        <defs>
          <mask key="m:node" id={this.nodeMaskId} maskUnits="userSpaceOnUse">
            <rect width="100%" height="100%" fill="white" />
            <circle
              cx={this.nodeX}
              cy={this.nodeY}
              r={this.radius + 1}
              fill="black"
            />
          </mask>
          <mask key="m:line" id={this.lineMaskId} maskUnits="userSpaceOnUse">
            <rect width="100%" height="100%" fill="white" />
            <circle
              cx={this.nodeX}
              cy={this.nodeY}
              r={this.radius + 1}
              fill="black"
            />
            {this.foregroundEdges.map(edge => (
              <path
                key={this.nodeEdgeKey(edge)}
                d={this.nodeEdgePath(edge)}
                stroke="black"
                stroke-width={4}
                fill="none"
              />
            ))}
          </mask>
        </defs>
        {this.graph.interEdges.map(edge => (
          <line
            key={this.interEdgeKey(edge)}
            x1={this.c2x(edge.index)}
            y1="0"
            x2={this.c2x(edge.index)}
            y2={this.height}
            stroke={edge.color}
            stroke-width={2}
            mask={this.maskUrl(this.lineMaskId)}
          />
        ))}
        {this.graph.nodeEdges.map((edge, i) =>
          edge.index === this.nodeIdx ? (
            <line
              key={this.nodeEdgeKey(edge)}
              x1={this.c2x(edge.index)}
              y1={edge.type === "C" ? 0 : this.height}
              x2={this.c2x(edge.index)}
              y2={this.nodeY}
              stroke={edge.color}
              stroke-width={2}
              mask={this.maskUrl(this.nodeMaskId)}
            />
          ) : (
            <path
              key={this.nodeEdgeKey(edge)}
              d={this.nodeEdgePath(edge)}
              stroke={edge.color}
              stroke-width={2}
              fill="none"
              mask={this.nodeEdgeMask(i)}
            />
          )
        )}
        <circle
          cx={this.nodeX}
          cy={this.nodeY}
          r={this.radius}
          fill={this.graph.node.color}
        />
      </svg>
    );
  }
});
