const NAME_PATTERN = /^[\p{L}\s'-]+$/u;
const MAX_NAME_LENGTH = 80;

export function isValidName(name) {
  if (typeof name !== "string") return false;
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > MAX_NAME_LENGTH) return false;
  return NAME_PATTERN.test(trimmed);
}

export function normalizeName(name) {
  if (!isValidName(name)) {
    throw new TypeError("normalizeName: invalid name");
  }
  const collapsed = name.trim().replace(/\s+/g, " ");
  return collapsed
    .split(" ")
    .map((word) => titleCaseWord(word))
    .join(" ");
}

function titleCaseWord(word) {
  return word.replace(/([\p{L}])([\p{L}]*)/gu, (_, first, rest) =>
    first.toLocaleUpperCase() + rest.toLocaleLowerCase()
  );
}
