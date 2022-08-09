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

  const diff = await getDiffFromMain();
  const branch = await getBranchName();
  postDiffToServer(diff, branch);
}

async function getDiffFromMain() {
  return exec('git log -p -1', (error, stdout, stderr) => {
    if (error) {
        console.log(`error while 'git log': ${error.message}`);
        return;
    }
    if (stderr) {
        console.log(`stderr while 'git log': ${stderr}`);
        return;
    }
  });
}

async function getBranchName() {
  return exec('git rev-parse --abbrev-ref HEAD', (error, stdout, stderr) => {
    if (error) {
        console.error(`error while 'git log': ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`stderr while 'git log': ${stderr}`);
        return;
    }
  });
}

async function postDiffToServer(branch, diff) {
  console.log(`branch: ${branch}`);
  console.log(`diff: ${diff}`);
}
