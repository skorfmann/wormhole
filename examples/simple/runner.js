const { exec } = require("child_process");
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

exports.handler =  async function(event, context) {
  const customExec = promisify(exec)
  let result, output;

  const { testPath } = event;

  console.log({event, context})

  const jestPath = path.join(process.cwd(), 'node_modules', '.bin', 'jest')

  try {
    await customExec(`rm -rf /tmp/*`, { stdio: "inherit" })
    output =  await customExec(`${jestPath} --ci --testFailureExitCode 0 ${testPath}`, { stdio: "inherit" })
    console.log({output})
    result = fs.readFileSync(path.join('/', 'tmp', 'wormhole.json'), 'utf-8')
  } catch(e) {
    console.log(e)
    throw e
  }

  return {
    result,
    output
  };
}