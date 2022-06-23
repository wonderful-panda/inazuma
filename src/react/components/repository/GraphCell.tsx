import { NodeEdge, GraphFragment } from "@/grapher";
import { shortHash } from "@/util";
import { memo } from "react";

const c2x = (c: number, gridWidth: number) => c * gridWidth + gridWidth / 2;

type NodeLineProps = {
  graph: GraphFragment;
  edge: NodeEdge;
  width: number;
  height: number;
  mask?: string;
  stroke: string;
  strokeWidth?: number;
};
const NodeLine: React.FC<NodeLineProps> = (props) => {
  const { graph, edge, width, height, mask, stroke, strokeWidth } = props;
  if (edge.index === graph.node.index) {
    return (
      <line
        x1={c2x(edge.index, width)}
        y1={edge.type === "C" ? 0 : height}
        x2={c2x(edge.index, width)}
        y2={height / 2}
        mask={mask}
        stroke={stroke || edge.color}
        strokeWidth={strokeWidth}
      />
    );
  } else {
    const x1 = c2x(edge.index, width);
    const x2 = c2x(graph.node.index, width);
    const y1 = edge.type === "P" ? height : 0;
    const y2 = height / 2;
    const rx = width;
    const ry = height / 2;
    let sweep: number;
    if (edge.type === "P") {
      sweep = x1 < x2 ? 1 : 0;
    } else {
      sweep = x1 < x2 ? 0 : 1;
    }
    const ex = x1 < x2 ? rx : -1 * rx;
    const ey = y1 < y2 ? ry : -1 * ry;
    const d = `M ${x1},${y1} a ${rx},${ry} 0 0,${sweep} ${ex},${ey} H ${x2}`;
    return <path d={d} mask={mask} stroke={stroke} strokeWidth={strokeWidth} fill="none" />;
  }
};

type Props = {
  graph: GraphFragment;
  height: number;
  head: boolean;
  maskIdPrefix: string;
};

const GRID_WIDTH = 20;
const WORK_COLOR = "#555";

const actualColor = (id: string, color: string) => {
  return id === "--" ? WORK_COLOR : color;
};

const GraphCell_: React.FC<Props> = ({ graph, height, head, maskIdPrefix }) => {
  const node = graph.node;
  const width = GRID_WIDTH * graph.width;
  let radius: number;
  if (graph.id === "--") {
    radius = 4;
  } else if (head) {
    radius = 10;
  } else {
    radius = 6;
  }
  let nodeMaskRadius = radius + 3;
  if (height < 36) {
    radius -= 1;
    nodeMaskRadius -= 2;
  }
  const nodeX = c2x(node.index, GRID_WIDTH);
  const nodeY = height / 2;
  const shortId = shortHash(graph.id);
  const nodeMask = `${maskIdPrefix}:m:node:${shortId}`;
  const edgeMask = `${maskIdPrefix}:m:edge:${shortId}`;
  const topMostEdges = graph.nodeEdges.filter(
    (edge, i, arr) => (i === 0 || i === arr.length - 1) && edge.index !== node.index
  );
  const nodeColor = actualColor(graph.id, graph.node.color);
  return (
    <svg width={width} height={height}>
      <defs>
        <mask key="0" id={nodeMask} maskUnits="userSpaceOnUse">
          <rect width="100%" height="100%" fill="white" />
          <circle cx={nodeX} cy={nodeY} r={nodeMaskRadius} fill="black" />
        </mask>
        <mask key="1" id={edgeMask} maskUnits="userSpaceOnUse">
          <rect width="100%" height="100%" fill="white" />
          {topMostEdges.map((edge, i) => (
            <NodeLine
              key={i}
              graph={graph}
              edge={edge}
              width={GRID_WIDTH}
              height={height}
              stroke="black"
              strokeWidth={6}
            />
          ))}
        </mask>
      </defs>
      <g strokeWidth={2} mask={`url(#${nodeMask})`}>
        {graph.interEdges.map((edge, i) => (
          <line
            key={`InterEdge:${i}`}
            x1={c2x(edge.index, GRID_WIDTH)}
            y1="0"
            x2={c2x(edge.index, GRID_WIDTH)}
            y2={height}
            stroke={actualColor(edge.childId, edge.color)}
            mask={`url(#${edgeMask})`}
          />
        ))}
        {graph.nodeEdges.map((edge, i, arr) => (
          <NodeLine
            key={`NodeEdge:${i}`}
            graph={graph}
            edge={edge}
            width={GRID_WIDTH}
            height={height}
            stroke={actualColor(edge.childId, edge.color)}
            mask={i === 0 || i === arr.length - 1 ? undefined : `url(#${edgeMask})`}
          />
        ))}
      </g>
      {head ? (
        <>
          <circle
            cx={nodeX}
            cy={nodeY}
            r={radius - 1}
            strokeWidth={2}
            stroke={nodeColor}
            fillOpacity={0}
          />
          <circle cx={nodeX} cy={nodeY} r={radius - 5} fill={nodeColor} />
        </>
      ) : (
        <circle cx={nodeX} cy={nodeY} r={radius} fill={nodeColor} />
      )}
    </svg>
  );
};

export const GraphCell = memo(GraphCell_);
