import path from "path";
import fs from "fs";

export const fixturePath = (relativePath: string) =>
  path.resolve(__dirname, "..", "fixtures", relativePath);

export const readFixture = (relativePath: string) =>
  fs.readFileSync(fixturePath(relativePath), "utf8");
