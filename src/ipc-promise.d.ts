declare module "ipc-promise" {
    export function on(eventName: string, handler: (...params: any[]) => Promise<any>): void;
    export function send(eventName: string, ...params: any[]): Promise<any>;
}
