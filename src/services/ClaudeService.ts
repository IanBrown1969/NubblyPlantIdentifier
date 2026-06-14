import axios, { AxiosError } from 'axios';
import { Plant } from '../models/PlantModel';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const CLAUDE_MODEL = 'claude-sonnet-4-6'; // Current stable Sonnet — supports vision inputs

// High-fidelity structured system prompt instructing Claude to return clean JSON
const SYSTEM_PROMPT = `You are a professional master botanist and plant doctor. Your task is to identify the plant shown in the image and provide a highly detailed care sheet and troubleshooting guide.
You must respond with a SINGLE, RAW, VALID JSON object. Do not output any chat prefix, suffix, conversational filler, or introductory remarks. The JSON structure must strictly match this shape:

{
  "commonName": "Common Name of Plant",
  "botanicalName": "Botanical genus and species",
  "family": "Botanical Family Name",
  "description": "A beautiful, engaging 2-sentence description of the plant's history and aesthetic traits.",
  "waterIntervalDays": 7,
  "sunlight": "Short description of sunlight requirements",
  "temperature": "Ideal temperature ranges, e.g., 18°C - 24°C",
  "isPetSafe": true,
  "careGuide": {
    "watering": "Highly detailed instructions on when and how to water, including soil moisture tests and seasonal adjustments.",
    "sunlight": "In-depth lighting placement guide, detailing direct vs indirect sun positions.",
    "temperature": "Advice on humidity levels, misting, draft protections, and seasonal heat guidelines.",
    "soil": "Specific recommendations for ideal organic soil mixes, perlite drainage ratios, and potting additions.",
    "fertilizer": "Active feeding schedule protocols for active spring/summer seasons vs winter dormancy.",
    "troubleshooting": [
      {
        "symptom": "Visual leaf symptom (e.g. Yellow leaves)",
        "cause": "Underlying biological reason",
        "solution": "Active, actionable steps to solve the issue"
      },
      {
        "symptom": "Visual leaf symptom (e.g. Brown tips)",
        "cause": "Underlying biological reason",
        "solution": "Active, actionable steps to solve the issue"
      }
    ]
  }
}`;

const DIAGNOSTIC_SYSTEM_PROMPT = `You are a professional master botanist and plant doctor. Your task is to identify the plant shown in the image, analyze its foliage health for any signs of diseases, pests, fungal infections, or nutrient deficiencies, and provide a highly detailed care sheet and clinical diagnostic treatment plan.
You must respond with a SINGLE, RAW, VALID JSON object. Do not output any chat prefix, suffix, conversational filler, or introductory remarks. The JSON structure must strictly match this shape:

{
  "commonName": "Common Name of Plant",
  "botanicalName": "Botanical genus and species",
  "family": "Botanical Family Name",
  "description": "A beautiful, engaging 2-sentence description of the plant's history and aesthetic traits.",
  "waterIntervalDays": 7,
  "sunlight": "Short description of sunlight requirements",
  "temperature": "Ideal temperature ranges, e.g., 18°C - 24°C",
  "isPetSafe": true,
  "healthStatus": "Diseased",
  "diagnosedIssue": "Specific disease/pest name (e.g., Powdery Mildew, Spider Mites, Nitrogen Deficiency, Root Rot)",
  "confidencePct": 92,
  "symptomDescription": "Detailed analysis of leaf spots, margins, yellowing, or insect clusters seen in the visual image.",
  "organicTreatment": "3-step organic remedy plan to cure and heal the plant.",
  "careGuide": {
    "watering": "Highly detailed instructions on when and how to water...",
    "sunlight": "In-depth lighting placement guide...",
    "temperature": "Advice on humidity levels, misting, draft protections...",
    "soil": "Specific recommendations for ideal organic soil mixes...",
    "fertilizer": "Active feeding schedule protocols...",
    "troubleshooting": [
      {
        "symptom": "Visual leaf symptom",
        "cause": "Underlying biological reason",
        "solution": "Active, actionable steps to solve the issue"
      }
    ]
  }
}`;

export const ClaudeService = {
  /**
   * Cleans Claude's response text and extracts the JSON block.
   * Handles markdown JSON block wrapping (```json ... ```) safely.
   */
  extractJson(text: string): any {
    try {
      // 1. Attempt direct parsing
      return JSON.parse(text.trim());
    } catch {
      try {
        // 2. Look for markdown code fence blocks
        const matches = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
        if (matches && matches[1]) {
          return JSON.parse(matches[1].trim());
        }

        // 3. Fallback: find outer braces { ... }
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          const jsonSub = text.substring(start, end + 1);
          return JSON.parse(jsonSub.trim());
        }
      } catch (innerErr) {
        console.error('[ClaudeService] Secondary JSON extraction failed:', innerErr);
      }
      throw new Error('Claude AI response did not contain a valid JSON plant catalog profile.');
    }
  },

  /**
   * Validates the Claude API key by performing a lightweight call to the Anthropic API.
   */
  async validateApiKey(apiKey: string): Promise<{ success: boolean; error?: string }> {
    if (!apiKey || apiKey.trim() === '') {
      return { success: true }; // Empty key triggers simulator playback, which is valid for offline dev
    }
    if (apiKey === 'MOCK_DEVELOPER_KEY') {
      return { success: true }; // Mock developer bypass key is valid
    }

    try {
      console.log('[ClaudeService] Live-validating Anthropic API Key...');
      await axios.post(
        ANTHROPIC_API_URL,
        { model: CLAUDE_MODEL, max_tokens: 1, messages: [{ role: 'user', content: 'ping' }] },
        {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': ANTHROPIC_VERSION,
            'content-type': 'application/json',
            'dangerously-allow-browser': 'true',
          },
        }
      );
      return { success: true };
    } catch (e: unknown) {
      const axiosErr = e as AxiosError<any>;
      if (axiosErr.response) {
        const { status, data } = axiosErr.response;
        if (status === 401) {
          return { success: false, error: 'Invalid API Key (Unauthorized)' };
        }
        if (status === 400) {
          // Bad request means auth passed but request was malformed — key is valid
          if (data?.error?.type === 'authentication_error') {
            return { success: false, error: 'Authentication Failed: Invalid API Key' };
          }
          if (data?.error?.type === 'invalid_request_error' && data?.error?.message?.includes('API key')) {
            return { success: false, error: data.error.message };
          }
          return { success: true };
        }
        if (status === 403) {
          return { success: false, error: `Key Valid, but Forbidden: ${data?.error?.message || ''}` };
        }
        return { success: false, error: `Validation Failed (${status}): ${data?.error?.message || axiosErr.message}` };
      }
      // Network / CORS failure — fall back to structural key format check
      console.warn('[ClaudeService] Key validation network/CORS error:', axiosErr.message);
      const trimmedKey = apiKey.trim();
      if (trimmedKey.startsWith('sk-ant-') && trimmedKey.length >= 40) {
        console.log('[ClaudeService] Network check failed but key format is structurally valid. Bypassing.');
        return { success: true };
      }
      return {
        success: false,
        error: 'Network connection failed. Ensure internet access and that your key starts with sk-ant-.',
      };
    }
  },

  /**
   * Connects to Anthropic API using visual payloads.
   * If apiKey is omitted or matches simulation, triggers local mock botanist analysis.
   */
  async identifyPlant(
    base64Image: string,
    mimeType: string = 'image/jpeg',
    apiKey: string | null,
    mode: 'identity' | 'diagnosis' = 'identity'
  ): Promise<Omit<Plant, 'id' | 'photoUri'> & {
    healthStatus?: 'Healthy' | 'Diseased';
    diagnosedIssue?: string;
    confidencePct?: number;
    symptomDescription?: string;
    organicTreatment?: string;
  }> {
    // 1. Trigger Simulation Pipeline if API Key is missing, set to mock keys, or if no image data is supplied
    if (!apiKey || apiKey === 'MOCK_DEVELOPER_KEY' || apiKey.trim() === '' || !base64Image || base64Image.trim() === '') {
      console.log(`[ClaudeService] Triggering simulated offline botanist pipeline in mode: ${mode}`);
      await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate analysis delay
      return this.generateSimulatedPlant(mode);
    }

    try {
      console.log('[ClaudeService] Initiating visual API request to Anthropic Claude...');

      // Clean and sanitize base64 string, stripping any data URI prefix if present
      let cleanedBase64 = base64Image;
      if (base64Image.includes(';base64,')) {
        cleanedBase64 = base64Image.split(';base64,')[1];
      }

      const { data: payload } = await axios.post(
        ANTHROPIC_API_URL,
        {
          model: CLAUDE_MODEL,
          max_tokens: 4096,
          system: mode === 'diagnosis' ? DIAGNOSTIC_SYSTEM_PROMPT : SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: { type: 'base64', media_type: mimeType, data: cleanedBase64 },
                },
                {
                  type: 'text',
                  text: mode === 'diagnosis'
                    ? 'Analyze this plant photo for visual symptoms of diseases, leaf spots, nutrient deficiencies, or pests. Return JSON.'
                    : 'Analyze this plant photo and return its details according to the requested JSON format.',
                },
              ],
            },
          ],
        },
        {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': ANTHROPIC_VERSION,
            'content-type': 'application/json',
            'dangerously-allow-browser': 'true',
          },
          timeout: 90000, // 90-second timeout — large base64 images need time on slower connections
        }
      );

      const rawText = payload.content[0]?.text;
      
      if (!rawText) {
        throw new Error('Received empty text content from Claude AI.');
      }

      const plantData = this.extractJson(rawText);
      
      // Map and validate required JSON properties
      return {
        commonName: plantData.commonName || 'Unknown Plant',
        botanicalName: plantData.botanicalName || 'Unknown Species',
        family: plantData.family || 'Unknown Family',
        description: plantData.description || 'Successfully scanned houseplant.',
        waterIntervalDays: Number(plantData.waterIntervalDays) || 7,
        sunlight: plantData.sunlight || 'Medium Indirect Sun',
        temperature: plantData.temperature || '18°C - 24°C',
        isPetSafe: Boolean(plantData.isPetSafe),
        healthStatus: plantData.healthStatus || 'Healthy',
        diagnosedIssue: plantData.diagnosedIssue || undefined,
        confidencePct: plantData.confidencePct ? Number(plantData.confidencePct) : undefined,
        symptomDescription: plantData.symptomDescription || undefined,
        organicTreatment: plantData.organicTreatment || undefined,
        careGuide: {
          watering: plantData.careGuide?.watering || 'Water when soil is dry.',
          sunlight: plantData.careGuide?.sunlight || 'Indirect light.',
          temperature: plantData.careGuide?.temperature || 'Protect from frost.',
          soil: plantData.careGuide?.soil || 'Well draining soil.',
          fertilizer: plantData.careGuide?.fertilizer || 'Fertilize in spring.',
          troubleshooting: plantData.careGuide?.troubleshooting || [
            { symptom: 'Drooping', cause: 'Thirsty', solution: 'Water thoroughly.' }
          ]
        }
      };
    } catch (error: unknown) {
      const axiosErr = error as AxiosError<any>;
      if (axiosErr.code === 'ECONNABORTED' || axiosErr.message?.includes('timeout') || axiosErr.message === 'Network Error') {
        throw new Error('The scan request timed out. Your image may be too large or your internet connection is slow. Please try again.');
      }
      if (axiosErr.response) {
        const errMsg = axiosErr.response.data?.error?.message || axiosErr.message;
        console.error('[ClaudeService] Anthropic API error:', errMsg);
        throw new Error(`Anthropic Claude API Error: ${axiosErr.response.status} - ${errMsg}`);
      }
      console.error('[ClaudeService] Error during visual identification:', error);
      throw error;
    }
  },

  /**
   * Generates extremely realistic mock plant structures for quick development bypass and simulator scanning.
   */
  generateSimulatedPlant(mode: 'identity' | 'diagnosis' = 'identity'): Omit<Plant, 'id' | 'photoUri'> & {
    healthStatus?: 'Healthy' | 'Diseased';
    diagnosedIssue?: string;
    confidencePct?: number;
    symptomDescription?: string;
    organicTreatment?: string;
  } {
    const mockPlants = [
      {
        commonName: 'Fiddle Leaf Fig',
        botanicalName: 'Ficus lyrata',
        family: 'Moraceae',
        description: 'A popular focal-point plant featuring massive, glossy violin-shaped leaves. Beautiful and elegant, it rewards consistent placement and watering.',
        waterIntervalDays: 10,
        sunlight: 'Bright Consistent Light',
        temperature: '18°C - 26°C',
        isPetSafe: false,
        pruningMonth: 4, // April
        fertilizingMonth: 5, // May
        careGuide: {
          watering: 'Water when the top 2 inches of soil feel dry. Pour water evenly around the trunk until it drains, then empty the collection saucer.',
          sunlight: 'Needs abundant, consistent bright indirect light. Rotate the plant 90 degrees every month to ensure balanced leaf growth and avoid leaning.',
          temperature: 'Loves constant temperatures and high humidity. Protect from drafty doorways, windows, and heaters. Dust leaves regularly to assist photosynthesis.',
          soil: 'Use a premium, rich potting mix that retains nutrients but incorporates coarse sand and perlite to maintain drainage paths.',
          fertilizer: 'Feed once every 3 weeks from spring through late summer using a high-nitrogen foliage fertilizer. Do not feed in autumn or winter.',
          troubleshooting: [
            {
              symptom: 'Dropping green leaves',
              cause: 'Cold drafts, relocation stress, or low light',
              solution: 'Find a bright, warm location away from doors or vents, and avoid moving the plant once it stabilizes.'
            },
            {
              symptom: 'Large brown spots in center of leaves',
              cause: 'Root suffocation from overwatering',
              solution: 'Verify that the pot has drainage holes and is not sitting in pooled water. Reduce watering frequency and let the soil dry out more.'
            }
          ]
        }
      },
      {
        commonName: 'Jade Plant',
        botanicalName: 'Crassula ovata',
        family: 'Crassulaceae',
        description: 'A charming, tree-like succulent boasting plump glossy jade-green leaves. In Asian cultures, it is considered a symbol of good luck and financial wealth.',
        waterIntervalDays: 15,
        sunlight: 'Bright Direct Light',
        temperature: '15°C - 27°C',
        isPetSafe: false,
        pruningMonth: 5, // May
        fertilizingMonth: 6, // June
        careGuide: {
          watering: 'Allows soil to dry completely between waterings. Leaves will feel soft and slightly wrinkled when thirsty. Plump leaves indicate fully hydrated stems.',
          sunlight: 'Requires direct morning sunlight or very bright, filtered sun. Reddish margins on leaves indicate healthy sunlight absorption.',
          temperature: 'Tolerant of dry home air and high heat. Keep in average household spaces but protect from heavy winter frost (keep above 5°C).',
          soil: 'Requires an extremely free-draining sandy loam cactus mix with perlite or gravel bits to prevent damp root zones.',
          fertilizer: 'Feed lightly only twice a year in active seasons using water-soluble succulent foods. Do not feed during dormancy.',
          troubleshooting: [
            {
              symptom: 'Soft, yellow shriveled leaves',
              cause: 'Excessive water and root suffocation',
              solution: 'Immediately stop watering and allow the container to dry in a sunny window for 3 weeks. Remove affected translucent leaves.'
            },
            {
              symptom: 'Foliage that falls off',
              cause: 'Severe underwatering',
              solution: 'Give the jade plant a deep, soaking watering until the root ball is saturated. Check back in a week to see leaves plump.'
            }
          ]
        }
      },
      {
        commonName: 'Boston Fern',
        botanicalName: 'Nephrolepis exaltata',
        family: 'Nephrolepidaceae',
        description: 'A classic, feather-like weeping fern displaying vibrant green fronds. Adds instant forest elegance to rooms.',
        waterIntervalDays: 4,
        sunlight: 'Indirect Medium Shade',
        temperature: '16°C - 24°C',
        isPetSafe: true,
        pruningMonth: 3, // March
        fertilizingMonth: 4, // April
        careGuide: {
          watering: 'Demands highly consistent moisture. The potting mix must remain damp to the touch at all times. Never let the root ball dry out completely.',
          sunlight: 'Thrives in partial shade, filtered sun, or north-facing windows. Harsh direct afternoon rays will scorch and drop the delicate leaflets.',
          temperature: 'Extremely high humidity requirement. Enjoys regular daily misting, gravel trays, bathroom humidity, or humidifier placements.',
          soil: 'Rich organic peat-based mixture that holds consistent, uniform moisture while retaining micro-drainage channels.',
          fertilizer: 'Feed once a month with liquid indoor plant food diluted to half strength only in active spring/summer months.',
          troubleshooting: [
            {
              symptom: 'Massive shedding of brown crispy leaflets',
              cause: 'Low ambient humidity or dry soil',
              solution: 'Increase misting frequency immediately. Put the container on a pebble tray filled with water and give the soil a thorough top-water.'
            },
            {
              symptom: 'Weak, pale green slow growth',
              cause: 'Insufficient light or poor soil nutrients',
              solution: 'Move the fern to a slightly brighter room (filtered indirect light) and feed with liquid houseplant formula.'
            }
          ]
        }
      }
    ];

    // Pick a random plant from our simulator deck
    const randomIndex = Math.floor(Math.random() * mockPlants.length);
    const basePlant = mockPlants[randomIndex];

    // Merge diagnostic fields dynamically if diagnostic scanner mode is requested
    if (mode === 'diagnosis') {
      const diagnoses: Record<string, { diagnosedIssue: string; symptomDescription: string; organicTreatment: string }> = {
        'Fiddle Leaf Fig': {
          diagnosedIssue: 'Overwatering & Root Rot',
          symptomDescription: 'Expanding brown patches in foliage centers, wilting stems, and soil emitting a stagnant moisture odor.',
          organicTreatment: '1. Halt watering immediately. 2. Repot into a gravel-perlite potting mix. 3. Prune away all blackened root filaments using alcohol-cleaned shears.'
        },
        'Jade Plant': {
          diagnosedIssue: 'Thrips Infestation',
          symptomDescription: 'Silvery speckles across leaf cuticles overlaying microscopic black fecal deposits.',
          organicTreatment: '1. Mist leaf cuticles with dynamic organic neem oil weekly. 2. Quarantine to keep pest migration from neighboring indoor species. 3. Wipe leaves with insecticidal soap.'
        },
        'Boston Fern': {
          diagnosedIssue: 'Crispy Foliage (Low Humidity)',
          symptomDescription: 'Mass leaf shriveling and heavy shedding of dried brown leaflets.',
          organicTreatment: '1. Place container above pebble trays filled with standing water. 2. Relocate to humid bathroom microclimates. 3. Regularly mist fronds.'
        }
      };

      const diagnosisDetails = diagnoses[basePlant.commonName] || {
        diagnosedIssue: 'Nutrient Deficiency',
        symptomDescription: 'Interveinal yellowing (chlorosis) along mature foliage margins.',
        organicTreatment: '1. Flush dry soil mix. 2. Administer liquid iron chelate treatments. 3. Repot with organic compost.'
      };

      return {
        ...basePlant,
        healthStatus: 'Diseased',
        diagnosedIssue: diagnosisDetails.diagnosedIssue,
        confidencePct: 94,
        symptomDescription: diagnosisDetails.symptomDescription,
        organicTreatment: diagnosisDetails.organicTreatment
      };
    }

    return {
      ...basePlant,
      healthStatus: 'Healthy',
    };
  }
};
