const { exec } = require("child_process");
const path = require('path');
const { promisify } = require('util');

exports.handler =  async function(event, context) {
  const customExec = promisify(exec)
  let result;

  const { testPath } = event;

  console.log({event, context})

  const jestPath = path.join(process.cwd(), 'node_modules', '.bin', 'jest')

  try {
    result = await customExec(`${jestPath} --json --ci --useStderr --silent --testFailureExitCode 0 ${testPath}`, { stdio: "inherit" })
  } catch(e) {
    console.log(e)
    throw e
  }

  return result;
}