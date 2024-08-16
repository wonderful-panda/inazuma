export const getOverlayDiv = () => document.getElementById("overlay")!;

export const bringOverlayDivToTop = () => {
  const el = getOverlayDiv();
  el.hidePopover();
  el.showPopover();
};
