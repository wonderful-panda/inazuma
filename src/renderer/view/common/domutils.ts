export function queryFocusableElements(root?: HTMLElement): HTMLElement[] {
  const elements = [...(root || document).querySelectorAll("*")];
  return elements.filter(el => {
    if (
      el instanceof HTMLInputElement ||
      el instanceof HTMLButtonElement ||
      el instanceof HTMLTextAreaElement ||
      el instanceof HTMLSelectElement
    ) {
      return !el.disabled;
    }
    if (el instanceof HTMLAnchorElement || el instanceof HTMLAreaElement) {
      return Boolean(el.href);
    }
    if (el instanceof HTMLElement) {
      return el.tabIndex !== undefined && el.tabIndex >= 0;
    }
    return false;
  }) as HTMLElement[];
}
