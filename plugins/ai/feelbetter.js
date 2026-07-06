import { FeelBetter } from "../../src/scraper/feeb.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "feelbetter",
  alias: ["fb", "feelbetterbot", "healing"],
  category: "ai",
  description: "Chatea con FeelBetterBot — una IA lista para escucharte sin juzgarte",
  usage: ".feelbetter <desahogo/pregunta>",
  example: ".feelbetter lagi sedih nih",
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
      `💚 *FeelBetterBot*\n\n` +
        `Una IA lista para escuchar tus desahogos — sin juzgarte, con calidez y empatía.\n\n` +
        `*MODO DE USO:*\n` +
        `> *${m.prefix}feelbetter <desahogo>*\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}feelbetter lagi sedih nih*\n` +
        `> *${m.prefix}feelbetter aku capek banget belakangan*\n\n` +
        `_Este bot no reemplaza a un profesional, pero puede ser un lugar seguro para desahogarte_`
    );
  }

  await m.react("🕕");

  try {
    const result = await FeelBetter(text);

    if (!result.status) {
      await m.react("☢");
      return m.reply(
        `❌ *FeelBetter Falló*\n\n> ${result.error || "Error al obtener una respuesta"}`
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
