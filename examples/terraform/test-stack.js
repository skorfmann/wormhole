const { App } = require('cdktf');
const { LambdaStack } = require('aws-lambda-worker');

const app = new App();
new LambdaStack(app, 'cdktf-demo', {path: __dirname});
app.synth();
