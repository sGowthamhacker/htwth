import type { Handler, HandlerEvent } from "@netlify/functions";

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'API key not configured on the server.' }),
    };
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey }),
  };
};
