import { UnlimitedAI } from "../../src/scraper/unlimitedai.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "kobo-ai",
  alias: ["koboai", "kobo"],
  category: "ai",
  description: "Chatea con Kobo Kanaeru — VTuber de Hololive ID",
  usage: ".kobo-ai <pregunta>",
  example: ".kobo-ai Kobo lagi apa?",
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
      `🌬️ *Kobo Kanaeru*\n\n` +
        `> VTuber de Hololive Indonesia Gen 3\n> ¡Una Chamán del Viento alegre a la que le encantan las bromas!\n\n` +
        `*MODO DE USO:*\n` +
        `> *${m.prefix}kobo-ai <pregunta>*\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}kobo-ai Kobo lagi apa?*`
    );
  }

  await m.react("🕕");

  try {
    const result = await UnlimitedAI(text, "kobo-ai");

    if (!result.status) {
      await m.react("☢");
      return m.reply(`❌ *Kobo AI Error*\n\n> ${result.error || "Error al obtener una respuesta"}`);
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
