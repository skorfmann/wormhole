const { App } = require('cdktf');
const { LambdaStack } = require('aws-lambda-worker');
const path = require('path');

const app = new App();
new LambdaStack(app, 'simple-demo', {path: __dirname});
app.synth();
