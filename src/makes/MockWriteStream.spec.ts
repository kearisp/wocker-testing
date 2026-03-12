import {jest, describe, it, expect} from "@jest/globals";
import {Direction} from "readline";
import {MockWriteStream} from "./MockWriteStream";


const moveCursor = (dx: number, dy: number) => {
    let out = "";

    if(dx > 0) out += `\x1b[${dx}C`;
    if(dx < 0) out += `\x1b[${-dx}D`;

    if(dy > 0) out += `\x1b[${dy}B`;
    if(dy < 0) out += `\x1b[${-dy}A`;

    return out;
};

const cursorTo = (x: number, y?: number) => {
    if(y !== undefined && y !== null) {
        return `\x1b[${y + 1};${x + 1}H`;
    }
    else {
        return `\x1b[${x + 1}G`;
    }
};

describe("MockWriteStream", () => {
    const handleEnd = async (stream: MockWriteStream) => {
        stream.end();

        await new Promise<void>((resolve) => {
            stream.on("finish", resolve);
        });
    };

    it("should write", async () => {
        const stream = new MockWriteStream();

        const writeCallback = jest.fn(),
              dataCallback = jest.fn();

        stream.on("data", dataCallback);
        stream.write("Test", writeCallback);

        await handleEnd(stream);

        expect(writeCallback).toHaveBeenCalled();
        expect(dataCallback).toHaveBeenCalledWith(Buffer.from("Test"));
    });

    it.each([
        {dx: 0, dy: 0},
        {dx: 1, dy: 0},
        {dx: 0, dy: 1},
        {dx: 1, dy: 1},
        {dx: -1, dy: 0},
        {dx: 0, dy: -1},
        {dx: -1, dy: -1}
    ])("should move cursor [$dx, $dy]", async ({dx, dy}) => {
        const stream = new MockWriteStream();

        const dataCallback = jest.fn(),
              moveCallback = jest.fn();

        stream.on("data", dataCallback);
        stream.moveCursor(dx, dy, moveCallback);

        await handleEnd(stream);

        expect(moveCallback).toHaveBeenCalled();

        if(dx !== 0 || dy !== 0) {
            expect(dataCallback).toHaveBeenCalledWith(Buffer.from(moveCursor(dx, dy)));
        }
        else {
            expect(dataCallback).not.toHaveBeenCalled();
        }
    });

    it.each([
        {x: 0, y: 0},
        {x: 5, y: 0},
        {x: 0, y: 3},
        {x: 2, y: 4}
    ])("should move cursor to [$x, $y]", async ({x, y}) => {
        const stream = new MockWriteStream();

        const callback = jest.fn();

        let buffer = "";

        stream.on("data", (chunk) => {
            buffer += chunk.toString();
        });

        stream.cursorTo(x, y, callback);

        await handleEnd(stream);

        expect(callback).toHaveBeenCalled();
        expect(buffer).toBe(cursorTo(x, y));
    });

    it.each<Direction>([-1, 0, 1])("should clear line [%s]", async (dir) => {
        const stream = new MockWriteStream();

        const callback = jest.fn();

        let data = "";

        stream.on("data", (chunk) => {
            data += chunk.toString();
        });
        stream.write("Test");
        stream.clearLine(dir, callback);

        await handleEnd(stream);

        const dirMap = {
            [-1]: "\x1b[1K",
            [0]: "\x1b[2K",
            [1]: "\x1b[0K",
        };

        expect(callback).toHaveBeenCalled();
        expect(data).toBe(`Test${dirMap[dir]}`);
    });

    it("should clear screen down", async () => {
        const stream = new MockWriteStream();
        const callback = jest.fn();

        let data = "";

        stream.on("data", (chunk) => {
            data += chunk.toString();
        });

        stream.clearScreenDown(callback);

        await handleEnd(stream);

        expect(callback).toHaveBeenCalled();
        expect(data).toBe("\u001b[0J");
    });
});
