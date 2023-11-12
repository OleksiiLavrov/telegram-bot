import axios from "axios";
import ffmpeg from "fluent-ffmpeg";
import installer from "@ffmpeg-installer/ffmpeg";

import { createWriteStream } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import { removeFile } from "./removeFile.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

class OggConverter {
   constructor() {
      ffmpeg.setFfmpegPath(installer.path);
   }

   toMP3(inputName, outputName) {
      try {
         const outputPath = resolve(dirname(inputName), `${outputName}.mp3`);
         return new Promise((resolve, reject) => {
            const stream = createWriteStream(outputPath);
            ffmpeg()
               .input(inputName)
               .audioQuality(96)
               .toFormat("mp3")
               .on("end", () => {
                  removeFile(inputName);
                  resolve(outputPath);
               })
               .on("error", (err) => reject(err.message))
               .pipe(stream, { end: true });
         });
      } catch (error) {
         console.log("Error while creating MP3", error.message);
      }
   }

   async create(url, fileName) {
      try {
         const oggPath = resolve(__dirname, "../voices", `${fileName}.ogg`);
         const response = await axios({
            method: "GET",
            url,
            responseType: "stream",
         });

         return new Promise((resolve) => {
            const stream = createWriteStream(oggPath);
            response.data.pipe(stream);
            stream.on("finish", () => resolve(oggPath));
         });
      } catch (error) {
         console.log("Error while creating ogg", error.message);
      }
   }
}
export const ogg = new OggConverter();
