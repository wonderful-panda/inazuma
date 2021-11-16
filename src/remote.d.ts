import "./commonTypes";
import type { Handler } from "./browser/handlers";

declare global {
  type RemoteMethodHandlers = typeof import("./browser/handlers");
  type DispatchParams<H extends Handler<any, any>> = H extends Handler<infer A, any> ? A : never;
  type DispatchResult<H extends Handler<any, any>> = H extends Handler<any, infer R> ? R : never;

  type BrowserMethodDispatch = <K extends keyof RemoteMethodHandlers>(
    methodName: K,
    ...args: DispatchParams<RemoteMethodHandlers[K]>
  ) => Promise<DispatchResult<RemoteMethodHandlers[K]>>;

  interface RendererGlobals {
    dispatchBrowser: BrowserMethodDispatch;
    browserEvents: {
      listen: <K extends keyof BrowserEvent>(
        type: K,
        listener: (payload: BrowserEvent[K]) => void
      ) => void;
    };
    pty: {
      open: (
        options: OpenPtyOptions,
        listeners: PtyListeners
      ) => Promise<{
        [K in keyof PtyCommands]: (payload: PtyCommands[K]) => Promise<void>;
      }>;
    };
  }
}
