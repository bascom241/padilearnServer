import axios from "axios";
const GEMINI_URL ="https://generativelanguage.googleapis.com/v1beta/interactions";
import type { GeminiResponse } from "../../modules/padiAi/messages/message.types.js";


export const generateAIResponse = async (input: string): Promise<GeminiResponse> => {
  try {
    const response = await axios.post(
      GEMINI_URL,
      {
        model: "Gemini 3.1 Flash Lite",
        input,
      },
      {
        headers: {
          "x-goog-api-key": process.env.GEMINI_API_KEY,
          "Content-Type": "application/json",
        },
      },
    );

    return response.data;
  } catch (error) {
    if(axios.isAxiosError(error)){
        console.log(error, 
            "Gemini API error", 
            error.response?.data
        )
    }
    throw error
  }
};
