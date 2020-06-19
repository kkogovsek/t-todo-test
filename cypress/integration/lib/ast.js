const PACK_STATES = {
  suite: { block: true, root: true },
  macro: { block: true },
  chain: { block: true },
  test: { block: true },
  bridge: {},
  empty: {},
  error: {},
};

export default function buildAst(code = [], modules = {}) {
  let blocks = [];
  for (let [name, m] of Object.entries(modules)) {
    blocks.push({
      token: "module",
      params: [name],
      children: buildAst(m.tokens),
    });
  }
  let lineIndex = 0;
  let currentBlock = null;
  while (lineIndex < code.length) {
    let [token, ...params] = code[lineIndex];
    if (!PACK_STATES[token]) {
      throw new Error(`This belongs in a block and not top level:
input: ${code[lineIndex].join(" ")}
      `);
    }
    if (currentBlock) {
      blocks.push(currentBlock);
    }
    currentBlock = {
      token,
      params,
      children: [],
    };
    lineIndex++;
    while (lineIndex < code.length) {
      let [token, ...params] = code[lineIndex];
      if (PACK_STATES[token]) break;
      currentBlock.children.push({ token, params });
      lineIndex++;
    }
  }
  if (currentBlock) {
    blocks.push(currentBlock);
  }
  // And now a run witin roots
  let rootBlocks = [];
  let rootBlock = null;
  let blockIndex = 0;
  while (blockIndex < blocks.length) {
    if (
      PACK_STATES[blocks[blockIndex].token] &&
      PACK_STATES[blocks[blockIndex].token].root
    ) {
      if (rootBlock) {
        rootBlocks.push(rootBlock);
        rootBlock = null;
      }
      rootBlock = blocks[blockIndex++];
    } else if (rootBlock) {
      rootBlock.children.push(blocks[blockIndex++]);
    } else {
      rootBlocks.push(blocks[blockIndex++]);
    }
  }
  if (rootBlock) {
    rootBlocks.push(rootBlock);
  }
  return rootBlocks;
}
