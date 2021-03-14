import { Construct, } from "constructs";
import {  Resource, TerraformResource } from 'cdktf';
import * as fs from "fs";
import * as path from 'path'
import { DataExternal } from "../.gen/providers/external"

export interface CustomDataSourceConfig<Inputs, Outputs> {
  code(input: Inputs): Promise<Outputs>
  inputs: Inputs;
  dependsOn?: TerraformResource[];
}

class OutputProxy {
  constructor(protected data: DataExternal) {
    return new Proxy(this, this);
  }

  public get(_target: any, prop: string) {
    return this.data.result(prop);
  }
}

export class CustomDataSource<Inputs,Outputs> extends Resource {
  public readonly outputs: OutputProxy;
  public readonly data: DataExternal;

  constructor(scope: Construct, name: string, config: CustomDataSourceConfig<Inputs, Outputs>) {
    super(scope, name);

    const { code } = config;

    const filePath = path.join(process.cwd(), 'cdktf.out', `${name}-data-source.js`)
    fs.writeFileSync(filePath, `
    const handler = ${code.toString()}
    const stdin = process.stdin,
      stdout = process.stdout,
      inputChunks = [];

    stdin.setEncoding('utf8');

    stdin.on('data', function (chunk) {
      inputChunks.push(chunk)
    });

    stdin.on('end', async function () {
      const input = JSON.parse(inputChunks.join(''))
      try {
        const output = await handler(input)
        stdout.write(JSON.stringify(output));
        stdout.write('\\n');
      } catch(e) {
        console.error("error", e)
      }
    })
    `)

    this.data = new DataExternal(this, 'external', {
      program: ['node', filePath],
      query: config.inputs as any,
      workingDir: path.join(process.cwd()),
      dependsOn: config.dependsOn
    })

    this.outputs = new OutputProxy(this.data)
    this.outputs
  }

  public result(key: keyof Outputs): string {
    return this.data.result(key as string)
  }
}
