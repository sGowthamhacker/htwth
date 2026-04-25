import { GoogleGenAI, Type } from "@google/genai";
import { faqData } from '../data/faq';
// FIX: Import `Severity` type for the new function's return type.
import { ChatTurn, Severity } from '../types';

/**
 * Returns the correct base path for backend functions depending on the hosting platform.
 */
const getApiPath = (functionName: string): string => {
    const isNetlify = window.location.hostname.includes('netlify.app');
    const isVercel = window.location.hostname.includes('vercel.app');
    
    if (isNetlify) return `/.netlify/functions/${functionName}`;
    if (isVercel) return `/api/${functionName}`;
    
    // Default fallback for preview environment or local dev
    return `/api/${functionName}`;
};

// --- New API Key Fetching Logic ---
let cachedApiKey: string | null = null;
let keyPromise: Promise<string> | null = null;

const fetchAndCacheApiKey = (): Promise<string> => {
    if (cachedApiKey) {
        return Promise.resolve(cachedApiKey);
    }
    if (keyPromise) {
        return keyPromise;
    }

    keyPromise = new Promise(async (resolve) => {
        try {
            // The dynamic endpoint
            const response = await fetch(getApiPath('get-api-key'));
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch API key: ${response.status} ${response.statusText}. Response: ${errorText}`);
            }
            const data = await response.json();
            if (!data.apiKey) {
                throw new Error('API key not found in server response.');
            }
            cachedApiKey = data.apiKey;
            console.log("Successfully fetched and cached API key.");
            resolve(cachedApiKey!);
        } catch (error) {
            console.warn("Could not fetch API Key from the server. Using hardcoded fallback.", error);
            // Fallback key provided by the user in the migration chat
            cachedApiKey = "AIzaSyBujCiuNzlUvP1q561-I5TboqtCzJhZc3Y";
            resolve(cachedApiKey);
        }
    });
    
    return keyPromise;
};

// --- End New Logic ---


// Lazily initialize the AI client only when a valid API key is present.
let ai: GoogleGenAI | null = null;

const getAiClient = async (): Promise<GoogleGenAI | null> => {
  const apiKey = await fetchAndCacheApiKey();

  // Only create a client if we have a real key that isn't a placeholder/error.
  if (apiKey && apiKey !== "FETCH_FAILED_API_KEY") {
    // Singleton pattern: create client only once, or re-init if key changes.
    if (!ai || (ai as any).apiKey !== apiKey) {
      ai = new GoogleGenAI({ apiKey });
    }
    return ai;
  }
  return null; // Return null if no valid key, allowing functions to fallback to mock data.
};

export interface BotResponse {
    is_related_to_faq: boolean;
    suggested_questions: string[] | null;
    direct_response?: string;
    next_flow_state?: 'idle' | 'awaiting_feedback' | 'awaiting_continue' | 'awaiting_rating';
    show_categories?: boolean;
}

export const getSupportBotResponse = async (history: ChatTurn[]): Promise<BotResponse> => {
  const aiClient = await getAiClient();
  const userPrompt = history.length > 0 ? history[history.length - 1].text.toLowerCase().trim() : '';

  // Keyword-based conversational shortcuts
  switch (userPrompt) {
      case 'hi':
      case 'hii':
      case 'hello':
          return {
              is_related_to_faq: true,
              suggested_questions: [],
              direct_response: "Hello there! How can I assist you with the platform today?",
              next_flow_state: 'idle',
              show_categories: true,
          };
      case 'help':
          return {
              is_related_to_faq: true,
              suggested_questions: [],
              direct_response: "Of course! I'm here to help. What can I assist you with? You can ask a question or select from the categories below.",
              next_flow_state: 'idle',
              show_categories: true,
          };
      case 'ok':
      case 'okay':
      case 'got it':
          return {
              is_related_to_faq: false,
              suggested_questions: null,
              direct_response: "Great! Do you have any other questions?",
              next_flow_state: 'awaiting_continue',
              show_categories: false,
          };
      case 'bye':
      case 'goodbye':
          return {
              is_related_to_faq: false,
              suggested_questions: null,
              direct_response: "Goodbye! Have a great day.",
              next_flow_state: 'idle',
              show_categories: false,
          };
  }
  
  if (!aiClient) {
      // This is the mock response logic, now triggered when no valid API key is found.
      if (userPrompt.includes('password')) {
          return { is_related_to_faq: true, suggested_questions: ["I forgot my password, how do I reset it?"], show_categories: false };
      }
      return { is_related_to_faq: false, suggested_questions: null, show_categories: false };
  }

  const allFaqQuestions = Object.keys(faqData);

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a classification AI for a support chatbot. Analyze the user's latest question and determine if it's related to a predefined list of FAQs about a web application.

**FAQ Topics:** Account & Login, Profile & Settings, Features, 2FA, General platform questions.

**Full FAQ Question List:**
${allFaqQuestions.map(q => `- "${q}"`).join('\n')}

**User's latest question:** "${userPrompt}"

**Instructions:**
1.  Read the user's question.
2.  If the question is about the web application and its features (accounts, profiles, security, etc.), set \`is_related_to_faq\` to \`true\`.
3.  If \`is_related_to_faq\` is \`true\`, perform a **semantic search** to find all questions from the list that are conceptually related to the user's query. Populate \`suggested_questions\` with an array of these exact question strings.
4.  For broad, single-word keywords like "password", "email", or "account", you should identify *all* related topics. For example, a query for "password" should match questions about "forgot password", "reset password", and security features like "2FA", even if the word "password" is not in the question itself.
5.  If it's related but you can't find any specific matches, return an empty array for \`suggested_questions\`.
6.  If the question is general chit-chat or off-topic (e.g., "what is the meaning of life?", "who are you?", "tell me a joke"), set \`is_related_to_faq\` to \`false\` and \`suggested_questions\` to \`null\`.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            is_related_to_faq: {
              type: Type.BOOLEAN,
              description: "Is the user's question related to the provided FAQ list topics?"
            },
            suggested_questions: {
              type: Type.ARRAY,
              description: "An array of all relevant FAQ questions from the list. Can be null or empty.",
              items: {
                type: Type.STRING
              }
            }
          },
          required: ["is_related_to_faq", "suggested_questions"]
        }
      }
    });

    const jsonString = response.text.trim();
    const result: Omit<BotResponse, 'show_categories'> = JSON.parse(jsonString);
    
    if (result.suggested_questions && Array.isArray(result.suggested_questions)) {
        // Filter out any questions Gemini might have hallucinated
        result.suggested_questions = result.suggested_questions.filter(q => {
            if (allFaqQuestions.includes(q)) {
                return true;
            } else {
                console.warn("Gemini suggested a question that is not in the FAQ list:", q);
                return false;
            }
        });
    }

    const show_categories = result.is_related_to_faq && (!result.suggested_questions || result.suggested_questions.length === 0);
    return { ...result, show_categories, next_flow_state: 'idle' };

  } catch (error) {
    console.error("Error getting structured support bot response from Gemini API:", error);
    return { is_related_to_faq: false, suggested_questions: null };
  }
};

// FIX: Add the missing `analyzeWriteupDetails` function.
export const analyzeWriteupDetails = async (content: string): Promise<{ severity: Severity; tags: string[] }> => {
  const aiClient = await getAiClient();
  if (!aiClient) {
      // Mock response for offline/keyless mode
      console.log("MOCK: Analyzing writeup details.");
      return { severity: 'Medium', tags: ['mock-tag', 'security'] };
  }

  try {
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a cybersecurity analyst reviewing a vulnerability writeup. Your task is to determine the severity and suggest relevant tags.

**Instructions:**
1.  Read the provided writeup content carefully.
2.  Determine the severity of the vulnerability. The severity **must** be one of these exact values: 'Low', 'Medium', 'High', 'Critical'.
3.  Suggest 3 to 5 concise, relevant tags. Tags should be lowercase and relate to the vulnerability type (e.g., 'xss', 'idor'), technology (e.g., 'javascript', 'sql'), or impact (e.g., 'data-leak', 'rce').

**Writeup Content:**
"${content}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            severity: {
              type: Type.STRING,
              description: "The severity of the vulnerability. Must be one of: 'Low', 'Medium', 'High', 'Critical'."
            },
            tags: {
              type: Type.ARRAY,
              description: "An array of 3-5 relevant tags for the writeup.",
              items: {
                type: Type.STRING
              }
            }
          },
          required: ["severity", "tags"]
        }
      }
    });

    const jsonString = response.text.trim();
    const result = JSON.parse(jsonString);
    
    // Validate severity
    const validSeverities: Severity[] = ['Low', 'Medium', 'High', 'Critical'];
    if (!validSeverities.includes(result.severity)) {
        console.warn(`Gemini returned an invalid severity: '${result.severity}'. Defaulting to 'Medium'.`);
        result.severity = 'Medium';
    }

    return result as { severity: Severity; tags: string[] };

  } catch (error) {
    console.error("Error analyzing writeup details with Gemini API:", error);
    throw new Error("Failed to analyze writeup with AI. Please try again or set values manually.");
  }
};