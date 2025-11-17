/**
 *
 * @param {{[key:string]: any}|(?string|number)[]} input
 * @param {string|RegExp} key
 * @param {Object} [opts = {}]
 * @param {boolean} [opts.caseInsensitive = true] - case insensitive
 * @param {boolean} [opts.trim = true] - trim value
 * @param {boolean} [opts.singleSpace = false] - replace multiple spaces with single space
 * @param {boolean} [opts.wordsOnly = true] - remove all non-word characters
 * @param {boolean} [opts.ignoreSpace = true] - remove all spaces
 * @returns {string|number}
 */
exports.fuzzyKey = (input, key, {
  caseInsensitive = true,
  trim = true,
  singleSpace = false,
  wordsOnly = true,
  ignoreSpace = true,
} = {}) => {
  // match exact first
  if (!(key instanceof RegExp) && input[key] !== undefined) {
    return key;
  }

  const inputs = Array.isArray(input) ? input : Object.keys(input);
  const fn = Array.isArray(input) ? 'findIndex' : 'find';

  const match = inputs[fn]((k) => {
    let ke = String(k ?? '');

    if (caseInsensitive) ke = ke.toLowerCase();
    if (trim) ke = ke.trim();
    if (singleSpace) ke = ke.replace(/ +(?= )/g, '');
    if (wordsOnly) ke = ke.replace(/[^ \w]/g, '');
    if (ignoreSpace) ke = ke.replace(' ', '');

    if (key instanceof RegExp) return key.test(ke);

    return key === ke;
  });

  return match;
};
