import {
    Injectable,
    Inject,
    ProcessService,
    FileSystemDriver,
    WOCKER_DATA_DIR_KEY,
    FILE_SYSTEM_DRIVER_KEY
} from "@wocker/core";
import Path from "path";


@Injectable("CORE_PROCESS_SERVICE")
export class MockProcessService extends ProcessService {
    protected _pwd: string;

    public constructor(
        @Inject(WOCKER_DATA_DIR_KEY)
        dataDir: string,
        @Inject(FILE_SYSTEM_DRIVER_KEY)
        protected readonly driver: FileSystemDriver
    ) {
        super();

        this._pwd = dataDir;
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
}
