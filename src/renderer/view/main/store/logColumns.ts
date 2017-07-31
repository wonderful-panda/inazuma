import * as moment from "moment";
import { VtableColumn } from "vue-vtable";
import { LogItem } from "../mainTypes";
import { GraphCell, GraphCellProps } from "../components/graphCell";
import { SummaryCell, SummaryCellProps } from "../components/summaryCell";

export const detail: VtableColumn<LogItem>[] = [
    {
        title: "graph",
        className: "cell-graph",
        defaultWidth: 120,
        minWidth: 40,
        render: (h, { graph }, index, ctx) => {
            const props: GraphCellProps = {
                graph,
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
        render: (h, { commit }, index, ctx) => commit.id.substring(0, 8)
    },
    {
        title: "author",
        className: "cell-author",
        defaultWidth: 120,
        minWidth: 40,
        render: (h, { commit }, index, ctx) => commit.author
    },
    {
        title: "date",
        className: "cell-date",
        defaultWidth: 100,
        minWidth: 40,
        render: (h, { commit }, index, ctx) => moment(commit.date).local().format("L")
    },
    {
        title: "comment",
        className: "cell-comment",
        defaultWidth: 600,
        minWidth: 200,
        render: (h, { commit, refs }, index, ctx) => {
            const props: SummaryCellProps = { commit, refs };
            return h(SummaryCell, { props });
        }
    }
];


