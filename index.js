const core = require('@actions/core');
const github = require('@actions/github');
const util = require('node:util');
const exec = util.promisify(require("child_process").exec);


const { initializeApp } = require('firebase/app');
const { getFirestore, collection } = require('firebase/firestore/lite');

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

  const firebaseConfig = {
    apiKey: process.env.API_KEY,
    authDomain: process.env.AUTH_DOMAIN,
    projectId: process.env.PROJECT_ID,
    storageBucket: process.env.STORAGE_BUCKET,
    messagingSenderId: process.env.MESSAGING_SENDER_ID,
    appId: process.env.APP_ID
  };
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const commitsCol = collection(db, 'simplified-commit');
  const data = {
    patch: diff,
    sha: "a"
  };


  const res = await commitsCol.doc().set(data);
  return commits;
}
