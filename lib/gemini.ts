import { GoogleGenerativeAI, Tool, SchemaType } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Gemini function calling tool — lets Gemini fetch live weather directly
const weatherTool: Tool = {
  functionDeclarations: [
    {
      name: "getCurrentWeather",
      description: "Fetch real-time weather data for a given location including temperature, humidity, wind speed, precipitation, UV index, and active weather events.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          latitude: {
            type: SchemaType.NUMBER,
            description: "Latitude of the location",
          },
          longitude: {
            type: SchemaType.NUMBER,
            description: "Longitude of the location",
          },
        },
        required: ["latitude", "longitude"],
      },
    },
    {
      name: "getAirQuality",
      description: "Fetch current air quality index (AQI) for a location. Returns AQI value and pollution level.",
      parameters: {
        type: SchemaType.OBJECT,
        properties: {
          latitude: {
            type: SchemaType.NUMBER,
            description: "Latitude of the location",
          },
          longitude: {
            type: SchemaType.NUMBER,
            description: "Longitude of the location",
          },
        },
        required: ["latitude", "longitude"],
      },
    },
  ],
};

export function getRiskModel() {
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: `You are ClimaGuard, an AI assistant that protects children from climate-related hazards.
You analyze real-time weather and environmental data and provide personalized, actionable safety guidance for children.
Be warm, clear, and practical. Always prioritize child safety. Use the language specified in the request.
Structure your response with clear sections: Risk Summary, Immediate Actions, Health Warnings, and What to Watch For.
Keep responses concise — parents need quick, clear guidance during emergencies.`,
  });
}

// Model with function calling enabled for weather tool use
export function getRiskModelWithTools() {
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    tools: [weatherTool],
    systemInstruction: `You are ClimaGuard, an AI assistant that protects children from climate-related hazards.
You have access to real-time weather tools. When given a location, use the getCurrentWeather and getAirQuality tools to fetch live data before generating your safety report.
Analyze the data and provide personalized, actionable child safety guidance.
Be warm, clear, and practical. Use the language specified in the request.
Structure your response: Risk Summary, Immediate Actions, Health Warnings, What to Watch For.`,
  });
}

export function getHealthModel() {
  return genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: `You are ClimaGuard's AI Health Advisor, specialized in climate-related health issues affecting children.
You help parents identify and manage health symptoms that may be caused or worsened by climate hazards (heatstroke, waterborne diseases, respiratory issues from air pollution, malaria, dengue, dehydration, etc.).
You are NOT a doctor. Always:
- Provide first-response guidance only
- Clearly flag when emergency medical care is needed
- Be compassionate and calm — parents may be panicking
- Use the language specified in the conversation
- Ask follow-up questions to better understand the child's symptoms
- Consider the local climate hazards when assessing symptoms`,
  });
}

export { genAI };
