'use server';
/**
 * @fileOverview An AI flow for automatically generating tags for lost and found items.
 *
 * - generateTags - A function that analyzes an item's description and photo to generate relevant tags.
 * - GenerateTagsInput - The input type for the generateTags function.
 * - GenerateTagsOutput - The return type for the generateTags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTagsInputSchema = z.object({
  description: z.string().describe('The detailed description of the item.'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "An optional photo of the item, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateTagsInput = z.infer<typeof GenerateTagsInputSchema>;

const GenerateTagsOutputSchema = z.object({
  tags: z
    .array(z.string())
    .describe(
      'A list of 3-7 relevant, concise, and common tags for the item. Tags should be lowercase.'
    ),
});
export type GenerateTagsOutput = z.infer<typeof GenerateTagsOutputSchema>;

export async function generateTags(input: GenerateTagsInput): Promise<GenerateTagsOutput> {
  return generateTagsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTagsPrompt',
  input: {schema: GenerateTagsInputSchema},
  output: {schema: GenerateTagsOutputSchema},
  prompt: `You are an expert at categorizing items. Analyze the following item description and image.
Generate a list of 3 to 7 relevant tags (e.g., 'backpack', 'blue', 'leather', 'keys', 'phone').
Return tags as a JSON array of lowercase strings without special characters.

Description: {{{description}}}
{{#if photoDataUri}}
Photo: {{media url=photoDataUri}}
{{/if}}
`,
});

const generateTagsFlow = ai.defineFlow(
  {
    name: 'generateTagsFlow',
    inputSchema: GenerateTagsInputSchema,
    outputSchema: GenerateTagsOutputSchema,
  },
  async (input) => {
    // If there is no photo, remove the property so the prompt doesn't see an empty string
    if (!input.photoDataUri) {
        delete input.photoDataUri;
    }

    const {output} = await prompt(input);
    return output!;
  }
);
