const core = require('@actions/core');
const github = require('@actions/github');
const { exec } = require("child_process");

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
  const patch = exec('git log -p -1', (error, stdout, stderr) => {
    if (error) {
        console.log(`error while 'git log': ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr while 'git log': ${stderr}`);
        return;
    }
    console.log(`stdout: ${stdout}`);
  });

  console.log(`Git diff: ${patch}`);
}

async function getBranchName() {

}

async function postDiffToServer(branch, diff) {

}
