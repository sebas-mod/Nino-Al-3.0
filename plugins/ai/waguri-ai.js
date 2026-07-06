import { UnlimitedAI } from "../../src/scraper/unlimitedai.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "waguri-ai",
  alias: ["waguriai", "waguri"],
  category: "ai",
  description: "Chatea con Waguri-san — Una chica tímida que olvidó sus lentes",
  usage: ".waguri-ai <pregunta>",
  example: ".waguri-ai Waguri-san, ¡hola!",
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
      `👓 *Waguri-san*\n\n` +
        `> Una chica tímida de "The Girl I Like Forgot Her Glasses"\n> Dulce, atenta y que suele ponerse nerviosa fácilmente~\n\n` +
        `*MODO DE USO:*\n` +
        `> *${m.prefix}waguri-ai <pregunta>*\n\n` +
        `*EJEMPLO:*\n` +
        `> *${m.prefix}waguri-ai Waguri-san, ¡hola!*`
    );
  }

  await m.react("🕕");

  try {
    const result = await UnlimitedAI(text, "waguri-ai");

    if (!result.status) {
      await m.react("gradient_error");
      return m.reply(`❌ *Error de Waguri AI*\n\n> ${result.error || "Error al obtener respuesta"}`);
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
