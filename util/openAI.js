import OpenAI from "openai";
import config from "config";
import { createReadStream } from "fs";
import { removeFile } from "./removeFile.js";

class OpenAiAssistant {
   roles = { ASSISTANT: "assistant", USER: "user", SYSTEM: "system" };
   constructor(apiKey) {
      this.openai = new OpenAI({ apiKey });
   }

   async chat(messages) {
      try {
         const completion = await this.openai.chat.completions.create({
            messages,
            model: "gpt-3.5-turbo",
         });
         return completion.choices[0].message.content;
      } catch (error) {
         console.log("Error while getting chat completion", error.message);
      }
   }

   async transcription(filepath) {
      try {
         const transcription = await this.openai.audio.transcriptions.create({
            model: "whisper-1",
            file: createReadStream(filepath),
         });
         removeFile(filepath);
         return transcription.text;
      } catch (error) {
         console.log("Error while transcription", error);
      }
   }
}

export const openai = new OpenAiAssistant(config.get("OPENAI_API_KEY"));
