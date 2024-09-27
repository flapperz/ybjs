const { execSync } = require("node:child_process");

// Helper function
const getDumpDisplayList = (presetConfig) =>
  presetConfig
    .map(({ display_index, spaces }) => ({
      display_index,
      spaces: spaces.filter(({ is_dump }) => is_dump === true),
    }))
    .filter(({ spaces }) => spaces.length > 0);

const getMaximumSpaceIndex = (displaysQuery, displayIndex) =>
  displaysQuery.filter((v) => v.index === displayIndex)[0].spaces.length;

const getMinimumSpaceIndex = (displaysQuery, displayIndex) =>
  displaysQuery.filter((v) => v.index === displayIndex)[0].spaces[0];

const validateSetup = (presetConfig) => {
  const displaysQuery = JSON.parse(execSync("yabai -m query --displays"));

  const displayErrorMessageList = presetConfig.map(
    ({ display_index: displayIndex, spaces }) => {
      if (
        displayIndex != null &&
        displaysQuery.map((v) => v.index).includes(displayIndex)
      ) {
        const maxSpaceNumber = getMaximumSpaceIndex(
          displaysQuery,
          displayIndex
        );
        const invalidSpace = spaces
          .filter((v) => v.space_index > maxSpaceNumber)
          .map((v) => v.space_index);

        if (invalidSpace.length) {
          return `space ${invalidSpace} is out of bound`;
        } else {
          return "";
        }
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

  const movedWindowID = new Set();
  // populate each space
  presetConfig.forEach(({ display_index: displayIndex, spaces }) => {
    const minSpaceIndex = getMinimumSpaceIndex(displaysQuery, displayIndex);
    spaces.forEach(({ space_index: spaceIndex, window_apps: windowApps }) => {
      // guard for dump space which have no window_apps field
      if (windowApps == null) return;

      windowApps.forEach((app) => {
        const windowID = windowsQuery.filter((e) => e.app === app)[0].id;
        const targetSpace = minSpaceIndex + spaceIndex - 1;

        execSync(`yabai -m window ${windowID} --space ${targetSpace}`);

        movedWindowID.add(windowID);
      });
    });
  });

  // send the rest to dump space
  const dumpDisplayList = getDumpDisplayList(presetConfig);

  const {
    display_index: dumpDisplayIndex,
    spaces: [{ space_index: dumpSpaceIndex }, ...rest],
  } = dumpDisplayList[0];

  if (dumpDisplayIndex != null && dumpSpaceIndex != null) {
    const minDumpSpaceIndex = getMinimumSpaceIndex(
      displaysQuery,
      dumpDisplayIndex
    );
    const absoluteDumpSpaceIndex = minDumpSpaceIndex + dumpSpaceIndex - 1;

    windowsQuery
      .filter(({ id }) => !movedWindowID.has(id))
      .forEach(({ id }) => {
        execSync(`yabai -m window ${id} --space ${absoluteDumpSpaceIndex}`);
      });
  }
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
