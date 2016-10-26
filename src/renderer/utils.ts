export function formatDate(value: Date): string {
    return `${value.getFullYear()}/${value.getMonth() + 1}/${value.getDate()}`;
}
