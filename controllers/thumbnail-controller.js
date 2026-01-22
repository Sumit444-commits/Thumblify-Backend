import ai from "../config/ai.js";
import { Thumbnail } from "../models/thumbnail-model.js";
import path from "path";
import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

const stylePrompts = {
  "Bold & Graphic":
    "eye-catching thumbnail, bold typography, vibrant colors, expressive facial reaction, dramatic lighting, high contrast, click-worthy composition, professional style",
  "Tech/Futuristic":
    "futuristic thumbnail, sleek modern design, digital UI elements, glowing accents, holographic effects, cyber-tech aesthetic, sharp lighting, high-tech atmosphere",
  Minimalist:
    "minimalist thumbnail, clean layout, simple shapes, limited color palette, plenty of negative space, modern flat design, clear focal point",
  Photorealistic:
    "photorealistic thumbnail, ultra-realistic lighting, natural skin tones, candid moment, DSLR-style photography, lifestyle realism, shallow depth of field",
  Illustrated:
    "illustrated thumbnail, custom digital illustration, stylized characters, bold outlines, vibrant colors, creative cartoon or vector art style",
};

const colorSchemeDescriptions = {
  vibrant:
    "vibrant and energetic colors, high saturation, bold contrasts, eye-catching palette",
  sunset:
    "warm sunset tones, orange pink and purple hues, soft gradients, cinematic glow",
  forest:
    "natural green tones, earthy colors, calm and organic palette, fresh atmosphere",
  neon: "neon glow effects, electric blues and pinks, cyberpunk lighting, high contrast glow",
  purple:
    "purple-dominant color palette, magenta and violet tones, modern and stylish mood",
  monochrome:
    "black and white color scheme, high contrast, dramatic lighting, timeless aesthetic",
  ocean:
    "cool blue and teal tones, aquatic color palette, fresh and clean atmosphere",
  pastel:
    "soft pastel colors, low saturation, gentle tones, calm and friendly aesthetic",
};

const aspectRatioMap = {
  "16:9": { width: 1024, height: 576 },
  "9:16": { width: 576, height: 1024 },
  "1:1": { width: 1024, height: 1024 },
};

const generateThumbnail = async (req, res) => {
  try {
    const { userId } = req.session;
    const {
      title,
      prompt: user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
    } = req.body;
    const thumbnail = await Thumbnail.create({
      userId,
      title,
      prompt: user_prompt,
      style,
      aspect_ratio,
      color_scheme,
      text_overlay,
      isGenerating: true,
    });

    const dimensions = aspectRatioMap[aspect_ratio] || aspectRatioMap["16:9"];

    // choose imagen-4.0-ultra-generate-001
    // 2. Build the Bytez Config
    const modelId = "google/imagen-4.0-ultra-generate-001"; // Or "black-forest-labs/FLUX.1-schnell"
    const model = ai.model(modelId);

    const modelParams = {
      temperature: 1,
      top_p: 0.95,
      width: dimensions.width,
      height: dimensions.height,
      // Bytez doesn't use the Gemini 'safetySettings' array;
      // most OS models have their own NSFW filters enabled by default.
    };

    let aiPrompt = `Create a ${stylePrompts[style]} for: "${title}."`;
    if (color_scheme) {
      aiPrompt += `Use a ${colorSchemeDescriptions[color_scheme]} color scheme.`;
    }
    if (user_prompt) {
      aiPrompt += `Additional details: ${user_prompt}.`;
    }
    aiPrompt += `The thumbnail should be: ${aspect_ratio}, visually stunning and designed to maximize click-through rate. Make it bold, professional, and impossible to ignore.`;

    // 4. Run the Model on Bytez
    const { error, output } = await model.run(aiPrompt, modelParams);

    if (error) {
      thumbnail.isGenerating = false;
      await thumbnail.save();
      return res.status(500).json({ message: "Bytez Error", error });
    }

    // 5. Handle the output (Bytez returns a Base64 Data URI)
    // We need to strip the prefix "data:image/png;base64," to get the raw base64 for fs.writeFileSync
    const base64Data = output.replace(/^data:image\/\w+;base64,/, "");
    const finalBuffer = Buffer.from(base64Data, "base64");

    const filename = `final-output-${Date.now()}.png`;
    const filepath = path.join("images", filename);

    // Create directory if it doesn't exist
    if (!fs.existsSync("images")) {
      fs.mkdirSync("images", { recursive: true });
    }

    // Write the final image to local disk (Optional backup)
    fs.writeFileSync(filepath, finalBuffer);

    // 6. Upload to Cloudinary
    // Cloudinary can take the 'output' string (Data URI) directly!
    const uploadResult = await cloudinary.uploader.upload(output, {
      folder: "thumbnails", // It's good practice to name your folder
      resource_type: "image",
    });

    // 7. Update Database
    thumbnail.image_url = uploadResult.secure_url; // Use secure_url for HTTPS
    thumbnail.isGenerating = false;
    await thumbnail.save();

    res.status(200).json({ message: "Thumbnail Generated", thumbnail });

    // remove file from disk
    fs.unlinkSync(filepath);
  } catch (error) {
    console.log(error);
    res.status(500).json("Internal Server Error");
  }
};

//  use this if have gemini-2.5-flash-image or gemini-3-pro-image-preview
// const generateThumbnail = async (req, res) => {
//   try {
//     const { userId } = req.session;
//     const {
//       title,
//       prompt: user_prompt,
//       style,
//       aspect_ratio,
//       color_scheme,
//       text_overlay,
//     } = req.body;
//     const thumbnail = await Thumbnail.create({
//       userId,
//       title,
//       prompt: user_prompt,
//       style,
//       aspect_ratio,
//       color_scheme,
//       text_overlay,
//       isGenerating: true,
//     });

//     const model = "gemini-2.5-flash-image";
//     const generationConfig = {
//       maxOutputTokens: 32768,
//       temperature: 1,
//       topP: 0.95,
//       reponseModalities: ["IMAGE"],
//       imageConfig: {
//         aspectRatio: aspect_ratio || "16:9",
//         imageSize: "1K",
//       },
//       safetySettings: [
//         {
//           category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
//           threshold: HarmBlockThreshold.OFF,
//         },
//         {
//           category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
//           threshold: HarmBlockThreshold.OFF,
//         },
//         {
//           category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
//           threshold: HarmBlockThreshold.OFF,
//         },
//         {
//           category: HarmCategory.HARM_CATEGORY_HARASSMENT,
//           threshold: HarmBlockThreshold.OFF,
//         },
//       ],
//     };

//     let prompt = `Create a ${stylePrompts[style]} for: "${title}."`;
//     if (color_scheme) {
//       prompt += `Use a ${colorSchemeDescriptions[color_scheme]} color scheme.`;
//     }
//     if (user_prompt) {
//       prompt += `Additional details: ${user_prompt}.`;
//     }
//     prompt += `The thumbnail should be: ${aspect_ratio}, visually stunning and designed to maximize click-through rate. Make it bold, professional, and impossible to ignore.`;

//     const response = await ai.models.generateContent({
//       model,
//       contents: [prompt],
//       config: generationConfig,
//     });

//     if (!response?.candidates?.[0]?.content?.parts) {
//       throw new Error("Unexpected Error");
//     }
//     const parts = response.candidates[0].content.parts;
//     let finalBuffer = null;
//     for (const part of parts) {
//       if (part.inlineData) {
//         finalBuffer = Buffer.from(part.inlineData.data, "base64");
//       }
//     }
//     const filename = `final-output-${Date.now()}.png`;
//     const filepath = path.join("images", filename);

//     // create image directory if doesn't exists
//     fs.mkdirSync("images", { recursive: true });

//     // write the final image to the file
//     fs.writeFileSync(filepath, finalBuffer);

//     const uploadResult = await cloudinary.uploader.upload(filepath,{resource_type:"image"});
//     thumbnail.image_url = uploadResult.url;
//     thumbnail.isGenerating = false;
//     await thumbnail.save();

//     res.status(200).json({message:"Thumbnail Generated", thumbnail});

//     // remove file from disk
//     fs.unlinkSync(filepath)

//   } catch (error) {
//     console.log(error)
//     res.status(500).json("Internal Server Error");
//   }
// };

const deleteThumbnail = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.session;

    await Thumbnail.findByIdAndDelete({ _id: id, userId });
    res.status(200).json({ message: "Thumbnail deleted successfully" });
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
};

export { generateThumbnail, deleteThumbnail };
