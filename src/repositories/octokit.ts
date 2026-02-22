import type { Probot, ProbotOctokit } from 'probot';

type GetFileContentParams = {
  owner: string;
  repo: string;
  path: string;
  octokit: ProbotOctokit;
  log: Probot['log'];
};
export const getFileContent = async ({
  owner,
  repo,
  path,
  octokit,
  log,
}: GetFileContentParams) => {
  return octokit.repos
    .getContent({
      owner,
      repo,
      path,
    })
    .then((response) => {
      // if response is a file, return its content
      if (!Array.isArray(response.data) && response.data.type === 'file') {
        return Buffer.from(response.data.content, 'base64').toString('utf-8');
      }

      log.info('⚠️ Configuration Response from GitHub API was not a file');
      return null;
    })
    .catch((error) => {
      if (error.status === 404) {
        log.info('⚠️ Configuration file not found in the repository');
        return null;
      }

      log.error(
        `❌ Error fetching configuration file from GitHub API. ${error.status}: ${error.message}`,
      );
      return null;
    });
};
