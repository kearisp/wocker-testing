import {
    Injectable,
    Inject,
    ProcessService,
    FileSystemDriver,
    WOCKER_DATA_DIR_KEY,
    FILE_SYSTEM_DRIVER_KEY
} from "@wocker/core";
import Path from "path";
import {MockReadStream} from "../makes/MockReadStream";
import {MockWriteStream} from "../makes/MockWriteStream";


@Injectable("CORE_PROCESS_SERVICE")
export class ProcessMockService extends ProcessService {
    protected _pwd: string;
    protected _uid: string | undefined = "1000";
    protected _gid: string | undefined = "1000";
    protected _stdin: MockReadStream;
    protected _stdout: MockWriteStream;
    protected _stderr: MockWriteStream;

    public constructor(
        @Inject(WOCKER_DATA_DIR_KEY)
        dataDir: string,
        @Inject(FILE_SYSTEM_DRIVER_KEY)
        protected readonly driver: FileSystemDriver
    ) {
        super();

        this._pwd = dataDir;
        this._stdin = new MockReadStream();
        this._stdout = new MockWriteStream();
        this._stderr = new MockWriteStream();
    }

    public get UID(): string | undefined {
        return this._uid;
    }

    public get GID(): string | undefined {
        return this._gid;
    }

    public get stdin() {
        return this._stdin;
    }

    public get stdout() {
        return this._stdout;
    }

    public get stderr() {
        return this._stderr;
    }

    public pwd(path: string = ""): string {
        return Path.join(this._pwd, path);
    }

    public chdir(path: string): void {
        if(!this.driver.existsSync(path)) {
            throw new Error(`ENOENT: no such file or directory, chdir '${this._pwd}' -> '${path}'`);
        }

        this._pwd = path;
    }

    public write(chunk: string | Buffer): boolean {
        return this.stdout.write(chunk);
    }
}
