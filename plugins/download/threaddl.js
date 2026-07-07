import axios from "axios";
import he from "he";
import te from "../../src/lib/ourin-error.js";

const BASE_URL = "https://workers-playground-cool-wood-c008.accoutydusra.workers.dev";

function cleanText(text) {
  return he.decode(String(text || "")).replace(/\r/g, "").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function uniqueByUrl(list = []) {
  const seen = new Set();
  const result = [];
  for (const item of list) {
    if (!item?.url || seen.has(item.url)) continue;
    seen.add(item.url);
    result.push(item);
  }
  return result;
}

function normalizeResult(data = {}) {
  const result = [];
  
  const videoQualities = uniqueByUrl(data.video?.qualities || []);
  for (const item of videoQualities) {
    result.push({
      Type: "video",
      Quality: item.quality || null,
      Result_url: item.url
    });
  }
  
  const images = uniqueByUrl(data.images?.urls || []);
  for (const item of images) {
    result.push({
      Type: "image",
      Result_url: item.url
    });
  }
  
  return result;
}

const pluginConfig = {
  name: "threaddl",
  alias: ["tdl", "threads", "threadsdl"],
  category: "download",
  description: "¡Descarga fotos y videos de publicaciones de Threads sin complicaciones!",
  usage: ".tdl <url>",
  example: ".tdl https://www.threads.net/@xxx/post/xxx",
  cooldown: 10,
  energi: 1,
  isEnabled: true
};

async function handler(m, { sock }) {
  const url = m.text?.trim();
  
  if (!url || !/threads/i.test(url)) {
    return m.reply("❌ *Oye, ¿dónde está el enlace de Threads?*\n\nDebes ingresar un enlace de la publicación de Threads que deseas descargar. ¡Asegúrate de que el enlace sea correcto! \n\nEjemplo: `.tdl https://www.threads.net/@zuck/post/xxx`");
  }

  await m.react("🕕");

  try {
    const res = await axios.get(BASE_URL, {
      timeout: 60000,
      validateStatus: () => true,
      params: { url: url, action: "info" },
      headers: {
        "sec-ch-ua-platform": `"Android"`,
        "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
        "accept": "application/json",
        "sec-ch-ua": `"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"`,
        "content-type": "application/json",
        "sec-ch-ua-mobile": "?1",
        "origin": "https://threadsvid.com",
        "sec-fetch-site": "cross-site",
        "sec-fetch-mode": "cors",
        "sec-fetch-dest": "empty",
        "referer": "https://threadsvid.com/",
        "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
        "priority": "u=1, i"
      }
    });

    const data = res.data || {};
    const info = data.data || {};
    const result = normalizeResult(info);

    if (res.status >= 300 || data.success !== true || result.length === 0) {
      await m.react("❌");
      return m.reply(`⚠️ *¡Vaya, no se pudieron obtener los datos de Threads!*\n\nEs posible que esta publicación sea privada, haya sido eliminada o que el enlace que proporcionaste no sea el correcto.\n\nRazón del sistema: ${data.message || data.error || "Desconocida"}`);
    }

    const captionText = `✨ *THREADS DOWNLOADER* ✨

¡Hola! Aquí tienes el contenido de Threads que solicitaste:

👤 *Creador*: ${info.author || "Desconocido"}
📝 *Texto de la publicación*: ${cleanText(info.title) || cleanText(info.description) || "Sin descripción."}
📊 *Cantidad de archivos multimedia*: ${result.length} archivo(s)

*¡Espero que te sea de utilidad!* No olvides volver si quieres descargar algo más. 🚀`;

    const mediaList = [];
    for (const item of result) {
      if (item.Type === "image") {
        mediaList.push({ image: { url: item.Result_url } });
      } else if (item.Type === "video") {
        mediaList.push({ video: { url: item.Result_url } });
      }
    }

    if (mediaList.length > 1) {
      await sock.sendMessage(m.chat, { text: captionText }, { quoted: m });
      await sock.sendMessage(m.chat, { albumMessage: mediaList }, { quoted: m });
    } else if (mediaList.length === 1) {
      const media = mediaList[0];
      media.caption = captionText;
      await sock.sendMessage(m.chat, media, { quoted: m });
    }

    await m.react("✅");

  } catch (err) {
    console.error("[ThreadsDL]", err.message);
    await m.react("☢");
    m.reply("😔 *Parece que hay un problema en mi sistema.* \n\nOcurrió un error grave al intentar procesar ese enlace de Threads. ¡Por favor, inténtalo de nuevo más tarde!");
  }
}

export { pluginConfig as config, handler };
