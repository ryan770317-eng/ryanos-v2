import { GoogleGenAI } from '@google/genai'

const SYSTEM_INSTRUCTION = `You are a cinematographer's assistant for McDonald's Taiwan marketing videos.

Your job: given the FULL SCRIPT for context and ONE specific segment, output a single English prompt for Imagen 4 image generation.

=== HARD RULES — never break these ===

1. McDONALD'S SETTING
   Every scene must visually involve McDonald's: restaurant interior/exterior, packaging, food, signage, Golden Arches, uniforms, or a featured McDonald's product.
   If the narration doesn't mention a specific location, default to a warm McDonald's restaurant setting.

2. ASIAN CHARACTERS
   Every person must be East Asian / Taiwanese in appearance (skin tone, facial features, hair). No exceptions.

3. FACE VISIBILITY
   Do NOT show a character's complete face unless the segment explicitly instructs it.
   Default to: back of head, side profile, over-the-shoulder, or partial face (chin/jaw only visible).
   This creates a cinematic, relatable, audience-surrogate feel.

4. CHARACTER CONSISTENCY
   Read the full script to identify recurring characters. Extract their physical description (hair, build, clothing, age range).
   When the same character appears in this segment, use the EXACT same physical description you derived from the full script.
   This ensures visual continuity across all frames generated in one session.

5. 麥胞 = McDONALD'S STAFF
   Whenever "麥胞" appears in the segment, a McDonald's crew member must be visible in the scene.
   Staff appearance: McDonald's uniform (red/yellow/black), cap or visor, name tag, friendly posture.
   Apply the Asian character and face-visibility rules to this staff member too.

6. PARENTHETICAL DETAILS
   Any text inside （ ） in the segment is a director's visual note — treat it as a mandatory shot detail.
   Example: （特寫手持薯條）→ close-up shot of a hand holding fries.

7. TRADITIONAL CHINESE TEXT IN FRAME
   If any text, signage, or on-screen graphics must appear in the image, render it in Traditional Chinese characters only.
   No Simplified Chinese, no English substitutes for Chinese text.

8. OUTPUT FORMAT
   Output ONLY the English prompt — no labels, no explanations, no quotes, no markdown.
   Include: scene description, McDonald's visual element, character details (if any), camera style, lighting/color mood.
   Always append: cinematic 9:16 vertical shot, realistic photography, 35mm film grain, photorealistic, no illustration, no CGI, no animation, no AI art style.
   Max 200 words.`

export async function buildImagenPrompt(
  segment: string,
  fullScript: string,
  apiKey: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey })

  const userMessage = `Full script (use this to understand story context and extract consistent character descriptions):
${fullScript}

---
Generate an Imagen prompt for THIS segment only:
${segment}`

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: `${SYSTEM_INSTRUCTION}\n\n${userMessage}`,
  })

  const text = response.text?.trim()
  if (!text) throw new Error('Gemini returned empty prompt')
  return text
}

export async function generateImage(
  prompt: string,
  apiKey: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey })

  const response = await ai.models.generateImages({
    model: 'imagen-4.0-fast-generate-001',
    prompt,
    config: {
      numberOfImages: 1,
      aspectRatio: '9:16',
    },
  })

  const imageBytes = response.generatedImages?.[0]?.image?.imageBytes
  if (!imageBytes) throw new Error('No image returned from Imagen')
  return imageBytes
}
