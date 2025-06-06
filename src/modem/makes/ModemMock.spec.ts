import {describe, it, expect, beforeEach} from "@jest/globals";
import {FileSystem} from "@wocker/core";
import {Logger} from "@kearisp/cli";
import Docker from "dockerode";
import {ModemMock} from "./ModemMock";
import {Fixtures} from "./Fixtures";


describe("ModemMock", () => {
    const fs = new FileSystem(`${__dirname}/../../../fixtures`),
          fixtures = Fixtures.fromFS(fs);

    const getContext = (version: string) => {
        const modem = new ModemMock({
            mockFixtures: fixtures,
            version: version === "v1" ? undefined : version
        });

        const docker = new Docker({
            // @ts-ignore
            modem
        });

        return {docker};
    };

    const followStream = async (stream: NodeJS.ReadableStream, log?: boolean): Promise<void> => {
        await new Promise<void>((resolve, reject) => {
            stream.on("data", (chunk): void => {
                try {
                    const text = chunk.toString().replace(/}\s*\{/g, '},{'),
                          items: any[] = JSON.parse(`[${text}]`);

                    if(log) {
                        Logger.info(items);
                    }
                }
                catch(err) {
                    expect(err).toBeNull();
                }
            });
            stream.on("end", resolve);
            stream.on("error", reject);
        });
    };

    const modemMock = new ModemMock({});
    const dockerMock = new Docker({
        // @ts-ignore
        modem: modemMock
    });

    beforeEach((): void => {
        modemMock.reset();
        modemMock.registerFixtures(fixtures);
    });

    it("should get empty containers list", async (): Promise<void> => {
        const containers = await dockerMock.listContainers({
            all: true
        });

        expect(containers).toEqual([]);
    });

    it("should create container", async (): Promise<void> => {
        const container = await dockerMock.createContainer({
            name: "test.workspace",
            Image: "oven/bun:latest"
        });

        const inspectInfo = await container.inspect();

        expect(inspectInfo.Id).toBe(container.id);
        expect(inspectInfo.State.Running).toBeFalsy();
        expect(inspectInfo.State.Dead).toBeFalsy();
        expect(inspectInfo.State.Status).toBe("created");
        expect(inspectInfo.State.Error).toBe("");

        await container.start();

        const inspectInfo2 = await container.inspect();

        expect(inspectInfo2.Id).toBe(container.id);
        expect(inspectInfo2.State.Running).toBeTruthy();
        expect(inspectInfo2.State.Dead).toBeFalsy();
        expect(inspectInfo2.State.Status).toBe("running");
        expect(inspectInfo2.State.Error).toBe("");
    });

    it("should pull image", async (): Promise<void> => {
        const image = dockerMock.getImage("node:23");

        await expect(image.inspect()).rejects.toThrowError();

        const stream = await dockerMock.pull("node:23");

        await followStream(stream, false);

        const inspectInfo = await image.inspect();

        expect(inspectInfo.RepoTags).toContain("node:23");

        await image.remove();

        const images = await dockerMock.listImages();

        expect(images).toEqual([]);
    });

    it("should build image", async (): Promise<void> => {
        const version = "v1";
        const {docker} = getContext(version);

        const name = "test-project",
              tag = "latest",
              image = docker.getImage(`${name}:${tag}`);

        await expect(image.inspect()).rejects.toThrowError();

        const stream = await docker.buildImage({
            context: fs.path(`projects/${name}`),
            src: fs.readdir(`projects/${name}`, {
                recursive: true
            })
        }, {
            t: `${name}:${tag}`,
            dockerfile: "./Dockerfile",
            forcerm: true
        });

        await followStream(stream);

        const inspect = await image.inspect();

        expect(inspect).not.toBeNull();
        expect(inspect.RepoTags).toContain(`${name}:${tag}`);
    });

    it("should retrieve list of images", async (): Promise<void> => {
        const {docker} = getContext("v1");

        expect(await docker.listImages()).toEqual([]);

        await followStream(await docker.pull("node:23"));

        const images = await docker.listImages();

        expect(images.length).toBe(1);
        expect(images[0].RepoTags).toEqual(["node:23"]);
    });

    it("should be error", async (): Promise<void> => {
        const {docker} = getContext("v1");

        await expect(docker.pull("not:found")).rejects.toThrow();
    });
});
