import "dotenv/config";
import { Telegraf, session } from "telegraf";
import { ogg } from "../util/oggConverter.js";
import { openai } from "../util/openAI.js";
import { reset } from "../util/reset.js";
import { INITIAL_SESSION } from "../consts/index.js";

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

bot.use(session());
bot.command("new", async (ctx) => {
   reset(ctx);
});
bot.command("start", async (ctx) => {
   reset(ctx);
});
bot.on("voice", async (ctx) => {
   ctx.session ??= INITIAL_SESSION;
   try {
      await ctx.reply(
         "Voice message has been received. Waiting for response..."
      );
      const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
      const userId = String(ctx.message.from.id);
      const oggPath = await ogg.create(link.href, userId);
      const mp3Path = await ogg.toMP3(oggPath, userId);
      const text = await openai.transcription(mp3Path);
      ctx.session.messages.push({
         role: openai.roles.USER,
         content: text,
      });
      const response = await openai.chat(ctx.session.messages);
      ctx.session.messages.push({
         role: openai.roles.ASSISTANT,
         content: response,
      });
      await ctx.reply(
         `Your request is: \n${text}\nYour request is: \n${response}`
      );
   } catch (error) {
      console.log("Error while handling voice message", error.message);
      await ctx.reply("Something went wrong. Please, try again later.");
   }
});

bot.on("message", async (ctx) => {
   ctx.session ??= INITIAL_SESSION;
   try {
      ctx.session.messages.push({
         role: openai.roles.USER,
         content: ctx.message.text,
      });
      const response = await openai.chat(ctx.session.messages);
      ctx.session.messages.push({
         role: openai.roles.ASSISTANT,
         content: response,
      });
      await ctx.reply(response);
   } catch (error) {
      console.log("Error while handling text message", error.message);
      await ctx.reply("Something went wrong. Please, try again later.");
   }
});

bot.launch({
   webhook: {
      // Public domain for webhook; e.g.: example.com
      domain: process.env.WEBHOOK_DOMAIN,

      // Port to listen on; e.g.: 8080
      port: process.env.PORT,

      // Optional secret to be sent back in a header for security.
      // e.g.: `crypto.randomBytes(64).toString("hex")`
      secretToken: randomAlphaNumericString,
   },
});

process.once("SIGINT", () => bot.stop());
process.once("SIGTERM", () => bot.stop());
