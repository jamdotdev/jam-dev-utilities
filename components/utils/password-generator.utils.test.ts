import { PasswordBuilder } from "./password-generator.utils";

describe("PasswordBuilder", () => {
  it("generates a character pool correctly according to options", () => {
    const builder = new PasswordBuilder(true, false, false, false, 8);
    const result = builder.Build();

    expect(result).toMatch(/^[a-z]+$/);
    expect(result.length).toBe(8);
  });

  it("includes at least one character from each selected category", () => {
    const builder = new PasswordBuilder(true, true, true, true, 20);
    const password = builder.Build();

    expect(password).toMatch(/[a-z]/); // lowercase
    expect(password).toMatch(/[A-Z]/); // uppercase
    expect(password).toMatch(/[0-9]/); // numbers
    expect(password).toMatch(/[!@#$%^&*()_+[\]{}|;:,.<>?/~`\-=]/); // symbols
    expect(password.length).toBe(20);
  });

  it("respects the minimum and maximum length constraints", () => {
    const builderMin = new PasswordBuilder(true, false, false, false, 0);
    expect(builderMin.Build().length).toBeGreaterThanOrEqual(1);

    const builderMax = new PasswordBuilder(true, false, false, false, 999);
    expect(builderMax.Build().length).toBeLessThanOrEqual(128);
  });

  it("handles when desired length is smaller than the number of categories", () => {
    // 4 categories but desired length 2
    const builder = new PasswordBuilder(true, true, true, true, 2);
    const password = builder.Build();

    // Must include at least one char from each category
    expect(password).toMatch(/[a-z]/);
    expect(password).toMatch(/[A-Z]/);
    expect(password).toMatch(/[0-9]/);
    expect(password).toMatch(/[!@#$%^&*()_+[\]{}|;:,.<>?/~`\-=]/);
    // And length must be at least 4
    expect(password.length).toBeGreaterThanOrEqual(4);
  });

  it("GetMandatoryChars returns characters from the correct categories", () => {
    const builder = new PasswordBuilder(true, true, false, false, 10);
    const picks = builder.GetMandatoryChars();
    expect(picks.some((c) => /[a-z]/.test(c))).toBeTruthy();
    expect(picks.some((c) => /[A-Z]/.test(c))).toBeTruthy();
    expect(picks.length).toBe(2); // two categories selected
  });
});
