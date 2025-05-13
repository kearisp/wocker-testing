import Modem, {ConstructorOptions, DialOptions, RequestCallback} from "docker-modem";
import {Logger} from "@kearisp/cli";
import {Fixtures} from "./Fixtures";
import {Router, Request, Response} from "../router";
import {HttpMethod} from "../types/HttpMethod";
import {version} from "ts-jest/dist/transformers/hoist-jest";


type Options = ConstructorOptions & {
    recordFixtures?: Fixtures;
};

export class ModemRecorder extends Modem {
    protected router: Router;
    protected fixtures?: Fixtures;

    public constructor({recordFixtures, ...rest}: Options) {
        super(rest);

        this.router = new Router();
        this.fixtures = recordFixtures;

        this.router.get(["/images/:tag/json", "/:version/images/:tag/json"], (req: Request, res: Response): void => {
            if(!recordFixtures) {
                return;
            }

            const {
                params: {
                    version = "v1",
                    tag: fullName
                },
                body: result
            } = req;

            const [, image, tag] = /^([^:]+):(.*)$/.exec(fullName);

            this.fixtures.saveImage(version, image, tag, result);

            res.send(null);
        });

        this.router.post(["/images/create", "/:version/images/create"], async (req: Request, res: Response): Promise<void> => {
            if(!recordFixtures) {
                return;
            }

            const {
                params: {
                    version = "v1"
                },
                options: {
                    fromImage,
                    tag
                },
                body: stream
            } = req;

            if(!stream) {
                return;
            }

            await this.fixtures.recordPullStream(version, fromImage, tag, stream);

            res.send(null);
        });

        this.router.post(["/build", "/:version/build"], async (req: Request, res: Response): Promise<void> => {
            const {
                params: {
                    version = "v1"
                },
                options: {
                    t: fullName,
                    version: buildVersion = "1"
                },
                body: stream
            } = req;

            if(!stream) {
                res.send(null);
                return;
            }

            const [, image, tag] = /^([^:]+):(.*)$/.exec(fullName);

            Logger.info("Building...", version, buildVersion, image, tag);
            await this.fixtures.recordBuildStream(version, buildVersion, image, tag, stream);

            res.send(null);
        });
    }

    public dial(options: DialOptions, callback?: RequestCallback): void {
        super.dial(options, (err, result) => {
            const {
                path,
                method,
                options: body
            } = options;

            Logger.info("Recorder dial:", method, path);
            this.router.exec(method as HttpMethod, path, result, body).catch(() => undefined);

            callback(err, result);
        });
    }
}
