const { execSync } = require("child_process");
const os = require("os");
const path = require("path");
const fs = require("fs");

class TestDriver {
  constructor(rootDir, addToEnv) {
    this.env = Object.assign({CI: 1}, process.env, addToEnv);
    this.rootDir = rootDir;
  }

  switchToTempDir = () => {
    const pathName = path.join(os.tmpdir(), "test");
    this.workingDirectory = fs.mkdtempSync(pathName);
    process.chdir(this.workingDirectory);
  }

  reset = () => {
    process.chdir(this.rootDir);
    fs.rmdirSync(this.workingDirectory);
  }

  copyFiles = (...fileNames) => {
    for (const fileName of fileNames) {
      fs.copyFileSync(path.join(this.rootDir, fileName), fileName);
    }
  }

  copyFile = (source, dest) => {
    fs.copyFileSync(path.join(this.rootDir, source), dest);
  }

  synthesizedStack = () => {
    return fs.readFileSync(path.join(this.workingDirectory, 'cdktf.out', 'cdk.tf.json'), 'utf-8')
  }

  init = (template) => {
    execSync(
      `cdktf init --template ${template} --project-name="typescript-test" --project-description="typescript test app" --local`,
      { stdio: "inherit", env: this.env }
    );
  }

  get = () => {
    execSync(`cdktf get`, { stdio: "inherit", env: this.env });
  }

  synth = () => {
    execSync(`cdktf synth`, { stdio: "inherit", env: this.env });
  }

  diff = () => {
    return execSync(`cdktf diff`, { env: this.env }).toString();
  }

  deploy = () => {
    return execSync(`cdktf deploy --auto-approve`, { env: this.env }).toString();
  }

  destroy = () => {
    return execSync(`cdktf destroy --auto-approve`, { env: this.env }).toString();
  }

  setupTypescriptProject = () => {
    this.switchToTempDir()
    this.init('typescript')
    this.copyFiles('main.ts', 'cdktf.json')
    this.get()
  }

  setupPythonProject = () => {
    this.switchToTempDir()
    this.init('python')
    this.copyFiles('main.py', 'cdktf.json')
    this.get()
  }

  setupCsharpProject = () => {
    this.switchToTempDir()
    this.init('csharp')
    this.copyFiles('Main.cs', 'cdktf.json')
    this.get()
    execSync('dotnet add reference .gen/aws/aws.csproj', { stdio: 'inherit', env: this.env });
  }

  setupJavaProject = () => {
    this.switchToTempDir()
    this.init('java')
    this.copyFiles('cdktf.json')
    this.copyFile('Main.java', 'src/main/java/com/mycompany/app/Main.java')
    this.get()
  }
}

module.exports = {
  TestDriver
}