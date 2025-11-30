import {describe, it, expect, beforeEach} from "@jest/globals";
import {vol} from "memfs";
import {ApplicationContext, ProcessService, WOCKER_DATA_DIR_KEY, FILE_SYSTEM_DRIVER_KEY} from "@wocker/core";
import {Test} from "../makes";
import {MockProcessService} from "./";


describe("MockProcessService", (): void => {
    let context: ApplicationContext;
    const HOME_DIR = "/home/wocker-test";

    beforeEach(async (): Promise<void> => {
        vol.reset();

        context = await Test
            .createTestingModule({})
            .overrideProvider(FILE_SYSTEM_DRIVER_KEY).useValue(vol)
            .overrideProvider(WOCKER_DATA_DIR_KEY).useValue(HOME_DIR)
            .overrideProvider(ProcessService).useProvider(MockProcessService)
            .build();
    });

    it("should return current working directory", (): void => {
        const processService = context.get(ProcessService);

        expect(processService.pwd()).toBe(HOME_DIR);
    });

    it("should change current working directory if directory exists", async (): Promise<void> => {
        const processService = context.get(ProcessService);
        const existingDir = HOME_DIR;

        processService.chdir(existingDir);

        expect(processService.pwd()).toBe(existingDir);
    });

    it("should throw error when changing to non-existent directory", (): void => {
        const processService = context.get(ProcessService);
        const nonExistentDir = "/non/existent/dir";

        expect(() => processService.chdir(nonExistentDir))
            .toThrow(`ENOENT: no such file or directory, chdir '${HOME_DIR}' -> '${nonExistentDir}'`);
    });
});
