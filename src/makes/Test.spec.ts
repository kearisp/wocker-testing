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
});
