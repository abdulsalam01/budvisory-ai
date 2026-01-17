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
  return `Kamu adalah travel planner untuk perjalanan domestik di Indonesia.

Balas dalam format JSON yang VALID dan STRICT tanpa markdown, tanpa komentar, tanpa teks tambahan.

Struktur JSON wajib mengikuti format berikut (gunakan string untuk semua nilai text):
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

Gunakan Bahasa Indonesia yang natural. Pastikan itinerary memiliki jumlah hari sesuai duration.

Detail perjalanan:
- Kota asal: ${payload.origin}
- Kota tujuan: ${payload.destination}
- Durasi: ${payload.duration} hari
- Budget total (IDR): ${payload.budget}
- Dream destination: ${payload.dreamTrip ? "Ya" : "Tidak"}
- Gaji per bulan (opsional): ${payload.salary ?? "Tidak diisi"}
- Usia (opsional): ${payload.age ?? "Tidak diisi"}
- Preferensi tambahan: ${payload.notes || "Tidak ada"}
`;
};

const extractJson = (text: string) => {
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("Format JSON tidak ditemukan.");
  }
  const jsonString = text.slice(firstBrace, lastBrace + 1);
  return JSON.parse(jsonString) as RecommendationResponse;
};

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY belum diatur." },
        { status: 500 }
      );
    }

    const payload = (await request.json()) as RecommendationRequest;

    if (!payload.destination || !payload.duration || !payload.budget) {
      return NextResponse.json(
        { error: "Form belum lengkap." },
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
        { error: `Gagal memanggil Gemini API: ${errorText}` },
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
      { error: "Terjadi kesalahan saat membuat rekomendasi." },
      { status: 500 }
    );
  }
}
