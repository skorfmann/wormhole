
import { Construct, } from "constructs";
import {  Resource, TerraformResource } from 'cdktf';
import { CustomDataSource } from '../custom-data-source'
import { AwsEcrRepository } from "../ecr-repository";

export interface DockerImageConfig {
  repository: AwsEcrRepository,
  dependsOn?: TerraformResource[];
}

interface CustomDockerImageInput {
  repositoryUrl: string;
  username: string;
  password: string;
}

interface CustomDockerImageOutput {
  sha256Digest: string;
}

class CustomDockerImage extends CustomDataSource<CustomDockerImageInput, CustomDockerImageOutput> {};

export class DockerImage extends Resource  {
  public readonly data: CustomDockerImage;
  public readonly digest: string;
  public readonly url: string;

  constructor(scope: Construct, name: string, config: DockerImageConfig) {
    super(scope, name);

    const { repository } = config;

    this.data = new CustomDockerImage(this, 'fetchImage', {
      inputs: {
        repositoryUrl: repository.url,
        username: repository.authorizationUser,
        password: repository.authorizationPassword
      },
      code: async (args) => {
        const drc = require('docker-registry-client')
        return new Promise((resolve, reject) => {
          var rar = drc.parseRepoAndRef((args as any).repositoryUrl);
          var client = drc.createClientV2({
            repo: rar,
            insecure: false,
            username: args.username,
            password: args.password,
            maxSchemaVersion: 2
          });
          var tagOrDigest = rar.tag || rar.digest;
          client.getManifest({ref: tagOrDigest}, function (err:any, _manifest:any, _res:any, manifestStr:any) {
            client.close();
            if (err) {
              reject(err)
            }
            resolve({sha256Digest: drc.digestFromManifestStr(manifestStr)});
          });
        });
      },
      dependsOn: config.dependsOn
    })

    this.digest = this.data.result("sha256Digest")
    this.url = `${repository.url}@${this.digest}`
  }
}