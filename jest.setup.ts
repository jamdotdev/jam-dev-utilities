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
