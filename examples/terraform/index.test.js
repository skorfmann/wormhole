const { TestDriver } = require('./test-helper')

jest.setTimeout(120000)

describe("full integration test synth", () => {
  let driver;

  beforeAll(() => {
    driver = new TestDriver(__dirname)
    driver.setupTypescriptProject()
  });

  afterAll(() => {
    driver.reset()
  })

  test("synth generates JSON", async () => {
    driver.synth()
    expect(driver.synthesizedStack()).toMatchSnapshot()
  })
})