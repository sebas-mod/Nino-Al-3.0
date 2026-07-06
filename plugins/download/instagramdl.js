import instagramDownloader from "../../src/scraper/ig.js";

const pluginConfig = {
  name: "instagramdl",
  alias: ["igdl", "ig", "instagram", "instagramdescargar"],
  category: "download",
  description: "Descargar videos o fotos de Instagram",
  usage: ".instagramdl <url>",
  example: ".instagramdl https://www.instagram.com/reel/xxx",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

const IG_REGEX = /instagram\.com\/(p|reel|reels|stories|tv)\//i;

async function handler(m, { sock }) {
  const url = m.text?.trim();

  if (!url) {
    return m.reply(
      `📸 *ɪɴsᴛᴀɢʀᴀᴍ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n` +
        `> \`${m.prefix}igdl <url>\`\n\n` +
        `*ᴇᴊᴇᴍᴘʟᴏs:*\n` +
        `> \`${m.prefix}igdl https://www.instagram.com/reel/xxx\`\n` +
        `> \`${m.prefix}igdl https://www.instagram.com/p/xxx\``,
    );
  }

  if (!IG_REGEX.test(url)) {
    return m.reply(
      `❌ URL no válida. Asegúrate de usar un enlace de Instagram (reel, post o story).`,
    );
  }

  await m.react("🕕");

  try {
    const result = await instagramDownloader(url);

    if (!result?.media?.length) {
      await m.react("❌");
      return m.reply(`❌ Error al obtener el archivo multimedia. Intenta con otro enlace.`);
    }

    const isStory = url.includes("/stories/");
    let caption = `📸 *Instagram ${isStory ? "Story" : "Downloader"}*\n`;
    if (result.username && result.username !== "-")
      caption += `👤 @${result.username}\n`;
    if (result.likes && result.likes !== "-") caption += `❤️ ${result.likes}\n`;
    if (result.comment && result.comment !== "-")
      caption += `💬 ${result.comment}\n`;

    for (const item of result.media) {
      if (item.type === "video" || item.type === "mp4") {
        await sock.sendMessage(
          m.chat,
          { video: { url: item.url }, caption },
          { quoted: m },
        );
      } else {
        await sock.sendMessage(
          m.chat,
          { image: { url: item.url }, caption },
          { quoted: m },
        );
      }
      caption = ""; // Limpia el subtítulo para publicaciones con múltiples archivos (carrusel)
    }

    await m.react("✅");
  } catch (err) {
    await m.react("❌");
    return m.reply(`❌ *ᴇʀʀᴏʀ ᴀʟ ᴅᴇsᴄᴀʀɢᴀʀ*\n\n> ${err.message}`);
  }
}

export { pluginConfig as config, handler };
