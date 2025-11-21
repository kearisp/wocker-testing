import {describe, it, expect} from "@jest/globals";
import {
    Module,
    Injectable,
    ApplicationContext
} from "@wocker/core";
import {Test} from "./";


describe("Test", (): void => {
    it("should create a testing module", async (): Promise<void> => {
        class TestService {}

        const context = await Test.createTestingModule({
            providers: [TestService]
        }).build();

        const testService = context.get(TestService);

        expect(context).toBeInstanceOf(ApplicationContext);
        expect(testService).toBeInstanceOf(TestService);
    });

    it("should override provider", async (): Promise<void> => {
        const PROVIDE_KEY = "_TEST_",
              PROVIDE_VALUE = "test-value";

        @Injectable("TEST_PROVIDER")
        class TestProvider {}

        @Injectable("TEST_PROVIDER")
        class OverrideTestProvider {}

        @Module({
            providers: [
                TestProvider
            ],
            exports: [
                TestProvider
            ]
        })
        class TestModule {}

        const context = await Test
            .createTestingModule({
                imports: [TestModule],
                providers: [
                    {
                        provide: PROVIDE_KEY,
                        useValue: PROVIDE_VALUE
                    }
                ],
                exports: [
                    PROVIDE_KEY
                ]
            })
            .overrideProvider(TestProvider)
            .useProvider(OverrideTestProvider)
            .overrideProvider(PROVIDE_KEY)
            .useValue(PROVIDE_VALUE)
            .build();

        const testProvider = context.get(TestProvider),
              testValue = context.get<string>(PROVIDE_KEY);

        // console.log(context.);

        expect(testProvider).toBeInstanceOf(OverrideTestProvider);
        expect(testValue).toBe(PROVIDE_VALUE);
    });

    it("should override module", async (): Promise<void> => {
        @Module({
            providers: [
                {
                    provide: "TEST_PROVIDER",
                    useValue: "Default"
                }
            ],
            exports: [
                "TEST_PROVIDER"
            ]
        })
        class TestModule {}

        @Module({
            providers: [
                {
                    provide: "TEST_PROVIDER",
                    useValue: "Overrided"
                }
            ],
            exports: [
                "TEST_PROVIDER"
            ]
        })
        class OverrideTestModule {}

        const context = await Test
            .createTestingModule({
                imports: [
                    TestModule
                ]
            })
            .overrideModule(TestModule).useModule(OverrideTestModule)
            .build();

        const testProvider = context.get("TEST_PROVIDER");

        expect(testProvider).toBe("Overrided");
    });

    it("should override submodule", async (): Promise<void> => {
        @Injectable("TEST_SUBMODULE_PROVIDER")
        class TestSubModuleService {
            public getValue(): string {
                return "TestValue";
            }
        }

        @Module({
            providers: [TestSubModuleService],
            exports: [TestSubModuleService]
        })
        class TestSubModule {}

        @Injectable("TEST_MODULE_SERVICE")
        class TestTopModuleService {
            public constructor(
                protected readonly testSubmoduleService: TestSubModuleService
            ) {}

            public getValue() {
                return this.testSubmoduleService.getValue();
            }
        }

        @Module({
            imports: [TestSubModule],
            providers: [TestTopModuleService],
            exports: [TestTopModuleService]
        })
        class TestTopModule {}

        @Injectable("TEST_SUBMODULE_PROVIDER")
        class TestOverrideSubModuleService {
            public getValue(): string {
                return "Overrided";
            }
        }

        @Module({
            providers: [TestOverrideSubModuleService],
            exports: [TestOverrideSubModuleService]
        })
        class TestOverrideSubmodule {}

        const context = await Test
            .createTestingModule({
                imports: [
                    TestSubModule,
                    TestTopModule
                ],
                exports: [TestTopModuleService]
            })
            .overrideModule(TestSubModule).useModule(TestOverrideSubmodule)
            .build();

        const testTopModuleService = context.get(TestTopModuleService),
              testSubmoduleService = context.get(TestSubModuleService);

        expect(testTopModuleService).toBeInstanceOf(TestTopModuleService);
        expect(testSubmoduleService).toBeInstanceOf(TestOverrideSubModuleService);
        expect(testTopModuleService.getValue()).toBe("Overrided");
    });
});
