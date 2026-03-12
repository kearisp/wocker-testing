import {AddressInfo, SocketReadyState} from "net";
import {PassThrough} from "stream";
import Readline from "readline";
import {Direction} from "tty";


export class MockWriteStream extends PassThrough implements NodeJS.WriteStream {
    public isTTY: boolean = true;
    public columns: number = 0;
    public rows: number = 0;
    public autoSelectFamilyAttemptedAddresses: string[] = [];
    public bufferSize: number = 0;
    public bytesRead: number = 0;
    public bytesWritten: number = 0;
    public connecting: boolean = false;
    public pending: boolean = false;
    public readyState: SocketReadyState = "writeOnly";
    public remoteAddress: string | undefined;
    public remoteFamily: string | undefined;
    public remotePort: number | undefined;

    public constructor() {
        super({
            // write(chunk, encoding, callback) {
            //     this.push(chunk, encoding);
            //
            //     callback();
            // },
            // read() {
            //
            // }
        });
    }

    public connect(): this {
        throw new Error("Method not implemented.");
    }

    public destroySoon(): void {
        throw new Error("Method not implemented.");
    }

    public resetAndDestroy(): this {
        throw new Error("Method not implemented.");
    }

    public setTimeout(timeout: number, callback?: () => void): this {
        throw new Error("Method not implemented.");
    }

    public setNoDelay(noDelay?: boolean): this {
        throw new Error("Method not implemented.");
    }

    public setKeepAlive(enable?: boolean, initialDelay?: number): this {
        throw new Error("Method not implemented.");
    }

    public address(): AddressInfo | {} {
        throw new Error("Method not implemented.");
    }

    public ref(): this {
        throw new Error("Method not implemented.");
    }

    public unref(): this {
        throw new Error("Method not implemented.");
    }

    public clearLine(dir: Direction, callback?: () => void): boolean {
        return Readline.clearLine(this, dir, callback);
    }

    public clearScreenDown(callback?: () => void): boolean {
        return Readline.clearScreenDown(this, callback);
    }

    public cursorTo(x: number, y?: number, callback?: () => void): boolean;
    public cursorTo(x: number, callback: () => void): boolean;
    public cursorTo(x: number, yOrCallback?: number | (() => void), callback?: () => void): boolean {
        const y = typeof yOrCallback === "number" ? yOrCallback : undefined;

        if(typeof yOrCallback === "function") {
            callback = yOrCallback;
        }

        return Readline.cursorTo(this, x, y, callback);
    }

    public moveCursor(dx: number, dy: number, callback?: () => void): boolean {
        return Readline.moveCursor(this, dx, dy, callback);
    }

    public getColorDepth(env?: object): number {
        throw new Error("Method not implemented.");
    }

    public hasColors(count?: unknown, env?: unknown): boolean {
        throw new Error("Method not implemented.");
    }

    public getWindowSize(): [number, number] {
        throw new Error("Method not implemented.");
    }
}
