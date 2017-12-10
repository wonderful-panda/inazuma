import { VtableColumn } from "vue-vtable";

export const detail: VtableColumn[] = [
    {
        title: "graph",
        className: "cell-graph",
        defaultWidth: 120,
        minWidth: 40
    },
    {
        title: "id",
        className: "cell-id",
        defaultWidth: 80,
        minWidth: 40
    },
    {
        title: "author",
        className: "cell-author",
        defaultWidth: 120,
        minWidth: 40
    },
    {
        title: "date",
        className: "cell-date",
        defaultWidth: 100,
        minWidth: 40
    },
    {
        title: "comment",
        className: "cell-comment",
        defaultWidth: 600,
        minWidth: 200
    }
];


