/**
 * gemini.ts
 *
 * This file provides a `summarizeText` function. By default it returns a deterministic
 * mock summary so you can work on the frontend quickly. The file includes a commented
 * Vertex AI / Gemini Node.js snippet (based on Vertex AI docs) that you can enable
 * once you set up GCP credentials.
 */

export async function summarizeText(text: string): Promise<string> {
    // --- Mock summarizer (fast for development) ---
    if (process.env.DISABLE_GEMINI === 'true' || !process.env.GCP_PROJECT_ID) {
        // Simple extractive mock: first 2 sentences.
        const sentences = text.match(/[^.!?]+[.!?]?/g) ?? [text];
        return `Mock summary: ${sentences.slice(0, 2).join(' ').trim()}`;
    }

    // --- Example: Vertex AI (Gemini) Node.js usage ---
    // The real implementation requires setting up GCP credentials and installing
    // the Vertex AI client. Below is a snippet you can adapt.

    /*
    // 1) Install: npm i @google-cloud/aiplatform
    import {PredictionServiceClient} from '@google-cloud/aiplatform';
  
    const client = new PredictionServiceClient();
    const project = process.env.GCP_PROJECT_ID;
    const location = process.env.GCP_LOCATION ?? 'us-central1';
    const model = `projects/${project}/locations/${location}/publishers/google/models/gemini-1.5-mini`;
  
    const response = await client.predict({
      endpoint: model,
      instances: [
        { content: text }
      ]
    });
  
    // parse response depending on the SDK shape
    return response[0]?.predictions?.[0]?.content ?? 'No summary';
    */

    // Fallback if user didn't turn on real Vertex AI usage
    return `Mock summary: ${text.slice(0, 200)}...`;
}