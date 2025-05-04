import {describe, it, expect} from "@jest/globals";
import {Test} from "../";


describe("Test", () => {
    it("should create a testing module", async () => {
        class TestService {}

        const context = await Test.createTestingModule({
            providers: [TestService]
        });

        const testService = context.get(TestService);

        expect(testService).toBeInstanceOf(TestService);
    });
});
