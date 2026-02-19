import {AddressInfo, SocketReadyState} from "net";
import {Duplex} from "stream";


export class MockReadStream extends Duplex implements NodeJS.ReadStream {
    public isTTY: boolean = false;
    isRaw: boolean = false;
    autoSelectFamilyAttemptedAddresses: string[];
    bufferSize: number;
    bytesRead: number;
    bytesWritten: number;
    connecting: boolean = false;
    pending: boolean;
    localAddress?: string;
    localPort?: number;
    localFamily?: string;
    readyState: SocketReadyState;
    remoteAddress: string;
    remoteFamily: string;
    remotePort: number;
    timeout?: number;

    setRawMode(mode: boolean): this {
        this.isRaw = mode;

        return this;
    }

    pause(): this {
        return this;
    }

    resume(): this {
        return this;
    }

    destroySoon() {

    }

    connect(port: unknown, host?: unknown, connectionListener?: unknown): this {
        throw new Error("Method not implemented.");
    }

    resetAndDestroy(): this {
        throw new Error("Method not implemented.");
    }

    setTimeout(timeout: number, callback?: () => void): this {
        throw new Error("Method not implemented.");
    }

    setNoDelay(noDelay?: boolean): this {
        throw new Error("Method not implemented.");
    }

    setKeepAlive(enable?: boolean, initialDelay?: number): this {
        throw new Error("Method not implemented.");
    }

    address(): AddressInfo | {} {
        throw new Error("Method not implemented.");
    }

    unref(): this {
        throw new Error("Method not implemented.");
    }

    ref(): this {
        throw new Error("Method not implemented.");
    }
}
