import { aiodl } from "../../src/scraper/aio.js";
import te from "../../src/lib/ourin-error.js";
import { saluranCtx } from "../../src/lib/ourin-context.js";

const pluginConfig = {
  name: "aio",
  alias: ["allinone", "download", "dl", "descargar"],
  category: "downloader",
  description:
    "Descargador todo en uno (IG, TikTok, FB, Twitter, YouTube, Pinterest, CapCut, etc.)",
  usage: ".aio <url>",
  example: ".aio https://instagram.com/p/xxx",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const url = m.text?.trim();

  if (!url) {
    return m.reply(
      `📥 *ᴅᴇsᴄᴀʀɢᴀᴅᴏʀ ᴛᴏᴅᴏ ᴇɴ ᴜɴᴏ*\n\n` +
        `> ¡Descarga contenido de múltiples plataformas!\n\n` +
        `╭┈┈⬡「 🌐 *ᴘʟᴀᴛᴀꜰᴏʀᴍᴀs* 」\n` +
        `┃ • Instagram\n` +
        `┃ • TikTok\n` +
        `┃ • Facebook\n` +
        `┃ • Twitter/X\n` +
        `┃ • YouTube\n` +
        `┃ • Pinterest\n` +
        `┃ • CapCut\n` +
        `┃ • Threads / Reddit\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `> *Ejemplo:* ${m.prefix}aio https://instagram.com/p/xxx`,
    );
  }

  if (!url.startsWith("http")) {
    return m.reply(`❌ ¡URL no válida! Debe comenzar con http o https`);
  }

  await m.react("🕕");

  try {
    const result = await aiodl(url);

    if (!result?.media?.length) {
      await m.react("❌");
      return m.reply(`❌ No se pudo obtener el archivo multimedia. Asegúrate de que la URL sea válida.`);
    }

    const ctxInfo = saluranCtx();

    for (const item of result.media) {
      if (item.type === "video") {
        await sock.sendMedia(m.chat, item.url, result.title || null, m, {
          type: "video",
          contextInfo: ctxInfo,
        });
      } else if (item.type === "audio") {
        await sock.sendMessage(
          m.chat,
          {
            audio: { url: item.url },
            mimetype: "audio/mpeg",
            contextInfo: ctxInfo,
          },
          { quoted: m },
        );
      } else {
        await sock.sendMedia(m.chat, item.url, result.title || null, m, {
          type: "image",
          contextInfo: ctxInfo,
        });
      }
      break; // Descarga solo el primer elemento multimedia disponible
    }

    await m.react("✅");
  } catch (error) {
    await m.react("☢");
    m.reply(te(m.prefix, m.command, m.pushName));
  }
}

export { pluginConfig as config, handler };
