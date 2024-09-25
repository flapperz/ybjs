const util = require("node:util");

const argsConfig = {
  options: {},
  allowPositionals: true,
};

const { values, positionals } = util.parseArgs(argsConfig);
console.log("Parsed argument:", values, positionals);
