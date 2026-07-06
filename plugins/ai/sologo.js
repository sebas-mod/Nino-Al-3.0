import axios from "axios";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "sologo",
  alias: ["ailogo", "bikinlogo"],
  category: "ai",
  description: "Crea logotipos usando IA a partir de texto (prompt)",
  usage: ".sologo <prompt>",
  example: ".sologo Gato lindo de color azul",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 2,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const prompt = m.text?.trim() || m.args.join(" ");

  if (!prompt) {
    return m.reply("❌ Ingresa la descripción del logotipo que deseas crear.\n\nEjemplo: `.sologo robot genial de color rojo`");
  }

  await m.react("🕕");

  try {
    const apiUrl = `https://api.nexray.eu.cc/ai/sologo?prompt=${encodeURIComponent(prompt)}`;
    const res = await axios.get(apiUrl, {
      timeout: 120000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    const data = res.data;
    if (!data.status || !data.result || data.result.length === 0) {
      await m.react("❌");
      return m.reply("⚠️ La IA falló al crear el logotipo. Intenta usar otro prompt (descripción).");
    }

    const logo = data.result[0];

    const caption = `🎨 *SOLOGO AI* 🎨\n\n` +
      `*Prompt:* ${prompt}\n` +
      `*Título:* ${logo.title}\n` +
      `*Descripción:* ${logo.desc}\n` +
      `*Tipo:* ${logo.logo_type || "origin"}`;

    await sock.sendMessage(m.chat, {
      image: { url: logo.thumbnail },
      caption: caption
    }, { quoted: m });

    await m.react("✅");

  } catch (error) {
    console.error("[SoLogo AI]", error.message);
    await m.react("☢");
    m.reply("😔 Ocurrió un error al procesar la solicitud con la IA.");
  }
}

export { pluginConfig as config, handler };
