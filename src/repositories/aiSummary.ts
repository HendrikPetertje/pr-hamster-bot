import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import type { Probot } from 'probot';
import { z } from 'zod';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SummaryResponse = z.object({
  title: z.string(),
  body: z.string(),
});

const SYSTEM_PROMPT = `
You are a helpful assistant that creates clean git squash-merge commit messages from pull request information.

Given a pull request title, body, and optional squash notes, produce a concise commit title and body.

Rules:
- If explicit rules are provided, follow them strictly to construct the title and body.
- If no rules are provided:
  - Rewrite the title in present-tense, imperative mood (e.g. "Fix bug" not "Fixed bug").
  - Extract meaningful content from the body for the commit body.
  - If there isn't enough information to write a useful body, return an empty string for body.
- Notes provided by the merger can add extra context or override parts of the summary.
- Keep the title concise (under 72 characters if possible).
- The body should be plain text, no markdown formatting unless otherwise specified in rules.
`.trim();

export const summarizeText = async (
  title: string,
  body: string,
  notes: string,
  rules: string | null,
  log: Probot['log'],
): Promise<{ title: string; message: string } | null> => {
  try {
    const userContent = [
      `<pr_title>${title}</pr_title>`,
      `<pr_body>\n${body || 'No body provided'}\n</pr_body>`,
      `<squash_notes>\n${notes || 'No notes provided'}\n</squash_notes>`,
      `<rules>\n${rules || 'No rules provided'}\n</rules>`,
    ]
      .filter(Boolean)
      .join('\n\n');

    const completion = await client.chat.completions.parse({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
      response_format: zodResponseFormat(SummaryResponse, 'summary'),
    });

    const parsed = completion.choices[0]?.message?.parsed;
    if (!parsed) {
      return null;
    }

    return {
      title: parsed.title,
      message: parsed.body,
    };
  } catch (error) {
    log.error(`❌ Error generating summary with OpenAI API: ${error}`);
    return null;
  }
};
