const core = require('@actions/core');
const github = require('@actions/github');
const util = require('node:util');
const exec = util.promisify(require("child_process").exec);

try {
  main();
} catch (error) {
  core.setFailed(error.message);
}

async function main() {
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);

  const githubToken = core.getInput('github-token').trim();
  const branch = core.getInput('branch-name').trim();
  const octokit = github.getOctokit(githubToken);

  const diff = await getDiffFromMain();
  if (diff != null && branch != null) {
    postDiffToServer(diff, branch);
  }
}

async function getDiffFromMain() {
  const { stdout, stderr } = await exec('git log -p -1');
  return stdout;
}

async function postDiffToServer(diff, branch) {
  console.log(`branch: ${branch}`);
  console.log(`diff: ${diff}`);
}
