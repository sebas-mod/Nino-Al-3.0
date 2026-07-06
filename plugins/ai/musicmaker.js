import axios from "axios";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
  name: "musicmaker",
  alias: ["bikinlagu", "suno"],
  category: "ai",
  description: "Crea música o canciones usando IA a partir de texto (prompt)",
  usage: ".musicmaker <prompt>",
  example: ".musicmaker Lagu sedih tentang perpisahan dengan musik piano",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 3,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const prompt = m.text?.trim() || m.args.join(" ");

  if (!prompt) {
    return m.reply("❌ Ingresa la descripción de la canción que deseas crear.\n\nEjemplo: `.musicmaker Lagu pop romantis yang ceria`");
  }

  await m.react("🕕");

  try {
    const apiUrl = `https://api.nexray.eu.cc/ai/suno?prompt=${encodeURIComponent(prompt)}`;
    
    const res = await axios.get(apiUrl, {
      timeout: 180000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    const data = res.data;
    if (!data.status || !data.result) {
      await m.react("❌");
      return m.reply("⚠️ La IA falló al crear la canción. Intenta usar otro prompt (descripción).");
    }

    const r = data.result;

    const caption = `🎵 *MUSIC MAKER AI* 🎵\n\n` +
      `*Título:* ${r.title}\n` +
      `*Tags:* ${r.tags}\n` +
      `*Duración:* ${r.duration} segundos\n\n` +
      `*Letra:*\n${r.lyrics}`;

    await sock.sendMessage(m.chat, {
      audio: { url: r.url },
      mimetype: "audio/mpeg",
      ptt: false,
    }, { quoted: m });

    await sock.sendMessage(m.chat, {
      image: { url: r.thumbnail },
      caption: caption
    }, { quoted: m });

    await m.react("✅");

  } catch (error) {
    console.error("[Music Maker AI]", error.message);
    await m.react("☢");
    m.reply("😔 Ocurrió un error al procesar la solicitud de creación de canción con la IA. El servidor de la IA podría estar ocupado.");
  }
}

export { pluginConfig as config, handler };
