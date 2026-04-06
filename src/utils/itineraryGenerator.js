export const generateItinerary = async ({ fromDestination, destination, days, budget, travelType, peopleCount = 1 }) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing!");

  // Budget per person per day in INR
  const budgetRates = { budget: 1500, moderate: 4500, luxury: 12000 };
  const dailyRate = budgetRates[budget] || 4500;
  const groupDailyRate = dailyRate * peopleCount;

  // Keep prompt concise to avoid token truncation
  const prompt = `Create a ${days}-day travel itinerary from ${fromDestination} to ${destination} for ${peopleCount} ${travelType} traveler(s) with a ${budget} budget (~₹${groupDailyRate}/day total).

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "destination": "${destination}",
  "days": ${days},
  "budget": "${budget}",
  "travelType": "${travelType}",
  "peopleCount": ${peopleCount},
  "imageKeywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "itinerary": [
    {
      "day": 1,
      "title": "Day title",
      "dailySpend": ${groupDailyRate},
      "activities": [
        { "time": "09:00 AM", "endTime": "11:30 AM", "title": "SPECIFIC real place name", "description": "Brief description" },
        { "time": "12:30 PM", "endTime": "02:00 PM", "title": "Real restaurant name for lunch", "description": "Brief description" },
        { "time": "03:00 PM", "endTime": "06:00 PM", "title": "SPECIFIC real place name", "description": "Brief description" },
        { "time": "07:30 PM", "endTime": "09:30 PM", "title": "Real restaurant name for dinner", "description": "Brief description" }
      ]
    }
  ],
  "budgetBreakdown": {
    "accommodation": ${Math.round(groupDailyRate * 0.4 * days)},
    "food": ${Math.round(groupDailyRate * 0.3 * days)},
    "transportation": ${Math.round(groupDailyRate * 0.15 * days)},
    "travel": ${Math.round(5000 * peopleCount)},
    "activities": ${Math.round(groupDailyRate * 0.15 * days)},
    "total": ${Math.round(groupDailyRate * days + 5000 * peopleCount)}
  }
}

Rules:
- Use REAL, FAMOUS places in ${destination} (e.g. Burj Khalifa, Sensoji Temple, Eiffel Tower).
- Use REAL restaurant names local to ${destination}.
- Keep each description under 15 words.
- Generate exactly ${days} day(s) in the itinerary array.`;

  try {
    const apiKey = import.meta.env.VITE_API_KEY;
    if (!apiKey) throw new Error("VITE_API_KEY is missing! Zhipu AI key is required.");

    const response = await fetch(
      `https://open.bigmodel.cn/api/paas/v4/chat/completions`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}` 
        },
        body: JSON.stringify({
          model: "glm-4.5-flash",
          messages: [
            { role: "user", content: prompt }
          ],
          temperature: 0.5,
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API error ${response.status}`);
    }

    const data = await response.json();
    let text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error("Empty AI response. Please try again.");

    // Strip markdown if present
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();

    // Try to extract JSON object if there's surrounding text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI response was not valid JSON. Please try again.");
    text = jsonMatch[0];

    const result = JSON.parse(text);

    if (!result.itinerary || !Array.isArray(result.itinerary)) {
      throw new Error("AI generated an incomplete itinerary. Please try again.");
    }

    // Build image URLs using loremflickr
    const images = (result.imageKeywords || [destination]).map((kw, i) =>
      `https://loremflickr.com/800/600/${encodeURIComponent(destination)},${encodeURIComponent(kw)}?random=${i}`
    );

    return {
      ...result,
      fromDestination,
      imageUrl: images[0],
      imageGallery: images,
      generatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("AI Generation failed:", error);
    throw error;
  }
};
