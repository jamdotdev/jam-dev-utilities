export function pxToRem(px: number, base: number = 16): number {
  return px / base;
}

export function remToPx(rem: number, base: number = 16): number {
  return rem * base;
}

export function pxToEm(px: number, base: number = 16): number {
  return px / base;
}

export function emToPx(em: number, base: number = 16): number {
  return em * base;
}

export function pxToVw(px: number, viewportWidth: number): number {
  return (px / viewportWidth) * 100;
}

export function vwToPx(vw: number, viewportWidth: number): number {
  return (vw / 100) * viewportWidth;
}

export function pxToVh(px: number, viewportHeight: number): number {
  return (px / viewportHeight) * 100;
}

export function vhToPx(vh: number, viewportHeight: number): number {
  return (vh / 100) * viewportHeight;
}

export function pxToVmin(
  px: number,
  viewportWidth: number,
  viewportHeight: number
): number {
  const vmin = Math.min(viewportWidth, viewportHeight);
  return (px / vmin) * 100;
}

export function vminToPx(
  vmin: number,
  viewportWidth: number,
  viewportHeight: number
): number {
  const min = Math.min(viewportWidth, viewportHeight);
  return (vmin / 100) * min;
}

export function pxToVmax(
  px: number,
  viewportWidth: number,
  viewportHeight: number
): number {
  const vmax = Math.max(viewportWidth, viewportHeight);
  return (px / vmax) * 100;
}

export function vmaxToPx(
  vmax: number,
  viewportWidth: number,
  viewportHeight: number
): number {
  const max = Math.max(viewportWidth, viewportHeight);
  return (vmax / 100) * max;
}
