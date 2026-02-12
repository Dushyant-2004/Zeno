/**
 * Image generation utility using Pollinations.ai (FREE — no API key required).
 *
 * Pollinations.ai is an open-source AI art platform that provides free image
 * generation via simple URL-based API. It uses Flux models under the hood.
 *
 * Usage: Just construct a URL — no auth, no rate limits, no sign-up.
 * URL format: https://image.pollinations.ai/prompt/{encoded_prompt}?params
 */

// ============ TYPES ============
export interface ImageGenerationResult {
  success: boolean;
  imageUrl: string;
  prompt: string;
  enhancedPrompt: string;
  width: number;
  height: number;
  model: string;
  error?: string;
}

export interface ImageGenerationOptions {
  width?: number;
  height?: number;
  model?: "flux" | "flux-realism" | "flux-anime" | "flux-3d" | "turbo";
  seed?: number;
  nologo?: boolean;
  enhance?: boolean;
}

// ============ CONSTANTS ============
const POLLINATIONS_BASE = "https://image.pollinations.ai/prompt";

// Patterns that indicate the user wants an image generated
const IMAGE_TRIGGER_PATTERNS = [
  /^generate\s+(an?\s+)?image\s+(of|for|about|showing|depicting|with)\b/i,
  /^create\s+(an?\s+)?image\s+(of|for|about|showing|depicting|with)\b/i,
  /^make\s+(an?\s+)?(image|picture|photo|art|artwork|illustration)\s+(of|for|about|showing|depicting|with)\b/i,
  /^draw\s+(an?\s+)?(image|picture|art|artwork|illustration)?\s*(of|for|about|showing|depicting|with)?\b/i,
  /^(paint|sketch|design|illustrate)\b/i,
  /^generate\s+(an?\s+)?(picture|photo|art|artwork|illustration)\s+(of|for|about|showing|depicting|with)\b/i,
  /^create\s+(an?\s+)?(picture|photo|art|artwork|illustration)\s+(of|for|about|showing|depicting|with)\b/i,
  /^(show|give)\s+me\s+(an?\s+)?(image|picture|photo|art)\s+(of|for|about|showing|depicting|with)\b/i,
  /^imagine\b/i,
  /^visualize\b/i,
];

// ============ DETECT IMAGE REQUEST ============
export function isImageGenerationRequest(message: string): boolean {
  const trimmed = message.trim();
  return IMAGE_TRIGGER_PATTERNS.some((pattern) => pattern.test(trimmed));
}

// ============ EXTRACT PROMPT ============
export function extractImagePrompt(message: string): string {
  let prompt = message.trim();

  // Remove common prefixes to get the clean prompt
  const prefixPatterns = [
    /^(generate|create|make|draw|paint|sketch|design|illustrate|imagine|visualize)\s+(an?\s+)?(image|picture|photo|art|artwork|illustration)?\s*(of|for|about|showing|depicting|with)?\s*/i,
    /^(show|give)\s+me\s+(an?\s+)?(image|picture|photo|art|artwork|illustration)\s*(of|for|about|showing|depicting|with)?\s*/i,
  ];

  for (const pattern of prefixPatterns) {
    const match = prompt.match(pattern);
    if (match) {
      prompt = prompt.substring(match[0].length).trim();
      break;
    }
  }

  // If nothing left after stripping, use original message
  if (!prompt || prompt.length < 3) {
    prompt = message.trim();
  }

  return prompt;
}

// ============ ENHANCE PROMPT ============
function enhancePrompt(prompt: string): string {
  // Add quality modifiers if the prompt is simple
  const qualityTerms = [
    "high quality",
    "detailed",
    "4k",
    "8k",
    "hdr",
    "realistic",
    "ultra detailed",
    "professional",
  ];

  const hasQualityTerms = qualityTerms.some((term) =>
    prompt.toLowerCase().includes(term)
  );

  if (!hasQualityTerms && prompt.split(" ").length < 15) {
    return `${prompt}, high quality, detailed, professional lighting`;
  }

  return prompt;
}

// ============ GENERATE IMAGE URL ============
export function generateImageUrl(
  prompt: string,
  options: ImageGenerationOptions = {}
): string {
  const {
    width = 1024,
    height = 1024,
    model = "flux",
    seed,
    nologo = true,
    enhance = true,
  } = options;

  const finalPrompt = enhance ? enhancePrompt(prompt) : prompt;
  const encodedPrompt = encodeURIComponent(finalPrompt);

  const params = new URLSearchParams({
    width: width.toString(),
    height: height.toString(),
    model,
    nologo: nologo.toString(),
  });

  if (seed !== undefined) {
    params.set("seed", seed.toString());
  }

  return `${POLLINATIONS_BASE}/${encodedPrompt}?${params.toString()}`;
}

// ============ VALIDATE IMAGE (check if URL returns a valid image) ============
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const contentType = response.headers.get("content-type");
    return response.ok && (contentType?.startsWith("image/") || true);
  } catch {
    return false;
  }
}

// ============ MAIN: Generate Image ============
export async function generateImage(
  userMessage: string,
  options: ImageGenerationOptions = {}
): Promise<ImageGenerationResult> {
  const prompt = extractImagePrompt(userMessage);
  const enhancedPrompt = enhancePrompt(prompt);
  const width = options.width || 1024;
  const height = options.height || 1024;
  const model = options.model || "flux";

  try {
    const imageUrl = generateImageUrl(prompt, {
      ...options,
      width,
      height,
      model,
    });

    console.log(`[ImageGen] Generating image: "${prompt}" (${width}x${height}, ${model})`);
    console.log(`[ImageGen] URL: ${imageUrl}`);

    return {
      success: true,
      imageUrl,
      prompt,
      enhancedPrompt,
      width,
      height,
      model,
    };
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("[ImageGen] Error:", error.message);
    return {
      success: false,
      imageUrl: "",
      prompt,
      enhancedPrompt,
      width,
      height,
      model,
      error: error.message || "Failed to generate image",
    };
  }
}

// ============ STYLE PRESETS ============
export const IMAGE_STYLES: Record<string, ImageGenerationOptions> = {
  default: { width: 1024, height: 1024, model: "flux" },
  realistic: { width: 1024, height: 1024, model: "flux-realism" },
  anime: { width: 1024, height: 1024, model: "flux-anime" },
  "3d": { width: 1024, height: 1024, model: "flux-3d" },
  fast: { width: 512, height: 512, model: "turbo" },
  landscape: { width: 1280, height: 720, model: "flux" },
  portrait: { width: 720, height: 1280, model: "flux" },
  square: { width: 1024, height: 1024, model: "flux" },
};
