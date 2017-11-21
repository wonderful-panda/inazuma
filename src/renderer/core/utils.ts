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

export function ensureNotUndefined<T>(value: T | undefined): T {
    if (value === undefined) {
        throw "value is undefined";
    }
    return value;
}

