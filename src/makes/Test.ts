import {Module, ModuleConfig, Factory} from "@wocker/core";


export class Test {
    public static async createTestingModule(config: ModuleConfig) {
        @Module(config)
        class TestModule {}

        return Factory.create(TestModule);
    }
}
