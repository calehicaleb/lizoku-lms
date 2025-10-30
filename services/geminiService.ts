import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Module, ContentType, ContentItem } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development, but the prompt states the key will be available.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generatePasswordHint = async (userInfo: { name: string; email: string }): Promise<string> => {
  try {
    const prompt = `Based on the user's name "${userInfo.name}" and email "${userInfo.email}", generate a subtle, creative, and secure password hint. The hint should not reveal the password but should jog the user's memory. For example, if the user's name is 'John Doe' and he likes dogs, a hint could be 'Your first furry friend's name?'. Be creative.`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error generating password hint:", error);
    return "Could not generate a hint at this time. Please try again later.";
  }
};

export const generateAIAvatar = async (name: string): Promise<string> => {
    try {
        const prompt = `Create a professional, abstract, geometric avatar logo representing a person named '${name}'. Use a vibrant color palette with gold, blue, and cream. The style should be minimalist and modern.`;
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
        throw new Error("No image generated");
    } catch (error) {
        console.error("Error generating AI avatar:", error);
        // Fallback to a placeholder image
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
    if (allowedContentTypes.length === 0) {
      throw new Error("At least one content type must be allowed.");
    }

    const prompt = `As an expert instructional designer, create a detailed course outline for a course titled "${title}".
The course is described as: "${description}".
The outline should be structured into exactly ${numModules} logical modules. Each module must contain a list of content items.
For each content item, suggest a title and a type. The only valid content item types you can use are: '${allowedContentTypes.join("', '")}'.
Ensure the structure is logical and covers the topic comprehensively.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "The title of the module."
              },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: {
                      type: Type.STRING,
                      description: "The title of the content item (e.g., a lesson or quiz)."
                    },
                    type: {
                      type: Type.STRING,
                      description: "The type of content item.",
                      // FIX: The enum property expects an array of strings, not the enum object itself.
                      enum: allowedContentTypes,
                    }
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

    const jsonStr = response.text.trim();
    const parsedOutline: Module[] = JSON.parse(jsonStr);
    
    // Filter the result to ensure the model respected the content type constraint
    const filteredAndParsedOutline = parsedOutline.map(module => ({
      ...module,
      items: module.items.filter(item => allowedContentTypes.includes(item.type))
    }));

    return filteredAndParsedOutline;

  } catch (error) {
    console.error("Error generating course outline:", error);
    throw new Error("Failed to generate course outline. The model may have returned an invalid structure or the request failed.");
  }
};

export const generateSingleModule = async (
  courseTitle: string,
  moduleTopic: string,
  moduleDescription: string,
  allowedContentTypes: ContentType[]
): Promise<Module> => {
  try {
    if (allowedContentTypes.length === 0) {
      throw new Error("At least one content type must be allowed.");
    }

    const prompt = `As an expert instructional designer for the course "${courseTitle}", create a single, detailed module outline about "${moduleTopic}".
The module's content should be based on this description: "${moduleDescription}".
The module must contain a list of logical content items.
For each content item, suggest a title and a type. The only valid content item types you can use are: '${allowedContentTypes.join("', '")}'.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "The title of the module, based on the topic provided."
            },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "The title of the content item (e.g., a lesson or quiz)."
                  },
                  type: {
                    type: Type.STRING,
                    description: "The type of content item.",
                    enum: allowedContentTypes,
                  }
                },
                required: ["title", "type"]
              }
            }
          },
          required: ["title", "items"]
        },
      },
    });

    const jsonStr = response.text.trim();
    const parsedModule: Omit<Module, 'id'> = JSON.parse(jsonStr);
    
    const filteredModule = {
      ...parsedModule,
      items: parsedModule.items.filter(item => allowedContentTypes.includes(item.type))
    };

    const moduleWithId: Module = {
        ...filteredModule,
        id: `temp-id-${Date.now()}`
    };

    return moduleWithId;

  } catch (error) {
    console.error("Error generating single module:", error);
    throw new Error("Failed to generate module outline. The model may have returned an invalid structure or the request failed.");
  }
};

export const generateContentItems = async (
  courseTitle: string,
  moduleTitle: string,
  topic: string,
  allowedContentTypes: ContentType[]
): Promise<Omit<ContentItem, 'id'>[]> => {
  try {
    if (allowedContentTypes.length === 0) {
      throw new Error("At least one content type must be allowed.");
    }

    const prompt = `As an expert instructional designer for the course "${courseTitle}" and the module "${moduleTitle}", create a list of logical content items for the topic "${topic}".
For each content item, suggest a title and a type.
The only valid content item types you can use are: '${allowedContentTypes.join("', '")}'.
Ensure the items are in a logical learning sequence.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "The title of the content item (e.g., a lesson or quiz)."
              },
              type: {
                type: Type.STRING,
                description: "The type of content item.",
                enum: allowedContentTypes,
              }
            },
            required: ["title", "type"]
          }
        },
      },
    });

    const jsonStr = response.text.trim();
    const parsedItems: Omit<ContentItem, 'id'>[] = JSON.parse(jsonStr);

    // Filter to ensure the model respected the content type constraint
    const filteredItems = parsedItems.filter(item => allowedContentTypes.includes(item.type));

    return filteredItems;

  } catch (error) {
    console.error("Error generating content items:", error);
    throw new Error("Failed to generate content items. The model may have returned an invalid structure or the request failed.");
  }
};