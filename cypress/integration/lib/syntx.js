// List of regexes that we use
export const re = {
  URL: "[\\w\\-\\._~:/\\?#[\\]\\%@!\\$&'\\(\\)\\*\\+,;=.]+",
  SPACE: "[ \\t]+",
  OPTIONAL_SPACE: "[ \\t]+",
  ANY: ".*",
  STEP_PREFIX: `-`,
  CHAIN_PREFIX: `>`,
  COMMENT_PREFIX: `//`,
  WORD: `".*"|'.*'|[a-zA-Z0-9-_\\.]+`,
  EOL: "\\n",
  EOF: "$",
};

const nothings = [
  ["nothing.space", re.SPACE],
  ["nothing.eol", re.EOL],
];

// prefixes token name with name and string with prefix
const environment = (name, prefix) => (a) =>
  a.map(([n, ...params]) => [`${name}.${n}`, prefix, ...params]);
const stepsEnv = environment("step", "\\-");
const chainsEnv = environment("chain", ">");
// this generates
// ['chain.call']
// ['chain.call', 'chain.call'],
// 5 x (change if you change the number)
const chains = chainsEnv(
  new Array(5)
    .fill(null)
    .map((_, i) => [`call-${i}`, ...new Array(i + 1).fill(re.WORD)])
);

const steps = stepsEnv([
  ["bind", "bind", re.ANY, "to", re.ANY],
  ["reload", "reload"],
  ["visit", "visit", re.URL],
  ["click", "click", re.ANY],
  ["force_click", "force", "click", re.ANY],
  ["contains", re.ANY, "contains", re.ANY],
  ["input", "input", re.ANY, "into", re.ANY],
  ["exists", "does", re.ANY, "exist"],
  ["capture_request", "capture", "request", re.URL, re.ANY],
  ["wait", "wait", "for", re.ANY],
  ["check_url", "is", "page", re.URL],
  ["run_macro", "run", re.ANY],
  ["run_chain", "chain", re.ANY, "on", re.ANY],
  ["run_bridged", "bridge", re.ANY],
  ["comment", "//", re.ANY],
]);

// We can have them writing docs
const comments = [["comment", "//", re.ANY]];

// Structure: [token name, ...parameters] // Spaces get inserted between parameters
let topLevel = [
  ["suite", "suite", re.ANY],
  ["macro", re.ANY, "steps"],
  ["chain", "chain", re.ANY],
  ["test", "it", re.ANY],
  ["bridge", "bridge", re.ANY],
  ["eof", re.EOF],
  ["comment", "//", re.ANY],
];

export const raw_syntax = [
  ...nothings,
  ...topLevel,
  ...steps,
  ...chains,
  ...comments,
];

const buildSyntax = (syntax) =>
  syntax.map(([key, ...params]) => [
    key,
    params
      .map((token, i, params) => {
        let query = `(${token})`;
        if (i < params.length - 1) {
          query += `(${re.SPACE})`;
        }
        return query;
      })
      .join(""),
  ]);

const syntax = buildSyntax(raw_syntax);
export default syntax;
