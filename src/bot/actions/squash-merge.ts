import type { Probot } from 'probot';
import { summarizeText } from '../../repositories/aiSummary.js';
import { getFileContent } from '../../repositories/octokit.js';

const SQUASH_MERGE_TRIGGER = '/squash-merge';
const squasheMergeTriggerRegex = new RegExp(`^${SQUASH_MERGE_TRIGGER}`, 'i');

export const onSquashMerge = (app: Probot) => {
  app.on('issue_comment.created', async (context) => {
    // Issue_comment.created fires on both issues and PRs, we only want it on PRs
    if (!context.payload.issue.pull_request) return;

    // Check if the command is being run
    const commentBody = context.payload.comment.body.trim();
    if (!squasheMergeTriggerRegex.test(commentBody)) return;

    // Helper functions
    const createComment = async (body: string) => {
      await context.octokit.issues.createComment(context.issue({ body }));
    };

    // extract notes inserted after the command
    const notes = commentBody.replace(squasheMergeTriggerRegex, '').trim();

    // fetch full PR to get title and description of issue
    const { owner, repo } = context.repo();
    const pullNumber = context.payload.issue.number;

    const { data: pullRequest } = await context.octokit.pulls.get({
      owner,
      repo,
      pull_number: pullNumber,
    });

    // if merging is blocked, create a comment and then just exit
    if (pullRequest.mergeable_state === 'blocked') {
      app.log.info(
        `PR @${owner}:${repo}#${pullNumber} is blocked from merging, commenting and exiting`,
      );
      await createComment(
        '⚠️ This pull request cannot be merged. Required status checks or branch protection rules are blocking it',
      );
      return;
    }

    const instructions = await getFileContent({
      owner,
      repo,
      path: '.github/hamster-rules/squash-merge.md',
      octokit: context.octokit,
      log: app.log,
    });

    const summary = await summarizeText(
      pullRequest.title,
      pullRequest.body || '',
      notes,
      instructions,
      app.log,
    );

    if (!summary) {
      await createComment(
        '⚠️ Failed to generate commit message for squash merge. Please check your .github/hamster-rules/squash-merge.md and try again.',
      );
      return;
    }

    await context.octokit.pulls.merge({
      owner,
      repo,
      pull_number: pullNumber,
      merge_method: 'squash',
      commit_title: summary.title,
      commit_message: summary.message,
    });
  });
};
