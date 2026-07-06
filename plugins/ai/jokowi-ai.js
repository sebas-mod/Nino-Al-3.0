import { UnlimitedAI } from "../../src/scraper/unlimitedai.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "jokowi-ai",
  alias: ["jokowiai", "jokowi", "pakjokowi"],
  category: "ai",
  description: "Chatea con Pak Jokowi — El hombre de Solo",
  usage: ".jokowi-ai <pregunta>",
  example: ".jokowi-ai Pak, gimana kabar?",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 2,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.args.join(" ");
  if (!text) {
    return m.reply(
      `🏛️ *Pak Jokowi*\n\n` +
        `> El hombre de Solo — Expresidente de la RI\n> Sencillo, sabio y le gusta el blusukan (visitas improvisadas)\n\n` +
        `*MODO DE USO:*\n` +
        `> *${m.prefix}jokowi-ai <pregunta>*\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}jokowi-ai Pak, gimana kabar?*`
    );
  }

  await m.react("🕕");

  try {
    const result = await UnlimitedAI(text, "jokowi-ai");

    if (!result.status) {
      await m.react("☢");
      return m.reply(`❌ *Jokowi AI Error*\n\n> ${result.error || "Error al obtener una respuesta"}`);
    }

    await m.react("✅");
    const reply = result.answer;
    await m.reply(reply.length > 4096 ? reply.slice(0, 4096) + "..." : reply);
  } catch (e) {
    console.error(e);
    await m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
