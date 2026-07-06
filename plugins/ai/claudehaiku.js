import { ClaudeHaiku } from "../../src/scraper/claudehaiku.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "claudehaiku",
  alias: ["claude", "haiku", "chiku"],
  category: "ai",
  description: "Chatea con Claude Haiku 4.5 a través de OverChat",
  usage: ".claudehaiku <pregunta>",
  example: ".claudehaiku Jelaskan teori relativitas",
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
      `🤍 *Claude Haiku 4.5*\n\n` +
        `Pregúntale lo que quieras a la IA Claude Haiku — rápida y ligera, ideal para preguntas cotidianas.\n\n` +
        `*MODO DE USO:*\n` +
        `> *${m.prefix}claudehaiku <pregunta>*\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}claudehaiku Jelaskan teori relativitas*\n` +
        `> *${m.prefix}claudehaiku Tips biar produktif*\n\n` +
        `_Respuesta rápida, pero siempre inteligente_`
    );
  }

  await m.react("🕕");

  try {
    const result = await ClaudeHaiku(text);

    if (!result.status) {
      await m.react("☢");
      return m.reply(
        `❌ *Claude Haiku Falló*\n\n> ${result.error || "Error al obtener una respuesta"}`
      );
    }

    await m.react("✅");

    const reply = `${result.answer}`;
    await m.reply(reply.length > 4096 ? reply.slice(0, 4096) + "..." : reply, {
      contextInfo: saluranCtx(),
    });
  } catch (e) {
    console.error(e);
    await m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
