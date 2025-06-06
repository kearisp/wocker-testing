import {describe, it, expect} from "@jest/globals";
import {ApplicationContext} from "@wocker/core";
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
});
