import template from "./template";
import buildAst from "./ast";
import toJs from "./converters/to-js";

export function ast(strings, ...params) {
  const { tokens, modules, bridgedFunctions } = template()(strings, ...params);
  const ast = buildAst(tokens, modules);
  ast.modules = modules;
  ast.bridges = bridgedFunctions;
  return ast;
}

export function t(strings, ...params) {
  const { tokens, modules, bridgedFunctions } = template()(strings, ...params);
  const bridge = bridgedFunctions.reduce(
    (bridge, [name, fn], idx) => Object.assign(bridge, { [name]: fn }),
    {}
  );
  const ast = buildAst(tokens, modules);
  const js = toJs(ast);
  it("Logs js output code", () => cy.log(js));
  // eslint-disable-next-line no-new-func
  let runTest = new Function("bridge", js);
  runTest(bridge);
}

export function m(...params) {
  return params;
}
