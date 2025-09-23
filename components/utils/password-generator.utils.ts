export const getRandomInt = (max: number) => {
  const arr = new Uint32Array(1);
  window.crypto.getRandomValues(arr);
  return arr[0] % max;
};

export class PasswordBuilder {
  private LOWER = "abcdefghijklmnopqrstuvwxyz";
  private UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  private NUMS = "0123456789";
  private SYMBOLS = "!@#$%^&*()_+[]{}|;:,.<>?/~`-=";
  private characterPool = "";

  constructor(
    private includeLowercase: boolean,
    private includeUppercase: boolean,
    private includeNumbers: boolean,
    private includeSymbols: boolean,
    private desiredLength: number
  ) {
    let pool = "";
    if (this.includeLowercase) pool += this.LOWER;
    if (this.includeUppercase) pool += this.UPPER;
    if (this.includeNumbers) pool += this.NUMS;
    if (this.includeSymbols) pool += this.SYMBOLS;
    this.characterPool = pool;
  }

  GetMandatoryChars() {
    const picks: string[] = [];

    if (this.includeLowercase) {
      const lowers = this.LOWER.split("");
      picks.push(lowers[getRandomInt(lowers.length)]);
    }
    if (this.includeUppercase) {
      const uppers = this.UPPER.split("");
      picks.push(uppers[getRandomInt(uppers.length)]);
    }
    if (this.includeNumbers) {
      const numbers = this.NUMS.split("");
      picks.push(numbers[getRandomInt(numbers.length)]);
    }
    if (this.includeSymbols) {
      const symbols = this.SYMBOLS.split("");
      picks.push(symbols[getRandomInt(symbols.length)]);
    }

    return picks;
  }

  Build() {
    const categoriesAmount = [
      this.includeLowercase,
      this.includeUppercase,
      this.includeNumbers,
      this.includeSymbols,
    ].filter((b) => !!b);

    const finalLen = Math.max(1, Math.min(128, this.desiredLength));
    const useLen =
      finalLen < categoriesAmount.length ? categoriesAmount.length : finalLen;

    // start with selected categories mandatory characters
    const guaranteed = this.GetMandatoryChars();
    const resultChars: string[] = [...guaranteed];

    // fill the rest of the input length
    for (let i = resultChars.length; i < useLen; i++) {
      const idx = getRandomInt(this.characterPool.length);
      resultChars.push(this.characterPool[idx]);
    }

    // Fisher-Yates shuffle algorithm
    for (let i = resultChars.length - 1; i > 0; i--) {
      const j = getRandomInt(i + 1);
      [resultChars[i], resultChars[j]] = [resultChars[j], resultChars[i]];
    }

    return resultChars.join("");
  }
}
