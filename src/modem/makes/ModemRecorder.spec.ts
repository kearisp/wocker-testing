import {describe, it, beforeEach, afterEach, jest, expect} from "@jest/globals";
import type Docker from "dockerode";
import {FileSystem} from "@wocker/core";
import {vol} from "memfs";
import {ModemMock} from "./ModemMock";
import {Fixtures} from "./Fixtures";


describe("ModemRecorder", (): void => {
    const fs = new FileSystem(`${__dirname}/../../../fixtures`),
          fixtures = Fixtures.fromFS(fs),
          testFS = new FileSystem("/home/wocker-test");

    const followStream = async (stream: NodeJS.ReadableStream): Promise<void> => {
        await new Promise<void>((resolve, reject): void => {
            stream.on("data", () => undefined);
            stream.on("end", resolve);
            stream.on("error", reject);
        });
    };

    const getContext = (version: string) => {
        const {ModemRecorder} = require("./ModemRecorder"),
              DockerOde = require("dockerode");

        const modem = new ModemRecorder({
            mockFixtures: fixtures,
            recordFixtures: Fixtures.fromFS(testFS),
            socketPath: "/var/run/docker.sock",
            version: version === "v1" ? undefined : version
        });

        const docker: Docker = new DockerOde({
            // @ts-ignore
            modem
        });

        return {
            docker
        };
    };

    beforeEach((): void => {
        vol.reset();

        if(!vol.existsSync(testFS.path())) {
            vol.mkdirSync(testFS.path(), {
                recursive: true
            });
        }

        jest.doMock("docker-modem", () => {
            return ModemMock;
        });
    });

    afterEach((): void => {
        jest.unmock("docker-modem");
    });

    it.each([
        {version: "v1"},
        {version: "v1.48"}
    ])("should record pull", async ({version}): Promise<void> => {
        const {docker} = getContext(version);

        const name = "node",
              tag = "23",
              stream = await docker.pull(`${name}:${tag}`),
              image = docker.getImage(`${name}:${tag}`);

        expect(stream).not.toBeNull();

        await followStream(stream);

        const inspectInfo = await image.inspect();

        expect(inspectInfo).not.toBeNull();
        expect(testFS.exists(`records/${version}/pull/${name}/${tag}.jsonl`)).toBeTruthy();
        expect(testFS.exists(`records/${version}/image/${name}/${tag}.json`)).toBeTruthy();
    });

    it.each([
        {
            version: "v1",
            buildVersion: "1"
        },
        {
            version: "v1.48",
            buildVersion: "1"
        },
        {
            version: "v1.48",
            buildVersion: "2"
        }
    ])("should record build ($buildVersion) $version", async ({version, buildVersion}): Promise<void> => {
        const {docker} = getContext(version);

        const name = "test-project",
              tag = "latest",
              image = docker.getImage(`${name}:${tag}`);

        const stream = await docker.buildImage({
            context: fs.path(`projects/${name}`),
            src: fs.readdir(`projects/${name}`, {
                recursive: true
            })
        }, {
            t: `${name}:${tag}`,
            dockerfile: "Dockerfile",
            version: buildVersion as "1" | "2"
        });

        expect(stream).not.toBeNull();

        await followStream(stream);

        expect(testFS.exists(`records/${version}/build-${buildVersion}/${name}/${tag}.jsonl`)).toBeTruthy();

        const info = await image.inspect();

        expect(info).not.toBeNull();
        expect(testFS.exists(`records/${version}/image/${name}/${tag}.json`)).toBeTruthy();
    });
});
