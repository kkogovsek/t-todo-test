import syntax from "./syntx";

let extractString = (string) => {
  let re = /("|')(.*)(\1)/g;
  let match = re.exec(string);
  if (!match) {
    return string;
  }
  let [, , text] = match;
  return text;
};

export default function tokenize(code) {
  const lines = code.split("\n");
  let parsed = [];
  for (let line of lines) {
    line = line.trim();
    let match;
    let matchedToken;
    for (let [token, re] of syntax) {
      match = new RegExp(`^${re}$`).exec(line);
      if (match) {
        code = code.substr(match[0].length + 1);
        matchedToken = token;
        break;
      }
    }
    if (!match) {
      parsed.push(["error", "error in", `'${line}'`]);
      parsed.push(["error", "you", `can fix it in T - Editor`]);
    } else if (match[0]) {
      let params = match
        .slice(1)
        .filter((_, i) => i % 2 === 0)
        .map(extractString);
      parsed.push([matchedToken, ...params]);
    }
  }

  return parsed.filter(([token]) => token !== "nothing").concat([["eof"]]);
}
