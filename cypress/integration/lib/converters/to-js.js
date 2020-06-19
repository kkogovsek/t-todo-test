let noop = () => "";
function getFnName(originalName) {
  let trimmedName = originalName.trim();
  return trimmedName
    .replace(/\s+(\w)/g, (match) => match.trim().toUpperCase())
    .replace(/\./g, "___");
}

const getMacroName = (name) => getFnName(`__macro__${name}`);
const getChainName = (name) => getFnName(`__chain__${name}`);

let getString = (name) => JSON.stringify(name);
let getSelector = (name) => {
  if (name.startsWith("$")) {
    return getString(`[data-testid="${name.slice(1)}"]`);
  }
  return getString(name);
};
let getElement = (name) => `cy.get(${getSelector(name)})`;
let getUrl = (url) => getString(url);

const chainCall = ([, name, ...params]) =>
  `\n    .${name}(${params.map((p) => getString(p)).join(", ")})`;

const tokens = {
  "nothing.space": noop,
  "nothing.eol": noop,
  module: ({ params: [name], children }) => {
    return transformToJs(children, `${name}.`);
  },
  suite: (node) => {
    const {
      children,
      params: [, name],
    } = node;
    return `describe('${name}', () => {\n${transformToJs(children)}\n});\n`;
  },
  macro: (node, prefix) => {
    const {
      children,
      params: [name],
    } = node;
    return `function ${getMacroName(`${prefix}${name}`)} () {\n${transformToJs(
      children,
      prefix
    )}\n}\n`;
  },
  chain: (node, prefix) => {
    const {
      children,
      params: [, name],
    } = node;
    return `function ${getChainName(
      `${prefix}${name}`
    )} (element) {\n  cy.get(element)${transformToJs(children, prefix)};\n}\n`;
  },
  test: (node) => {
    const {
      children,
      params: [, name],
    } = node;
    return `it('${name}', () => {\n  window.srvr = false;\n${transformToJs(
      children
    )}});\n`;
  },
  bridge: ({ params: [, name] }) => `${name}();\n`,
  eof: (node) => "\n", // Always have a blank line at the end of file :D
  "step.bind": ([, , el, , alias]) =>
    `  cy.get(${getSelector(el)}).as(${getString(alias)});\n`,
  "step.reload": () => "  cy.reload();\n",
  "step.visit": ([, , url]) => `  cy.visit(${getString(url)});\n`,
  "step.click": ([, , el]) => `  ${getElement(el)}.click();\n`,
  "step.force_click": ([, , , el]) =>
    `  ${getElement(el)}.click({ force: true });\n`,
  "step.contains": ([, el, , content]) =>
    `  ${getElement(el)}.contains(${getString(content)});\n`,
  "step.input": ([, , what, , where]) =>
    `  ${getElement(where)}.type(${getString(what)}, { delay: 75 });\n`,
  "step.exists": ([, , el]) => `  ${getElement(el)}.should('exist');\n`,
  "step.capture_request": ([, , , url, method]) =>
    `  if (!window.srvr) { window.srvr = true; cy.server(); }\n  cy.route(${getString(
      method
    )}, ${getUrl(url)}).as(${getString(url)});\n`,
  "step.wait": ([, , , what]) => `  cy.wait(${getString(what)});\n`,
  "step.check_url": ([, , , url]) =>
    `  cy.url().should('include', ${getUrl(url)});\n`,
  "step.run_macro": ([, , name], prefix) =>
    `  ${getMacroName(prefix + name)}();\n`,
  "step.run_chain": ([, , name, , el], prefix) =>
    `  ${getChainName(prefix + name)}(${getSelector(el)});\n`,
  "step.run_bridged": ([, , name]) => `  bridge.${name}();\n`,
  "step.comment": ([, , comment]) => `  // ${comment}\n`,
  "chain.call-0": chainCall,
  "chain.call-1": chainCall,
  "chain.call-2": chainCall,
  "chain.call-3": chainCall,
  "chain.call-4": chainCall,
  comment: ([, comment]) => `// ${comment}\n`,
  error: ({ params: [, error] }) => `// error: ${error}\n`,
};

export default function transformToJs(ast, prefix = "") {
  return ast
    .map((node) =>
      tokens[node.token](node.children ? node : node.params, prefix)
    )
    .join("");
}
