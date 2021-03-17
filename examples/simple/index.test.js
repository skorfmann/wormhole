jest.setTimeout(10000)

describe('ReportRequest', () => {
  it('handles request errors', () => {
    const foo = false
    expect(foo).toBe(true)
  });
});