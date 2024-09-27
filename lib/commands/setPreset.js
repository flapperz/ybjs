const { execSync } = require("node:child_process");

const validateSetup = (presetConfig) => {
  const displaysQuery = JSON.parse(execSync("yabai -m query --displays"));
  // console.log(displaysQuery);

  const displayErrorMessageList = presetConfig.map(
    ({ display_index: displayIndex, spaces }) => {
      if (
        displayIndex != null &&
        displaysQuery.map((v) => v.index).includes(displayIndex)
      ) {
        const maxSpaceNumber = displaysQuery.filter(
          (v) => v.index === displayIndex
        )[0].spaces.length;
        const invalidSpace = spaces
          .filter((v) => v.space_index > maxSpaceNumber)
          .map((v) => v.space_index);
        if (invalidSpace.length) return `space ${invalidSpace} is out of bound`;
        else "";
      } else {
        return `No Display ${displayIndex}`;
      }
    }
  );

  const errorMessage = displayErrorMessageList.join("\n");
  return {
    isSetupValid: errorMessage.length === 0,
    errorMessage,
  };
};

const populateDisplay = (presetConfig) => {
  const windowsQuery = JSON.parse(execSync("yabai -m query --windows"));
  const displaysQuery = JSON.parse(execSync("yabai -m query --displays"));

  presetConfig.forEach(({ display_index: displayIndex, spaces }) => {
    const minSpaceIndex = displaysQuery.filter(
      (v) => v.index === displayIndex
    )[0].spaces[0];
    console.log("minspace", minSpaceIndex);
    spaces.forEach(({ space_index: spaceIndex, window_apps: windowApps }) => {
      windowApps.forEach((app) => {
        const windowID = windowsQuery.filter((e) => e.app === app)[0].id;
        const targetSpace = minSpaceIndex + spaceIndex - 1;
        console.log(`yabai -m window ${windowID} --space ${targetSpace}`);
        execSync(`yabai -m window ${windowID} --space ${targetSpace}`);
      });
    });
  });
};

const setPreset = (presetConfig) => {
  const { isSetupValid, errorMessage } = validateSetup(presetConfig);
  console.log(isSetupValid);
  if (!isSetupValid) {
    console.error(errorMessage);
    return;
  }

  populateDisplay(presetConfig);
};
module.exports = setPreset;
