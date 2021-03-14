import { Construct } from "constructs";
import { TerraformOutput, Resource  } from 'cdktf';
import * as Null from "@cdktf/provider-null";
import * as hashdirectory from 'hashdirectory';
import { AwsEcrRepository } from './ecr-repository'
import { DockerImage } from './docker/image'

export interface DockerAssetConfig {
  path: string;
  name: string;
}

export class DockerAsset extends Resource {
  public readonly repository: AwsEcrRepository;
  public readonly workingDirectory: string;
  public readonly buildAndPush: Null.Resource;
  public readonly dockerImage: DockerImage;

  constructor(scope: Construct, name: string, config: DockerAssetConfig) {
    super(scope, name);

    this.workingDirectory = config.path
    this.buildAndPush = new Null.Resource(this, 'buildAndPush', {
      triggers: {
        folderhash: hashdirectory.sync(this.workingDirectory),
        name: config.name
      }
    });

    const repoConfig = {
      name: config.name
    }

    this.repository = new AwsEcrRepository(this, 'foo', repoConfig)

    this.buildAndPush.addOverride('depends_on', [this.repository.dependable.fqn])
    this.dockerBuildCommand()

    this.dockerImage = new DockerImage(this, 'image', {
      repository: this.repository,
      dependsOn: [this.buildAndPush]
    })
  }

  protected addOutput(): void {
    new TerraformOutput(this, 'docker-repository-url', {
      value: this.repository.url
    })
  }

  protected dockerBuildCommand(): void {
    const imageName = this.repository.url;

    const command = `
      docker login --username ${this.repository.authorizationUser} --password ${this.repository.authorizationPassword} ${imageName} &&
      cd ${this.workingDirectory} && docker build -t ${imageName} . &&
      docker push ${imageName}
    `;
    this.buildAndPush.addOverride('provisioner.local-exec.command', command);
  }
}
