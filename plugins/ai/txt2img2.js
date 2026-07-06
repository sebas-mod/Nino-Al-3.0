import { Txt2Img2 } from "../../src/scraper/txt2img2.js";

const pluginConfig = {
  name: "text2img4",
  alias: ["t2i2", "imggen2", "flux"],
  category: "ai",
  description: "Crea imágenes a partir de texto usando Flux Klein 4B",
  usage: ".txt2img2 <descripción de la imagen>",
  example: ".txt2img2 Mobil Lamborghini revuelto",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 3,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = m.args.join(" ");
  if (!text) {
    m.react("❌");
    return m.reply(
      `🎨 *Text to Image (Flux)*\n\n` +
      `Crea imágenes a partir de descripciones de texto usando la IA Flux Klein 4B.\n\n` +
      `*MODO DE USO:*\n` +
      `> *${m.prefix}txt2img2 <descripción>*\n\n` +
      `*EJEMPLOS:*\n` +
      `> *${m.prefix}txt2img2 un auto Lamborghini revuelto*\n` +
      `> *${m.prefix}txt2img2 un gato tierno usando un sombrero*\n\n` +
      `_El proceso de generación puede tardar un poco, entre 30 y 60 segundos_`
    );
  }

  m.react("🕕");

  try {
    const result = await Txt2Img2(text);

    if (!result.status) {
      m.react("☢");
      return m.reply(`❌ *Error de Generación*\n\n> ${result.error}`);
    }

    await sock.sendMedia(m.chat, result.url, `🎨 *Flux Klein 4B*\n\n> Prompt: *${result.prompt}*`, m, {
      type: "image",
    });

    m.react("✅");
  } catch (e) {
    console.error(e);
    m.react("☢");
    m.reply("❌ Error al generar la imagen, por favor inténtalo de nuevo más tarde");
  }
}

export { pluginConfig as config, handler };
