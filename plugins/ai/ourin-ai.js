import { UnlimitedAI } from "../../src/scraper/unlimitedai.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "ourin-ai",
  alias: ["ourinai", "ourin"],
  category: "ai",
  description: "Chatea con Ourin AI — Un asistente de bot inteligente",
  usage: ".ourin-ai <pregunta>",
  example: ".ourin-ai Apa itu Node.js?",
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
      `🤖 *Ourin AI*\n\n` +
        `> Un asistente inteligente listo para ayudarte\n\n` +
        `*MODO DE USO:*\n` +
        `> *${m.prefix}ourin-ai <pregunta>*\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}ourin-ai Apa itu Node.js?*`
    );
  }

  await m.react("🕕");

  try {
    const result = await UnlimitedAI(text, "ourin-ai");

    if (!result.status) {
      await m.react("☢");
      return m.reply(`❌ *Ourin AI Error*\n\n> ${result.error || "Error al obtener una respuesta"}`);
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
