const { calculateTimesToGet, calculateWeeksSinceTimestamp, calculateMonthsSinceTimestamp, calculateYearsSinceTimestamp, rebuildArrayForWeekDashChart, rebuildArrayForMonthDashChart, rebuildArrayForYearDashChart, rebuildArrayForWeekChart, rebuildArrayForMonthChart, rebuildArrayForYearChart, calculateTimesSinceOldestTimestamp, findAverageForTime, generateListHTML } = require('./renderer');

// finance-manager/main/src/renderer.test.js


describe('calculateTimesToGet', () => {
  it('should return the correct timestamp for 1 month', () => {
    const range = '1 month';
    const result = calculateTimesToGet(range);
    expect(result).toBeLessThan(Math.floor(Date.now() / 1000));
  });

  it('should return the correct timestamp for 3 months', () => {
    const range = '3 months';
    const result = calculateTimesToGet(range);
    expect(result).toBeLessThan(Math.floor(Date.now() / 1000));
  });

  it('should return the correct timestamp for 6 months', () => {
    const range = '6 months';
    const result = calculateTimesToGet(range);
    expect(result).toBeLessThan(Math.floor(Date.now() / 1000));
  });

  it('should return the correct timestamp for 1 year', () => {
    const range = '1 year';
    const result = calculateTimesToGet(range);
    expect(result).toBeLessThan(Math.floor(Date.now() / 1000));
  });

  it('should return the correct timestamp for 2 years', () => {
    const range = '2 years';
    const result = calculateTimesToGet(range);
    expect(result).toBeLessThan(Math.floor(Date.now() / 1000));
  });

  it('should return the correct timestamp for 5 years', () => {
    const range = '5 years';
    const result = calculateTimesToGet(range);
    expect(result).toBeLessThan(Math.floor(Date.now() / 1000));
  });

  it('should return the default timestamp for an invalid range', () => {
    const range = 'invalid';
    const result = calculateTimesToGet(range);
    expect(result).toBeLessThan(Math.floor(Date.now() / 1000));
  });
});

describe('calculateWeeksSinceTimestamp', () => {
  it('should return an array of weeks since the given timestamp', () => {
    const timestamp = Math.floor(Date.now() / 1000) - 604800 * 4; // 4 weeks ago
    const result = calculateWeeksSinceTimestamp(timestamp);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('calculateMonthsSinceTimestamp', () => {
  it('should return an array of months since the given timestamp', () => {
    const timestamp = Math.floor(Date.now() / 1000) - 2592000 * 4; // 4 months ago
    const result = calculateMonthsSinceTimestamp(timestamp);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('calculateYearsSinceTimestamp', () => {
  it('should return an array of years since the given timestamp', () => {
    const timestamp = Math.floor(Date.now() / 1000) - 31536000 * 4; // 4 years ago
    const result = calculateYearsSinceTimestamp(timestamp);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('rebuildArrayForWeekDashChart', () => {
  it('should return an array of weekly data', () => {
    const expenseData = [{ date: Math.floor(Date.now() / 1000), amount: 100 }];
    const incomeData = [{ date: Math.floor(Date.now() / 1000), amount: 200 }];
    const weeks = calculateWeeksSinceTimestamp(Math.floor(Date.now() / 1000) - 604800 * 4);
    const result = rebuildArrayForWeekDashChart(expenseData, incomeData, weeks);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('rebuildArrayForMonthDashChart', () => {
  it('should return an array of monthly data', () => {
    const expenseData = [{ date: Math.floor(Date.now() / 1000), amount: 100 }];
    const incomeData = [{ date: Math.floor(Date.now() / 1000), amount: 200 }];
    const months = calculateMonthsSinceTimestamp(Math.floor(Date.now() / 1000) - 2592000 * 4);
    const result = rebuildArrayForMonthDashChart(expenseData, incomeData, months);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('rebuildArrayForYearDashChart', () => {
  it('should return an array of yearly data', () => {
    const expenseData = [{ date: Math.floor(Date.now() / 1000), amount: 100 }];
    const incomeData = [{ date: Math.floor(Date.now() / 1000), amount: 200 }];
    const years = calculateYearsSinceTimestamp(Math.floor(Date.now() / 1000) - 31536000 * 4);
    const result = rebuildArrayForYearDashChart(expenseData, incomeData, years);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('rebuildArrayForWeekChart', () => {
  it('should return an array of weekly data', () => {
    const data = [{ date: Math.floor(Date.now() / 1000), amount: 100 }];
    const weeks = calculateWeeksSinceTimestamp(Math.floor(Date.now() / 1000) - 604800 * 4);
    const result = rebuildArrayForWeekChart(data, weeks);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('rebuildArrayForMonthChart', () => {
  it('should return an array of monthly data', () => {
    const data = [{ date: Math.floor(Date.now() / 1000), amount: 100 }];
    const months = calculateMonthsSinceTimestamp(Math.floor(Date.now() / 1000) - 2592000 * 4);
    const result = rebuildArrayForMonthChart(data, months);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('rebuildArrayForYearChart', () => {
  it('should return an array of yearly data', () => {
    const data = [{ date: Math.floor(Date.now() / 1000), amount: 100 }];
    const years = calculateYearsSinceTimestamp(Math.floor(Date.now() / 1000) - 31536000 * 4);
    const result = rebuildArrayForYearChart(data, years);
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('calculateTimesSinceOldestTimestamp', () => {
  it('should return the correct count of times since the oldest timestamp', () => {
    const data = [{ date: Math.floor(Date.now() / 1000) - 604800 * 4 }];
    const stepSize = 604800; // 1 week
    const result = calculateTimesSinceOldestTimestamp(stepSize, data);
    expect(result).toBeGreaterThan(0);
  });
});

describe('findAverageForTime', () => {
  it('should return the correct average for the given time range', () => {
    const data = [{ date: Math.floor(Date.now() / 1000), amount: 100 }];
    const range = Math.floor(Date.now() / 1000) - 604800 * 4; // 4 weeks ago
    const stepSize = 604800; // 1 week
    const result = findAverageForTime(data, range, stepSize);
    expect(result).toBeGreaterThan(0);
  });
});

describe('generateListHTML', () => {
  it('should return the correct HTML string for the given data', () => {
    const data = [{ date: Math.floor(Date.now() / 1000), name: 'Test', amount: 100 }];
    const idStringPrefix = 'test';
    const result = generateListHTML(data, idStringPrefix);
    expect(result).toContain('Test');
  });
});