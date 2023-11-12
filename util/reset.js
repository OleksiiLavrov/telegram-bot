import { INITIAL_SESSION } from "../consts/index.js";

export const reset = async (ctx) => {
   ctx.session = INITIAL_SESSION;
   await ctx.reply("Waiting for your voice or text message");
};
