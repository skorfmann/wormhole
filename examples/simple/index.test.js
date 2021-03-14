jest.setTimeout(10000)

describe('ReportRequest', () => {
  it('handles request errors', () => {
    const foo = true
    expect(foo).toBe(false)
  });
});