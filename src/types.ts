export interface DagNode {
    id: string;
    parentIds: string[];
}

export interface Commit extends DagNode {
    summary: string;
    date: Date;
    author: string;
}
