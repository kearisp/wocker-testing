import {FileSystem} from "@wocker/core";
import {Readable} from "stream";
import {Logger} from "@kearisp/cli";


export class Fixtures {
    protected constructor(
        protected readonly fs: FileSystem
    ) {}

    public imageInspect(version: string, image: string, tag: string): any {
        const path = `records/${version}/image/${image}/${tag}.json`;

        Logger.info(">>>", path);

        if(!this.fs.exists(path)) {
            return null;
        }

        return this.fs.readJSON(path);
    }

    public saveImage(version: string, image: string, tag: string, data: any): void {
        const dir = `records/${version}/image/${image}`;

        if(!this.fs.exists(dir)) {
            this.fs.mkdir(dir, {
                recursive: true
            });
        }

        this.fs.writeJSON(`${dir}/${tag}.json`, data);
    }

    public hasPull(version: string, image: string, tag: string): boolean {
        return this.fs.exists(`records/${version}/pull/${image}/${tag}.jsonl`);
    }

    public pull(version: string, image: string, tag: string): Readable {
        return this.fs.createReadlineStream(`records/${version}/pull/${image}/${tag}.jsonl`);
    }

    public hasBuild(version: string, builderVersion: string, image: string, tag: string): boolean {
        return this.fs.exists(`records/${version}/build-${builderVersion}/${image}/${tag}.jsonl`);
    }

    public build(version: string, builderVersion: string, image: string, tag: string): Readable {
        return this.fs.createReadlineStream(`records/${version}/build-${builderVersion}/${image}/${tag}.jsonl`);
    }

    public async recordPullStream(version: string, image: string, tag: string, stream: NodeJS.ReadableStream): Promise<void> {
        const dir = `records/${version}/pull/${image}`;

        if(!this.fs.exists(dir)) {
            this.fs.mkdir(dir, {
                recursive: true
            });
        }

        try {
            const target = this.fs.createWriteStream(`${dir}/${tag}.jsonl`);

            await this.recordStream(stream, target);
        }
        catch(err) {
            Logger.error(err.message);
        }
    }

    public async recordBuildStream(version: string, builderVersion: string, image: string, tag: string, stream: NodeJS.ReadableStream): Promise<void> {
        const dir = `records/${version}/build-${builderVersion}/${image}`;

        if(!this.fs.exists(dir)) {
            this.fs.mkdir(dir, {
                recursive: true
            });
        }

        const target = this.fs.createWriteStream(`${dir}/${tag}.jsonl`, {
            encoding: "utf8"
        });

        await this.recordStream(stream, target);
    }

    public async recordStream(stream: NodeJS.ReadableStream, target: NodeJS.WritableStream): Promise<void> {
        await new Promise<void>((resolve, reject) => {
            const cleanup = () => {
                stream.off("data", handleData);
                stream.off("end", handleEnd);
                stream.off("error", handleError);
            };

            const resolveCleanup = (): void => {
                cleanup();
                resolve();
            };

            const rejectCleanup = (err: Error): void => {
                cleanup();
                reject(err);
            };

            const handleData = (chunk: Buffer | string): void => {
                const canContinue = target.write(chunk.toString().replace(/\r\n/g, "\n"));

                if(!canContinue) {
                    stream.pause();
                    target.once("drain", () => stream.resume());
                }
            };

            const handleEnd = () => {
                target.once("finish", resolveCleanup);
                target.once("error", rejectCleanup);
                target.end();
            };

            const handleError = (err: Error): void => {
                target.once("finish", () => rejectCleanup(err));
                target.once("error", rejectCleanup);
                target.end();
            };

            stream.on("data", handleData);
            stream.on("end", handleEnd);
            stream.on("error", handleError);
        });
    }

    public static fromFS(fs: FileSystem): Fixtures {
        return new Fixtures(fs);
    }

    public static fromPath(path: string): Fixtures {
        return Fixtures.fromFS(
            new FileSystem(path)
        );
    }
}
