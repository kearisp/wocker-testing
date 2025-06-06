import {
    Scanner,
    Global,
    Module,
    ModuleMetadata,
    ApplicationContext
} from "@wocker/core";


export class TestingModuleBuilder {
    protected readonly moduleType: any;

    public constructor(metadata: ModuleMetadata) {
        this.moduleType = this.createModule(metadata);
    }

    protected createModule(metadata: ModuleMetadata) {
        @Global()
        @Module(metadata)
        class TestingModule {}

        return TestingModule;
    }

    public async build(): Promise<ApplicationContext> {
        const scanner = new Scanner();

        await scanner.scan(this.moduleType);

        return new ApplicationContext(this.moduleType, scanner.container);
    }
}
