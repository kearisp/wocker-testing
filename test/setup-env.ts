import {beforeEach, afterEach, expect} from "@jest/globals";


beforeEach((): void => {
    const {Logger} = require("@kearisp/cli");

    Logger.mute();
});

afterEach((): void => {
    const {Logger} = require("@kearisp/cli");

    const {
        currentTestName = "Unknown",
        testPath = "/"
    } = expect.getState();

    const fileName = testPath.split("/").pop() || "",
        message = `${fileName}: ${currentTestName}`;

    Logger.debug("┌" + "─".repeat(message.length + 2) + "┐");
    Logger.debug(`│ ${message} │`);
    Logger.debug("└" + "─".repeat(message.length + 2) + "┘");
    Logger.mute();
});
