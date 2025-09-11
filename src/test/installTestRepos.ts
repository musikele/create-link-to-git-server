import simpleGit from 'simple-git';
import { promises as fs } from 'fs';
import { join } from 'path';

const workspace_1 = join(__dirname, '..', '..', 'test_fixtures', 'workspace_1');

// download a repository from a given url into a given path
async function cloneRepository(
  repoUrl: string,
  targetPath: string
): Promise<void> {
  const git = simpleGit();

  // if target path is not empty, do nothing

  try {
    const files = await fs.readdir(targetPath);
    if (files.length > 0) {
      return;
    }
  } catch (err) {
    // If the directory does not exist, proceed to clone
  }

  await git.clone(repoUrl, targetPath);
}

cloneRepository(
  'https://github.com/musikele/create-link-to-git-repo--test-repo',
  workspace_1
).then(() => {
  console.log(`Test repositories cloned to ${workspace_1}`);
});
