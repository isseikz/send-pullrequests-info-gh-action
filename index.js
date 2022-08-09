const core = require('@actions/core');
const github = require('@actions/github');
const util = require('node:util');
const exec = util.promisify(require("child_process").exec);


const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore/lite');

try {
  main();
} catch (error) {
  core.setFailed(error.message);
}

async function main() {
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`);

  const diff = core.getInput('diff').trim();
  const sha = core.getInput('sha').trim();
  const collection = core.getInput('collection').trim();

  if (diff != null && sha != null) {
    postDiffToServer(diff, sha, collection);
  }
}

async function getDiffFromMain(base, branchName) {
  await exec(`git config core.filemode false`);
  await exec(`git fetch origin ${base} --depth=1`);
  await exec(`git fetch origin ${branchName} --depth=1`);
  await debugGitConfig();
  await debugGitStatus();
  await debugGitLog();
  await debugGitDiff(base, branchName)
  const { stdout, stderr } = await exec(`git diff --no-prefix origin/${base}..origin/${branchName}`);
  return stdout;
}

async function debugGitConfig() {
  console.log("debugGitConfig");
  const { stdout, stderr } = await exec(`git config -l`);
  console.log(stdout);
}

async function debugGitDiff(base, branch) {
  console.log("debugGitDiff");
  const { stdout, stderr } = await exec(`git diff origin/${branch}..origin/${base}`);
  console.log(stdout);
}

async function debugGitStatus() {
  console.log("debugGitStatus");
  const { stdout, stderr } = await exec(`git status`);
  console.log(stdout);
}

async function debugGitLog() {
  console.log("debugGitLog");
  const { stdout, stderr } = await exec(`git log --oneline`);
  console.log(stdout);
}

async function postDiffToServer(diff, sha, collectionName) {
  console.log(`diff: ${diff}`);
  console.log(`sha: ${sha}`);
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
  const col = collection(db, collectionName);
  await addDoc(col, {
    patch: diff,
    sha: sha
  });
}
