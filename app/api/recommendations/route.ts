import { NextResponse } from "next/server";

type RecommendationRequest = {
  origin: string;
  destination: string;
  duration: number;
  budget: number;
  salary?: number;
  age?: number;
  dreamTrip?: boolean;
  notes?: string;
};

type RecommendationResponse = {
  destination: string;
  summary: string;
  estimatedDailyBudget: string;
  itinerary: {
    day: number;
    title: string;
    description: string;
    budgetTips?: string;
  }[];
  packingList: string[];
  safetyNotes: string[];
};

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const buildPrompt = (payload: RecommendationRequest) => {
  return `You are a travel planner for domestic travel in Indonesia.

Reply with VALID and STRICT JSON only. No markdown, no comments, no extra text.

The JSON structure must follow this schema (use strings for all text values):
{
  "destination": "",
  "summary": "",
  "estimatedDailyBudget": "",
  "itinerary": [
    {
      "day": 1,
      "title": "",
      "description": "",
      "budgetTips": ""
    }
  ],
  "packingList": [""],
  "safetyNotes": [""]
}

Use natural English. Make sure the itinerary has exactly the same number of days as duration.

Trip details:
- Origin city: ${payload.origin}
- Destination city: ${payload.destination}
- Duration: ${payload.duration} days
- Total budget (IDR): ${payload.budget}
- Dream destination: ${payload.dreamTrip ? "Yes" : "No"}
- Monthly salary (optional): ${payload.salary ?? "Not provided"}
- Age (optional): ${payload.age ?? "Not provided"}
- Additional preferences: ${payload.notes || "None"}
`;
};

const extractJson = (text: string) => {
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("JSON format not found.");
  }
  const jsonString = text.slice(firstBrace, lastBrace + 1);
  return JSON.parse(jsonString) as RecommendationResponse;
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const payload = (await request.json()) as RecommendationRequest;

    if (!payload.destination || !payload.duration || !payload.budget) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 }
      );
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: buildPrompt(payload) }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1200,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to call Gemini API: ${errorText}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    const result = extractJson(text);

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong while generating recommendations." },
      { status: 500 }
    );
  }
}
