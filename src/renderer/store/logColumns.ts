import { VtableColumn } from "vue-vtable";
import { LogItem } from "../rendererTypes";
import { GraphCell, GraphCellProps } from "../components/graphCell";
import { formatDate } from "../utils";

export const detail: VtableColumn[] = [
    {
        title: "graph",
        className: "cell-graph",
        defaultWidth: 120,
        minWidth: 40,
        render: (h, item: LogItem, index, ctx) => {
            const props: GraphCellProps = {
                graph: item.graph,
                gridWidth: 12,
                height: 24
            };
            return h(GraphCell, { props });
        }
    },
    {
        title: "id",
        className: "cell-id",
        defaultWidth: 80,
        minWidth: 40,
        render: (h, item: LogItem, index, ctx) => item.commit.id.substring(0, 8)
    },
    {
        title: "author",
        className: "cell-author",
        defaultWidth: 120,
        minWidth: 40,
        render: (h, item: LogItem, index, ctx) => item.commit.author
    },
    {
        title: "date",
        className: "cell-date",
        defaultWidth: 100,
        minWidth: 40,
        render: (h, item: LogItem, index, ctx) => formatDate(new Date(item.commit.date))
    },
    {
        title: "comment",
        className: "cell-comment",
        defaultWidth: 600,
        minWidth: 200,
        render: (h, item: LogItem, index, ctx) => item.commit.summary
    }
];


