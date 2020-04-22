import { NodeEdge, GraphFragment } from "core/grapher";
import { shortHash } from "view/filters";

const c2x = (c: number, gridWidth: number) => c * gridWidth + gridWidth / 2;

type NodeLineProps = {
  graph: GraphFragment;
  edge: NodeEdge;
  width: number;
  height: number;
  mask?: string;
  stroke?: string;
  strokeWidth?: number;
};
const NodeLine = _fc<NodeLineProps>(({ props }) => {
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
        stroke-width={strokeWidth}
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
    return (
      <path
        d={d}
        mask={mask}
        stroke={stroke || edge.color}
        stroke-width={strokeWidth}
        fill="none"
      />
    );
  }
});

type Props = {
  graph: GraphFragment;
  gridWidth: number;
  height: number;
};
export default _fc<Props>(({ props }) => {
  const { graph, gridWidth, height } = props;
  const node = graph.node;
  const width = gridWidth * graph.width;
  const radius = height >= 30 ? 6 : 5;
  const nodeX = c2x(node.index, gridWidth);
  const nodeY = height / 2;
  const shortId = shortHash(graph.id);
  const nodeMask = `m:node:${shortId}`;
  const edgeMask = `m:edge:${shortId}`;
  const topMostEdges = graph.nodeEdges.filter(
    (edge, i, arr) =>
      (i === 0 || i === arr.length - 1) && edge.index !== node.index
  );
  return (
    <svg width={width} height={height}>
      <defs>
        <mask key="0" id={nodeMask} maskUnits="userSpaceOnUse">
          <rect width="100%" height="100%" fill="white" />
          <circle cx={nodeX} cy={nodeY} r={radius + 1} fill="black" />
        </mask>
        <mask key="1" id={edgeMask} maskUnits="userSpaceOnUse">
          <rect width="100%" height="100%" fill="white" />
          {topMostEdges.map((edge, i) => (
            <NodeLine
              key={i}
              graph={graph}
              edge={edge}
              width={gridWidth}
              height={height}
              stroke="black"
              stroke-width={6}
            />
          ))}
        </mask>
      </defs>
      <g stroke-width={2} mask={`url(#${nodeMask})`}>
        {graph.interEdges.map((edge, i) => (
          <line
            key={`InterEdge:${i}`}
            x1={c2x(edge.index, gridWidth)}
            y1="0"
            x2={c2x(edge.index, gridWidth)}
            y2={height}
            stroke={edge.color}
            mask={`url(#${edgeMask})`}
          />
        ))}
        {graph.nodeEdges.map((edge, i, arr) => (
          <NodeLine
            key={`NodeEdge:${i}`}
            graph={graph}
            edge={edge}
            width={gridWidth}
            height={height}
            mask={
              i === 0 || i === arr.length - 1 ? undefined : `url(#${edgeMask})`
            }
          />
        ))}
      </g>
      <circle cx={nodeX} cy={nodeY} r={radius} fill={node.color} />
    </svg>
  );
});
