import {
  pxToRem,
  remToPx,
  pxToVw,
  vwToPx,
  pxToVh,
  vhToPx,
  pxToVmin,
  vminToPx,
  pxToVmax,
  vmaxToPx,
} from "./css-units-converter.utils";

describe("css-units-converter.utils", () => {
  test("pxToRem should convert px to rem correctly", () => {
    expect(pxToRem(16)).toBe(1);
    expect(pxToRem(32)).toBe(2);
    expect(pxToRem(32, 16)).toBe(2);
    expect(pxToRem(16, 8)).toBe(2);
  });

  test("remToPx should convert rem to px correctly", () => {
    expect(remToPx(1)).toBe(16);
    expect(remToPx(2)).toBe(32);
    expect(remToPx(2, 16)).toBe(32);
    expect(remToPx(2, 8)).toBe(16);
  });
  test("pxToVw should convert px to vw correctly", () => {
    expect(pxToVw(100, 1920)).toBeCloseTo(5.21, 2);
    expect(pxToVw(960, 1920)).toBeCloseTo(50, 2);
  });

  test("vwToPx should convert vw to px correctly", () => {
    expect(vwToPx(5.21, 1920)).toBeCloseTo(100.032, 2);
    expect(vwToPx(50, 1920)).toBeCloseTo(960, 2);
  });

  test("pxToVh should convert px to vh correctly", () => {
    expect(pxToVh(100, 1080)).toBeCloseTo(9.26, 2);
    expect(pxToVh(540, 1080)).toBeCloseTo(50, 2);
  });

  test("vhToPx should convert vh to px correctly", () => {
    expect(vhToPx(9.26, 1080)).toBeCloseTo(100, 1);
    expect(vhToPx(50, 1080)).toBeCloseTo(540, 1);
  });

  test("pxToVmin should convert px to vmin correctly", () => {
    expect(pxToVmin(100, 1920, 1080)).toBeCloseTo(9.26, 2);
    expect(pxToVmin(540, 1920, 1080)).toBeCloseTo(50, 2);
  });

  test("vminToPx should convert vmin to px correctly", () => {
    expect(vminToPx(5.21, 1920, 1080)).toBeCloseTo(56.27, 2);
    expect(vminToPx(28.12, 1920, 1080)).toBeCloseTo(303.7, 2);
  });

  test("pxToVmax should convert px to vmax correctly", () => {
    expect(pxToVmax(100, 1920, 1080)).toBeCloseTo(5.21, 2);
    expect(pxToVmax(960, 1920, 1080)).toBeCloseTo(50, 2);
  });

  test("vmaxToPx should convert vmax to px correctly", () => {
    expect(vmaxToPx(5.21, 1920, 1080)).toBeCloseTo(100, 1);
    expect(vmaxToPx(50, 1920, 1080)).toBeCloseTo(960, 1);
  });
});
