import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Module, ContentType, ContentItem, Rubric } from '../types';

export const suggestGradingFeedback = async (
  submissionText: string, 
  rubric: Rubric, 
  instructions: string
): Promise<string> => {
  try {
    // Fix: Created new GoogleGenAI instance right before making the API call as per strict guidelines.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const rubricStr = rubric.criteria.map(c => `- ${c.description} (Max ${c.points}pts): ${c.longDescription || ''}`).join('\n');
    
    const prompt = `As an expert instructor, review the following student submission and suggest professional, constructive feedback.
Context:
Assignment Instructions: "${instructions}"
Grading Rubric Criteria:
${rubricStr}

Student Submission Content:
"""
${submissionText}
"""

Instructions for you:
1. Identify strengths and specific areas for improvement.
2. Align comments with the rubric criteria provided.
3. Keep the tone supportive but rigorous.
4. Output should be a single, structured feedback paragraph. Do not assign scores, just feedback.`;

    // Fix: Updated model to gemini-3-pro-preview for advanced text reasoning tasks.
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });

    // Fix: Accessing .text property directly instead of calling it as a method.
    return response.text || "AI Assistant was unable to process this submission.";
  } catch (error) {
    console.error("Error suggesting feedback:", error);
    return "Feedback suggestion failed. Please review manually.";
  }
};

export const generatePasswordHint = async (userInfo: { name: string; email: string }): Promise<string> => {
  try {
    // Fix: Initialized client locally.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Based on the user's name "${userInfo.name}" and email "${userInfo.email}", generate a subtle, creative, and secure password hint. The hint should not reveal the password but should jog the user's memory. For example, if the user's name is 'John Doe' and he likes dogs, a hint could be 'Your first furry friend's name?'. Be creative.`;
    
    // Fix: Updated model to gemini-3-flash-preview for efficient text generation.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Hint unavailable.";
  } catch (error) {
    console.error("Error generating password hint:", error);
    return "Could not generate a hint at this time. Please try again later.";
  }
};

export const generateAIAvatar = async (name: string): Promise<string> => {
    try {
        // Fix: Initialized client locally for image generation task.
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Create a professional, abstract, geometric avatar logo representing a person named '${name}'. Use a vibrant color palette with gold, blue, and cream. The style should be minimalist and modern.`;
        
        // Fix: Default to gemini-2.5-flash-image for general image generation tasks.
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
              parts: [{ text: prompt }]
            },
            config: {
              imageConfig: {
                aspectRatio: "1:1"
              }
            }
        });

        // Fix: Iterated through response parts to correctly extract the image part as per banana series guidelines.
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    return `data:image/png;base64,${part.inlineData.data}`;
                }
            }
        }
        throw new Error("No image part generated in response");
    } catch (error) {
        console.error("Error generating AI avatar:", error);
        return `https://i.pravatar.cc/150?u=${name}`;
    }
};

export const generateCourseOutline = async (
  title: string, 
  description: string,
  numModules: number,
  allowedContentTypes: ContentType[]
): Promise<Module[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `As an expert instructional designer, create a detailed course outline for a course titled "${title}".
The course is described as: "${description}".
The outline should be structured into exactly ${numModules} logical modules. Each module must contain a list of content items.
For each content item, suggest a title and a type. The only valid content item types you can use are: '${allowedContentTypes.join("', '")}'.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    type: { type: Type.STRING, enum: allowedContentTypes }
                  },
                  required: ["title", "type"]
                }
              }
            },
            required: ["title", "items"]
          }
        },
      },
    });

    return JSON.parse(response.text?.trim() || "[]");
  } catch (error) {
    console.error("Error generating course outline:", error);
    throw new Error("Failed to generate course outline.");
  }
};

export const generateSingleModule = async (
  courseTitle: string,
  moduleTopic: string,
  moduleDescription: string,
  allowedContentTypes: ContentType[]
): Promise<Module> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Create a single module for "${courseTitle}" about "${moduleTopic}". Description: "${moduleDescription}". Use types: ${allowedContentTypes.join(', ')}`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  type: { type: Type.STRING, enum: allowedContentTypes }
                },
                required: ["title", "type"]
              }
            }
          },
          required: ["title", "items"]
        },
      },
    });
    return { ...JSON.parse(response.text?.trim() || "{}"), id: `temp-${Date.now()}` };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const generateContentItems = async (
  courseTitle: string,
  moduleTitle: string,
  topic: string,
  allowedContentTypes: ContentType[]
): Promise<any[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Create items for topic "${topic}" in course "${courseTitle}", module "${moduleTitle}". Valid types: ${allowedContentTypes.join(', ')}`;
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              type: { type: Type.STRING, enum: allowedContentTypes }
            },
            required: ["title", "type"]
          }
        },
      },
    });
    return JSON.parse(response.text?.trim() || "[]");
  } catch (error) {
    console.error(error);
    throw error;
  }
};
