import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userEmail, issueTitle, issueDescription, activeTicketsList } = req.body;

    if (!userEmail || !issueTitle) {
      return res.status(400).json({ error: "userEmail and issueTitle are required." });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || "AIzaSyBujCiuNzlUvP1q561-I5TboqtCzJhZc3Y";

    const ai = new GoogleGenAI({ 
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });

    const activeSMTPUser = process.env.SMTP_USER || "writeup.portal@gmail.com";

    const systemInstruction = `You are an expert Backend Support Automation AI. Your job is to process incoming support requests from a web application and format them into perfectly structured email payloads for a Nodemailer/Gmail system.

Your primary goal is to maintain distinct conversation threads for the same user based on their specific problem, ensuring separate issues do not collapse or mix together.

Follow these strict operational rules:

1. ANALYZE THE REQUEST:
- Read the incoming payload containing: userEmail, issueTitle, issueDescription, and activeTicketsList.
- Determine if the new request belongs to an existing open ticket or if it requires a brand-new conversation thread.

2. RULES FOR A NEW TICKET:
- If the user is submitting a completely new problem, assign a unique Ticket ID (e.g., #TKT-101 or #TKT-782).
- Create a specific, structured Subject Line format: "[Ticket #ID] Issue Title".
- Set the action field to "CREATE_NEW_THREAD".
- Set hiddenFingerprintTarget to null.

3. RULES FOR EXISTING TICKETS (THREAD MAINTENANCE):
- Check the activeTicketsList. If the user has an open ticket regarding the SAME issue, you must append this submission to that specific thread.
- Retain the EXACT same Subject Line from the original ticket.
- Set the action field to "APPEND_TO_THREAD".
- Retrieve the stored Hidden-Fingerprint-ID (Message-ID/References) from that active ticket and inject it into the hiddenFingerprintTarget field.

4. MASKING & SECURITY:
- Set the Friendly Display Name to '"App Support Team"' to mask the original master Gmail.

OUTPUT FORMAT:
Always reply in a strict JSON format matching this schema:
{
  "action": "CREATE_NEW_THREAD" or "APPEND_TO_THREAD",
  "ticketId": "Generated or Matched ID",
  "subject": "The Exact Subject Line",
  "friendlyFrom": "\\"App Support Team\\" <${activeSMTPUser}>",
  "replyTo": "${activeSMTPUser}",
  "hiddenFingerprintTarget": "Stored Message-ID string or null",
  "emailBody": "Cleanly formatted email text body"
}`;

    const userPromptPayload = JSON.stringify({
      userEmail,
      issueTitle,
      issueDescription: issueDescription || '',
      activeTicketsList: activeTicketsList || []
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `Process this incoming support request payload and format the JSON response according to system instructions:\n${userPromptPayload}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            action: { type: Type.STRING, description: "CREATE_NEW_THREAD or APPEND_TO_THREAD" },
            ticketId: { type: Type.STRING, description: "Generated or Matched ID (e.g. #TKT-101)" },
            subject: { type: Type.STRING, description: "Structured Subject Line" },
            friendlyFrom: { type: Type.STRING, description: "Friendly display name with system email" },
            replyTo: { type: Type.STRING, description: "User reply-to email" },
            hiddenFingerprintTarget: { type: Type.STRING, description: "Stored Message-ID or null" },
            emailBody: { type: Type.STRING, description: "Formatted email body text" }
          },
          required: ["action", "ticketId", "subject", "friendlyFrom", "replyTo", "emailBody"]
        }
      }
    });

    const textRes = response.text;
    if (!textRes) throw new Error("AI returned empty response");
    
    let aiResult;
    try {
      aiResult = JSON.parse(textRes);
    } catch(err) {
      // attempt to sanitize
      const sanitized = textRes.replace(/```json/g, '').replace(/```/g, '').trim();
      aiResult = JSON.parse(sanitized);
    }

    return res.json({
      success: true,
      message: "AI processing completed successfully",
      aiResult
    });

  } catch (error: any) {
    console.error("AI processing error:", error);
    return res.status(500).json({ error: error.message || "Failed to process ticket via AI" });
  }
}
