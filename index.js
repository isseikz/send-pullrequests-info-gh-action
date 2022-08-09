const core = require('@actions/core');
const github = require('@actions/github');
const { exec } = require("child_process");

try {
  main();
} catch (error) {
  core.setFailed(error.message);
}

async function main() {
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);

  const githubToken = core.getInput('github-token').trim();
  const octokit = github.getOctokit(githubToken);

  const diff = await getDiffFromMain();
  const branch = await getBranchName();
  if (diff != null && branch != null) {
    postDiffToServer(diff, branch);
  }
}

async function getDiffFromMain() {
  const { stdout, stderr } = await exec('git log -p -1');
  return stdout;
}

async function getBranchName() {
  const { stdout, stderr } = await exec('git rev-parse --abbrev-ref HEAD');
  return stdout;
}

async function postDiffToServer(branch, diff) {
  console.log(`branch: ${branch}`);
  console.log(`diff: ${diff}`);
}
