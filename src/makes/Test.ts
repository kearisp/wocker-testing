import {ModuleMetadata} from "@wocker/core";
import {TestingModuleBuilder} from "./TestingModuleBuilder";


export class Test {
    public static createTestingModule(metadata: ModuleMetadata): TestingModuleBuilder {
        return new TestingModuleBuilder(metadata);
    }
}
