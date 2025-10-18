import {
    Scanner,
    Global,
    Module,
    ApplicationContext,
    InjectionToken,
    ProviderType,
    ProcessService,
    Type,
    ModuleMetadata
} from "@wocker/core";
import {MockProcessService} from "../services";


export class TestingModuleBuilder {
    protected readonly moduleType: Type;
    protected readonly overrideProviders: Map<InjectionToken, ProviderType>;

    public constructor(metadata: ModuleMetadata) {
        this.moduleType = this.createModule(metadata);
        this.overrideProviders = new Map();

        this.overrideProvider(ProcessService)
            .useProvider(MockProcessService);
    }

    protected createModule(metadata: ModuleMetadata) {
        @Global()
        @Module(metadata)
        class TestingModule {}

        return TestingModule;
    }

    public overrideProvider(token: InjectionToken) {
        const _this: TestingModuleBuilder = this;

        return {
            useProvider(type: ProviderType) {
                _this.overrideProviders.set(token, type);

                return _this;
            },
            useValue(value: any) {
                _this.overrideProviders.set(token, {
                    provide: token,
                    useValue: value
                });

                return _this;
            }
        };
    }

    public async build(): Promise<ApplicationContext> {
        const _this = this;

        class TestScanner extends Scanner {
            protected scanRoutes(): void {
                _this.overrideProviders.forEach((provider, token): void => {
                    this.container.replace(token, provider);
                });

                super.scanRoutes();
            }
        }

        const scanner = new TestScanner();

        await scanner.scan(this.moduleType);

        return new ApplicationContext(this.moduleType, scanner.container);
    }
}
