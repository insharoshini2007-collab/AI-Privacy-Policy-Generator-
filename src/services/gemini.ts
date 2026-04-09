import { GoogleGenAI, Type } from "@google/genai";
import { BusinessProfile, GeneratedPolicy } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateLegalDocument(
  profile: BusinessProfile,
  type: 'Privacy Policy' | 'Terms of Service'
): Promise<GeneratedPolicy> {
  const prompt = `
    Generate a comprehensive ${type} for the following business:
    Company Name: ${profile.companyName}
    Website: ${profile.websiteUrl}
    Industry: ${profile.industry}
    Data Collected: ${profile.dataCollected.join(", ")}
    Data Usage: ${profile.dataUsage.join(", ")}
    Third Parties: ${profile.thirdParties.join(", ")}
    Jurisdictions: ${profile.jurisdictions.join(", ")}
    Contact: ${profile.contactEmail}, ${profile.physicalAddress}

    The document must be legally robust, professional, and specifically adapted to the selected jurisdictions (${profile.jurisdictions.join(", ")}).
    Include sections for:
    1. Introduction
    2. Information Collection
    3. Use of Information
    4. Data Sharing and Disclosure
    5. User Rights (specifically mentioning ${profile.jurisdictions.join(" and ")})
    6. Security
    7. Cookies and Tracking
    8. Changes to this Policy
    9. Contact Information

    Format the output in clean Markdown.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      temperature: 0.7,
      topP: 0.95,
      topK: 64,
    },
  });

  return {
    type,
    content: response.text || "Failed to generate content.",
    jurisdiction: profile.jurisdictions[0] || 'Global',
    lastUpdated: new Date().toISOString(),
  };
}
