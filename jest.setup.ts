import "@testing-library/jest-dom";

// There's no official way to mock next/navigation.
// We just make it no-op for all tests.
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
}));

if (!globalThis.crypto) {
  Object.defineProperty(globalThis, "crypto", {
    value: {},
    configurable: true,
  });
}

if (!globalThis.crypto.randomUUID) {
  Object.defineProperty(globalThis.crypto, "randomUUID", {
    value: () => "00000000-0000-4000-8000-000000000000",
    configurable: true,
  });
}
