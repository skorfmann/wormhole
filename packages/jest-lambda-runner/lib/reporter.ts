// Only Types
// eslint-disable-next-line import/no-extraneous-dependencies
import { AggregatedResult, Test } from '@jest/reporters';
import * as fs from 'fs';
import * as path from 'path';

class WormholeReporter {
  // eslint-disable-next-line class-methods-use-this
  async onRunComplete(
    contexts: Set<Test['context']>,
    testResult: AggregatedResult
  ) {
    // https://github.com/facebook/jest/issues/6924
    testResult.success = testResult.numTotalTests === testResult.numPassedTests
    fs.writeFileSync(path.join('/', 'tmp', 'wormhole.json'), JSON.stringify(testResult))
  }
}

export = WormholeReporter;