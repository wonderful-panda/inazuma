export function formatDate(value: Date): string {
    const y = value.getFullYear().toString();
    const m = (value.getMonth() + 1).toString();
    const d = (value.getDate()).toString();
    return `${y}/${("0" + m).slice(-2)}/${("0" + d).slice(-2)}`;
}

export function getFileName(fullpath: string) {
    return fullpath.split("/").pop();
}

export function px(value: number) {
    return `${value}px`;
}

export function clamp(value: number, min: number, max: number) {
    if (value < min) {
        return min;
    }
    else if (max < value) {
        return max;
    }
    else {
        return value;
    }
}
