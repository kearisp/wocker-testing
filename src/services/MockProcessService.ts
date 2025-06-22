import {
    Injectable,
    Inject,
    ProcessService,
    WOCKER_DATA_DIR_KEY
} from "@wocker/core";
import FS from "fs";
import Path from "path";


@Injectable()
export class MockProcessService extends ProcessService {
    protected _pwd: string;

    public constructor(
        @Inject(WOCKER_DATA_DIR_KEY)
        dataDir: string
    ) {
        super();

        this._pwd = dataDir;
    }

    public pwd(path: string = ""): string {
        return Path.join(this._pwd, path);
    }

    public chdir(path: string): void {
        if(!FS.existsSync(path)) {
            throw new Error(`ENOENT: no such file or directory, chdir '${this._pwd}' -> '${path}'`);
        }

        this._pwd = path;
    }
}
