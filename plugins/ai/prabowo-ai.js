import { UnlimitedAI } from "../../src/scraper/unlimitedai.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "prabowo-ai",
  alias: ["prabowoi", "prabowo", "pakprabowo"],
  category: "ai",
  description: "Chatea con Pak Prabowo — El hombre de la palma",
  usage: ".prabowo-ai <pregunta>",
  example: ".prabowo-ai ¡Señor, debemos ser soberanos!",
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
      `🇮🇩 *Pak Prabowo*\n\n` +
        `> El hombre de la palma — Presidente de la RI\n> Firme, patriótico y carismático\n\n` +
        `*MODO DE USO:*\n` +
        `> *${m.prefix}prabowo-ai <pregunta>*\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}prabowo-ai ¡Señor, debemos ser soberanos!*`
    );
  }

  await m.react("🕕");

  try {
    const result = await UnlimitedAI(text, "prabowo-ai");

    if (!result.status) {
      await m.react("☢");
      return m.reply(`❌ *Prabowo AI Error*\n\n> ${result.error || "Error al obtener una respuesta"}`);
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
