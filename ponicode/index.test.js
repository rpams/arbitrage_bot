const rewire = require("rewire")
const index = rewire("../index")
const getExpectedReturn = index.__get__("getExpectedReturn")
// @ponicode
describe("getExpectedReturn", () => {
    test("0", async () => {
        await getExpectedReturn()
    })
})
