// A pretty error msg for easier debuging

/**
 * Returns the index of the next new line (omits current line)
 * @param {String} input
 * @param {Number} errorIndex
 */
function returnNewLineIndex(input, errorIndex) {
  const currentLineOffset = input.indexOf("\n", errorIndex);
  if (currentLineOffset === -1) {
    return currentLineOffset;
  }
  return input.indexOf("\n", currentLineOffset + 1);
}

/**
 * Compares -1 with compare argument. If compare is -1 it means it did not
 * find a new line (before or after the current one) and will return the
 * default value. This is used for splicing the original input to create
 * a pretty error message.
 * @param {Number} compare
 * @param {Number} returnValue
 * @param {Number|Undefined} defaultValue
 */
function returnLineIndex(compare, returnValue, defaultValue) {
  return compare > -1 ? returnValue : defaultValue;
}

export function throwPrettyError(error, input, errorIndex) {
  // find next line for error handling
  const nextLineEnd = returnNewLineIndex(input, errorIndex);
  // find prev line for error handling
  // filter input to the error index and reverse the string
  const reversedInput = input
    .split("")
    .filter((d, i) => i < errorIndex)
    .reverse()
    .join("");
  // find second new line from the start
  const prevLineEnd = returnNewLineIndex(reversedInput, 0);

  // start of the error message
  const sliceStartIndex = returnLineIndex(
    prevLineEnd,
    errorIndex - prevLineEnd,
    0
  );

  // updated error index to the new sliced error message
  // (used for highlighting the correct line)
  const updatedErrorIndex = errorIndex - sliceStartIndex;
  // minimum input for a good error (one line above and one below)
  const slicedInput = input
    .slice(
      sliceStartIndex,
      returnLineIndex(nextLineEnd, nextLineEnd, undefined)
    )
    .split("\n");
  // construct the message with the error line highlight
  const { constructedError: errorContext } = slicedInput.reduce(
    ({ constructedError, stringLength }, input) => {
      stringLength = stringLength + input.length;
      // if current length of string is the same as error index
      // it means that the error was on this line and add highlight
      if (stringLength === updatedErrorIndex - 1 && input) {
        return {
          constructedError: constructedError.concat(`> ${input}`),
          stringLength,
        };
      }
      return {
        constructedError: constructedError.concat(input),
        stringLength,
      };
    },
    { constructedError: [], stringLength: 0 }
  );

  // throw new error
  throw new Error(`${error.message}
Error at line:
${errorContext.join("\n")}
`);
}

module.exports = {
  throwPrettyError,
};
