import { VtableColumn } from "vue-vtable";
import { LogItem } from "../mainTypes";
import { GraphCell, GraphCellProps } from "../components/graphCell";
import { formatDate } from "core/utils";

export const detail: VtableColumn<LogItem>[] = [
    {
        title: "graph",
        className: "cell-graph",
        defaultWidth: 120,
        minWidth: 40,
        render: (h, item, index, ctx) => {
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
        render: (h, item, index, ctx) => item.commit.id.substring(0, 8)
    },
    {
        title: "author",
        className: "cell-author",
        defaultWidth: 120,
        minWidth: 40,
        render: (h, item, index, ctx) => item.commit.author
    },
    {
        title: "date",
        className: "cell-date",
        defaultWidth: 100,
        minWidth: 40,
        render: (h, item, index, ctx) => formatDate(new Date(item.commit.date))
    },
    {
        title: "comment",
        className: "cell-comment",
        defaultWidth: 600,
        minWidth: 200,
        render: (h, item, index, ctx) => item.commit.summary
    }
];


