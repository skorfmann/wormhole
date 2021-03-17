"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const create_jest_runner_1 = require("create-jest-runner");
const client_lambda_1 = require("@aws-sdk/client-lambda");
const lambdaRunner = async (options) => {
    const start = Date.now();
    const { testPath } = options;
    const { rootDir } = options.globalConfig;
    const relativePath = testPath.replace(`${rootDir}/`, "");
    const payload = {
        testPath: relativePath
    };
    try {
        const client = new client_lambda_1.LambdaClient({ region: "eu-central-1" });
        const params = {
            FunctionName: process.env.WORMHOLE_LAMBDA_RUNNER,
            InvocationType: "RequestResponse",
            LogType: 'Tail',
            Payload: Buffer.from(JSON.stringify(payload)),
            Qualifier: "local"
        };
        const command = new client_lambda_1.InvokeCommand(params);
        const response = await client.send(command);
        const result = JSON.parse(JSON.parse(new TextDecoder().decode(response.Payload)).result);
        const testResult = result.testResults[0];
        if (result.success) {
            return create_jest_runner_1.pass({
                start,
                end: Date.now(),
                test: { path: testPath, title: 'LambdaRunner' },
            });
        }
        else {
            return create_jest_runner_1.fail({
                start,
                end: Date.now(),
                test: { path: testPath, title: 'LambdaRunner', errorMessage: testResult.failureMessage },
            });
        }
    }
    catch (error) {
        return create_jest_runner_1.fail({
            start,
            end: Date.now(),
            test: { path: testPath, title: 'LambdaRunner', errorMessage: error },
        });
    }
};
exports.default = lambdaRunner;
// result = {
// 	"numFailedTestSuites": 0,
// 	"numFailedTests": 0,
// 	"numPassedTestSuites": 1,
// 	"numPassedTests": 1,
// 	"numPendingTestSuites": 0,
// 	"numPendingTests": 0,
// 	"numRuntimeErrorTestSuites": 0,
// 	"numTodoTests": 0,
// 	"numTotalTestSuites": 1,
// 	"numTotalTests": 1,
// 	"openHandles": [],
// 	"snapshot": {
// 		"added": 0,
// 		"didUpdate": false,
// 		"failure": false,
// 		"filesAdded": 0,
// 		"filesRemoved": 0,
// 		"filesRemovedList": [],
// 		"filesUnmatched": 0,
// 		"filesUpdated": 0,
// 		"matched": 1,
// 		"total": 1,
// 		"unchecked": 0,
// 		"uncheckedKeysByFile": [],
// 		"unmatched": 0,
// 		"updated": 0
// 	},
// 	"startTime": 1615838404772,
// 	"success": true,
// 	"testResults": [{
// 		"leaks": false,
// 		"numFailingTests": 0,
// 		"numPassingTests": 1,
// 		"numPendingTests": 0,
// 		"numTodoTests": 0,
// 		"openHandles": [],
// 		"perfStats": {
// 			"end": 1615838438722,
// 			"runtime": 33837,
// 			"slow": true,
// 			"start": 1615838404885
// 		},
// 		"skipped": false,
// 		"snapshot": {
// 			"added": 0,
// 			"fileDeleted": false,
// 			"matched": 1,
// 			"unchecked": 0,
// 			"unmatched": 0,
// 			"updated": 0,
// 			"uncheckedKeys": []
// 		},
// 		"testFilePath": "/var/task/index.test.js",
// 		"testResults": [{
// 			"ancestorTitles": ["full integration test synth"],
// 			"duration": 17510,
// 			"failureDetails": [],
// 			"failureMessages": [],
// 			"fullName": "full integration test synth synth generates JSON",
// 			"location": null,
// 			"numPassingAsserts": 0,
// 			"status": "passed",
// 			"title": "synth generates JSON"
// 		}],
// 		"failureMessage": null
// 	}],
// 	"wasInterrupted": false
// }
