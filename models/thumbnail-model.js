import mongoose from "mongoose";

const thumbnailSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    style: {
      type: String,
      required: true,
      enum: [
        "Bold & Graphic",
        "Minimalist",
        "Photorealistic",
        "Illustrated",
        "Tech/Futuristic",
      ],
    },
    aspect_ratio: {
      type: String,
      required: true,
      enum:["16:9", "1:1", "9:16"]
    },
    color_scheme: {
      type: String,
      enum:["vibrant", "sunset", "forest", "purple","ocean","monochrome","neon","pastel"],
    },
    text_overlay:{type:Boolean,default:false},
    image_url:{type:String,default:""},
    prompt_used:{type:String},
    user_prompt:{type:String},
    isGenerating:{type:Boolean,default:true},
  },
  { timestamps: true },
);

export const Thumbnail = new mongoose.model("Thumbnail", thumbnailSchema);
