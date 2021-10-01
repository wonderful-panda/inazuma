interface Window extends RendererGlobals {}

type ComponentRef<C> = C extends React.ForwardRefExoticComponent<infer P>
  ? P extends React.RefAttributes<infer T>
    ? T
    : never
  : never;

type Orientation = "landscape" | "portrait";
type Direction = "horiz" | "vert";
