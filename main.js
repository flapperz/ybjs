const util = require("node:util");
const fs = require("node:fs");

const argsConfig = {
  options: {
    preset: {
      type: "string",
      short: "p",
    },
  },
  allowPositionals: false,
};

const { values, positionals } = util.parseArgs(argsConfig);
console.log("Parsed argument:", values, positionals);

// const config = fs.readFile("~/.config/misc/ybjs.rc");
const configFileName = "./res/ybjs.json";
const config = JSON.parse(fs.readFileSync(configFileName, "utf8"));
console.log("Config:", config);

const { set: setPreset } = values;

console.log(setPreset);
// validate arguments

if ()
