import parser from "./parser";

const zip = (l1, l2) =>
  l1.reduce(
    (acc, item, idx) =>
      acc.concat(idx === l1.length - 1 ? [item] : [item, l2[idx]]),
    []
  );

const getBridgedName = (i) => `__internal__bridged_${i}`;

function zipParameters({
  bridgedFunctions,
  modules,
  source: [strings, ...params],
  namePrefix = "",
}) {
  const bridgeFunction = (fn) => {
    const id = getBridgedName(bridgedFunctions.length);
    bridgedFunctions.push([id, fn]);
    return `bridge ${id}\n`;
  };

  const secureParams = params.map((param) => {
    // Function -> bridge function execution
    if (typeof param === "function") {
      return bridgeFunction(param);
      // Object -> module
    } else if (typeof param === "object") {
      return Object.entries(param)
        .map(([name, templateStringSource]) => {
          // Pack module with recursive lexer call with a namespace
          let prefix = `${namePrefix}${name}.`;
          const modul = parseTemplate({
            namePrefix: prefix,
            bridgedFunctions,
            modules,
          })(...templateStringSource);
          modules[`${namePrefix}${name}`] = modul;
          return "";
        })
        .join("\n");
    } else {
      return String(param);
    }
  });
  return zip(strings, secureParams).join("");
}

export default function parseTemplate({
  namePrefix = "", // modules, aliases, ...are going to be prefixed for modules.
  bridgedFunctions = [], // we will mutate this with .push, to share a single space for all the functions
  modules = {}, // this is a map of resolved modules
} = {}) {
  return (strings, ...params) => {
    const sourceTCode = zipParameters({
      bridgedFunctions,
      modules,
      source: [strings, ...params],
      namePrefix,
    });
    const tokens = parser(sourceTCode);

    return {
      sourceTemplate: [strings, ...params],
      bridgedFunctions,
      source: sourceTCode,
      tokens,
      modules,
    };
  };
}
