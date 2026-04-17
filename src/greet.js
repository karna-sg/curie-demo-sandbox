import { isValidName, normalizeName } from "./validators.js";

export function greet(name) {
  if (!isValidName(name)) {
    throw new TypeError("greet: invalid name");
  }
  return `Hello, ${normalizeName(name)}!`;
}
