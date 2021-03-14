import { Construct } from 'constructs';
import { App, TerraformStack, TerraformOutput } from 'cdktf';
import * as aws from '@cdktf/provider-aws';
import { Policy } from './lib/policy';
import * as iam from 'iam-floyd';
import { DockerAsset } from './lib/docker-asset'
import * as path from 'path';

class LambdaStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);

    new aws.AwsProvider(this, 'default', {
      region: 'eu-central-1'
    })

    const fnName = `terraform-wormhole`;

    const role = new aws.IamRole(this, 'role', {
      name: `${fnName}-role`,
      assumeRolePolicy: Policy.document(new iam.Sts()
        .allow()
        .toAssumeRole()
        .forService('lambda.amazonaws.com')
      )
    })

    new aws.IamRolePolicy(this, 'lambdaExecution', {
      role: role.name,
      policy: JSON.stringify({
        "Version": "2012-10-17",
        "Statement": [
          {
            "Action": [
              "logs:CreateLogGroup",
              "logs:CreateLogStream",
              "logs:PutLogEvents"
            ],
            "Resource": "arn:aws:logs:*:*:*",
            "Effect": "Allow"
          }
        ]
      })
    })

    const asset = new DockerAsset(this, 'asset', {
      name: 'lambda-jest',
      path: path.join(__dirname, '..', '..', 'examples', 'terraform')
    })

    const fn = new aws.LambdaFunction(this, 'fn', {
      functionName: fnName,
      role: role.arn,
      memorySize: 4096 * 2,
      timeout: 60 * 5,
      imageUri: asset.dockerImage.url,
      packageType: "Image",
      publish: true
    })

    new aws.LambdaAlias(this, 'alias', {
      name: "local",
      functionVersion: fn.version,
      functionName: fn.arn
    })

    new TerraformOutput(this, 'lambda-arn', {
      value: fn.arn
    })

    new TerraformOutput(this, 'ecr-url', {
      value: asset.dockerImage.url
    })
  }
}

const app = new App();
new LambdaStack(app, 'lambda');
app.synth();
