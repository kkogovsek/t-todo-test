const join = (els) =>
  els.flatMap((el, i) => [el, i === els.length - 1 ? "\n" : " "]).join("");

export default function convertToT(tree, level = 0) {
  let tCode = tree
    .map(({ children, params }) => {
      if (children) {
        return `${"  ".repeat(level)}${join(params)}${convertToT(
          children,
          level + 1
        )}`;
      } else {
        return `${"  ".repeat(level)}${join(params)}`;
      }
    })
    .join("");
  if (level === 0) {
    console.log(tree.bridges);
    for (let [name, code] of tree.bridges || []) {
      let bridge = `bridge ${name}`;
      let replaceIndex = tCode.indexOf(bridge);
      tCode = `${tCode.slice(
        0,
        replaceIndex
      )}${`\${({${code.toString()}})();`}${tCode.slice(
        replaceIndex + bridge.length
      )}`;
    }
  }
  return tCode;
}
