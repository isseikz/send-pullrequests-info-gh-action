const core = require('@actions/core');
const github = require('@actions/github');

try {
  main();
} catch (error) {
  core.setFailed(error.message);
}

function main() {
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);

  const githubToken = core.getInput('github-token').trim();
  const octokit = github.getOctokit(githubToken);

  const diff = getDiffFromMain();
  const branch = getBranchName();
  postDiffToServer(diff, branch);
}

async function getDiffFromMain() {

}

async function getBranchName() {

}

async function postDiffToServer(branch, diff) {

}
