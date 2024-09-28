import { generateLoremIpsum } from "./lorem-ipsum-generator";

declare type GenerationUnit = "words" | "sentences" | "paragraphs";

describe("generateLoremIpsum", () => {
  let inputAmount: number;
  let generationUnit: GenerationUnit;
  let asHTML: boolean;
  let startWithStandard: boolean;
  let output: string;

  const standardSentence =
    "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua";

  beforeEach(() => {
    // Initialize the variables before each test
    inputAmount = 1;
    generationUnit = "paragraphs";
    asHTML = false;
    startWithStandard = false;
    output = "";
  });

  const generateOutput = () => {
    output = generateLoremIpsum({
      generationUnit,
      inputAmount,
      startWithStandard,
      asHTML,
    });
  };

  test("should generate the correct number of words in a sentence", () => {
    generationUnit = "sentences";
    generateOutput();

    const wordsCount = output.split(" ").length;
    expect(wordsCount).toBeGreaterThanOrEqual(7);
    expect(wordsCount).toBeLessThanOrEqual(14);
  });

  test("should generate the correct number of sentences in a paragraph", () => {
    generateOutput();

    const sentenceCount = output.split(". ").length;
    expect(sentenceCount).toBeGreaterThanOrEqual(3);
    expect(sentenceCount).toBeLessThanOrEqual(6);
  });

  test("should generate text with standard sentence when startWithStandard is true", () => {
    startWithStandard = true;
    generateOutput();
    expect(output.startsWith(standardSentence)).toBe(true);
  });

  test("should generate HTML output when asHTML is true", () => {
    asHTML = true;
    inputAmount = 2;
    generateOutput();

    const paragraphCount = (output.match(/<p>/g) || []).length;
    expect(paragraphCount).toBe(inputAmount);
    expect(output).toContain("<p>");
    expect(output).toContain("</p>");
  });
});
