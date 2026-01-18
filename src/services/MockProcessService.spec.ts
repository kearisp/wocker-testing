import {describe, it, expect, beforeEach} from "@jest/globals";
import {vol} from "memfs";
import {ApplicationContext, ProcessService, WOCKER_DATA_DIR_KEY, FILE_SYSTEM_DRIVER_KEY} from "@wocker/core";
import {Test} from "../makes";
import {MockProcessService} from "./";


describe("MockProcessService", () => {
    const HOME_DIR = "/home/wocker-test";
    let context: ApplicationContext;

    beforeEach(async () => {
        vol.reset();
        vol.fromJSON({
            "foo/bar.txt": "test"
        }, HOME_DIR);

        context = await Test
            .createTestingModule({})
            .overrideProvider(FILE_SYSTEM_DRIVER_KEY).useValue(vol)
            .overrideProvider(WOCKER_DATA_DIR_KEY).useValue(HOME_DIR)
            .build();
    });

    it("should return MockProcessService when requesting ProcessService from context", () => {
        const processService = context.get(ProcessService),
              mockProcessService = context.get(MockProcessService);

        expect(processService).toBe(mockProcessService);
    });

    it("should return current working directory", () => {
        const processService = context.get(ProcessService);

        expect(processService.pwd()).toBe(HOME_DIR);
    });

    it("should change current working directory", () => {
        const processService = context.get(MockProcessService);

        expect(processService.pwd()).toBe(HOME_DIR);
        expect(processService.pwd("foo")).toBe(`${HOME_DIR}/foo`);

        processService.cd("foo");

        expect(processService.pwd()).toBe(`${HOME_DIR}/foo`);
    });

    it("should throw error when changing to non-existent directory", () => {
        const processService = context.get(MockProcessService),
              nonExistentDir = "/non/existent/dir";

        expect(() => processService.chdir(nonExistentDir))
            .toThrow(`ENOENT: no such file or directory, chdir '${HOME_DIR}' -> '${nonExistentDir}'`);
    });
});
