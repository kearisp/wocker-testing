import {describe, it, beforeEach, expect} from "@jest/globals";
import {FileSystem} from "@wocker/core";
import {vol} from "memfs";
import Docker from "dockerode";
import {Fixtures} from "./Fixtures";
import {ModemMock} from "./ModemMock";


describe("Fixtures", () => {
    const fixtures = Fixtures.fromPath(`${__dirname}/../../../fixtures`),
          testFS = new FileSystem("/home/wocker-test"),
          testFixtures = Fixtures.fromFS(testFS);

    const modem = new ModemMock({});
    modem.registerFixtures(fixtures);

    const docker = new Docker({
        // @ts-ignore
        modem: modem
    });

    beforeEach(() => {
        modem.reset();
        modem.registerFixtures(fixtures);
        vol.reset();
    });

    it("should record pulling", async (): Promise<void> => {
        const stream = await docker.pull("node:23"),
              target = testFS.createWriteStream("record.jsonl");

        await testFixtures.recordStream(stream, target);

        expect(testFS.exists("record.jsonl")).toBeTruthy();
    });
});
