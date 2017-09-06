import { Vtable, VtableProps, VtableEvents } from "vue-vtable";

interface VtableEventsOn<T> {
    onRowclick: VtableEvents<T>["rowclick"];
    onRowdblclick: VtableEvents<T>["rowdblclick"];
    onRowdragstart: VtableEvents<T>["rowdragstart"];
    onRowdragend: VtableEvents<T>["rowdragend"];
    onRowdragenter: VtableEvents<T>["rowdragenter"];
    onRowdragleave: VtableEvents<T>["rowdragleave"];
    onRowdragover: VtableEvents<T>["rowdragover"];
    onRowdrop: VtableEvents<T>["rowdrop"];
}

export function of<T>() {
    return $tsx.ofType<VtableProps<T>, VtableEventsOn<T>>().convert(Vtable);
}
