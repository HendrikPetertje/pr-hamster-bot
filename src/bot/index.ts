import type { Probot } from 'probot';
import { onSquashMerge } from './actions/squash-merge.js';

export default (app: Probot) => {
  // app.on('issues.opened', async (context) => {
  //   const issueComment = context.issue({
  //     body: 'Thanks for opening this issue!',
  //   });
  //   await context.octokit.issues.createComment(issueComment);
  // });

  // PR Actions
  onSquashMerge(app);
};
