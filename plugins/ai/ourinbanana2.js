import { fluxImage } from "../../src/scraper/seaart.js";

const pluginConfig = {
  name: "ourinbanana2",
  alias: [],
  category: "ai",
  description: "Crea imágenes con IA usando un prompt",
  usage: ".ourinbanana2 <prompt>",
  example: ".ourinbanana2 dibuja un gato",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const prompt = m.text;
  if (!prompt) {
    return m.reply(
      `🍌 *OURIN BANANA SUPER 2*\n\n` +
        `> Crea imágenes con IA\n\n` +
        `\`Ejemplo: ${m.prefix}ourinbanana2 dibuja un gato\``,
    );
  }

  m.react("🕕");

  try {
    const result = await fluxImage(prompt, "1:1");
    const imageUrl = result.url;

    m.react("✅");

    await sock.sendMedia(m.chat, imageUrl, null, m, {
      type: "image",
    });
  } catch (error) {
    console.log(error);
    m.react("❌");
    const msg =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error.message ||
      "Ocurrió un error";
    m.reply(`🍀 *Vaya, parece que hay un problema*

${msg}

Por favor, inténtalo de nuevo más tarde, se ruega no hacer spam`);
  }
}

export { pluginConfig as config, handler };
