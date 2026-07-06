import { getCaseCount, getCasesByCategory } from "../../case/ourin.js";
import {
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  proto,
} from "ourin";
import { createCanvas, loadImage, GlobalFonts } from "@napi-rs/canvas";
import _sharp from "sharp";
import config from "../../config.js";
import {
  formatUptime,
  getTimeGreeting,
} from "../../src/lib/ourin-formatter.js";
import {
  getCommandsByCategory,
  getCategories,
} from "../../src/lib/ourin-plugins.js";
import { getDatabase } from "../../src/lib/ourin-database.js";
import fs from "fs";
import path from "path";

function getSharp() {
  return _sharp;
}
import axios from "axios";
import sharp from "sharp";
const pluginConfig = {
  name: "menu",
  alias: ["help", "bantuan", "commands", "m"],
  category: "main",
  description: "Muestra el menú principal del bot",
  usage: ".menu",
  example: ".menu",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};
const CATEGORY_EMOJIS = {
  owner: "👑",
  main: "🏠",
  utility: "🔧",
  tools: "🛠️",
  fun: "🎮",
  game: "🎯",
  download: "📥",
  downloader: "📥",
  search: "🔍",
  sticker: "🖼️",
  media: "🎬",
  ai: "🤖",
  group: "👥",
  religi: "☪️",
  islamic: "🕌",
  info: "ℹ️",
  cek: "📁",
  user: "📊",
  canvas: "🎨",
  random: "🎲",
  ephoto: "🖌️",
  jpm: "📨",
  anime: "🍥",
  asupan: "🎞️",
  clan: "⚔️",
  convert: "🔄",
  berita: "📰",
  rpg: "🗡️",
  nsfw: "🔞",
  linode: "☁️",
  primbon: "🔮",
  cecan: "💃",
  stalker: "🕵️",
  tts: "🗣️",
  vps: "🌊",
  panel: "🖥️"
};
function toSmallCaps(text) {
  const smallCaps = {
    a: "ᴀ",
    b: "ʙ",
    c: "ᴄ",
    d: "ᴅ",
    e: "ᴇ",
    f: "飾",
    g: "ɢ",
    h: "ʜ",
    i: "ɪ",
    j: "ᴊ",
    k: "ᴋ",
    l: "ʟ",
    m: "ᴍ",
    n: "ɴ",
    o: "ᴏ",
    p: "ᴘ",
    q: "ǫ",
    r: "ʀ",
    s: "s",
    t: "ᴛ",
    u: "ᴜ",
    v: "ᴠ",
    w: "ᴡ",
    x: "x",
    y: "ʏ",
    z: "ᴢ",
  };
  return text
    .toLowerCase()
    .split("")
    .map((c) => smallCaps[c] || c)
    .join("");
}
const toMonoUpperBold = (text) => {
  const chars = {
    A: "𝗔",
    B: "𝗕",
    C: "𝗖",
    D: "𝗗",
    E: "𝗘",
    F: "𝗙",
    G: "𝗚",
    H: "𝗛",
    I: "𝗜",
    J: "𝗝",
    K: "𝗞",
    L: "𝗟",
    M: "𝗠",
    N: "𝗡",
    O: "𝗢",
    P: "ᴘ",
    Q: "𝗤",
    R: "𝗥",
    S: "𝗦",
    T: "𝗧",
    U: "𝗨",
    V: "𝗩",
    W: "𝗪",
    X: "𝗫",
    Y: "𝗬",
    Z: "𝗭",
  };
  return text
    .toUpperCase()
    .split("")
    .map((c) => chars[c] || c)
    .join("");
};
function getSortedCategories(m, botMode) {
  const categories = getCategories();
  const commandsByCategory = getCommandsByCategory();
  const categoryOrder = [
    "owner",
    "main",
    "utility",
    "tools",
    "fun",
    "game",
    "download",
    "search",
    "sticker",
    "media",
    "ai",
    "group",
    "religi",
    "info",
    "cek",
    "economy",
    "user",
    "canvas",
    "random",
    "premium",
    "ephoto",
    "jpm",
    "pushkontak",
    "panel",
    "store"
  ];
  let modeAllowedMap = {
    md: null,
    cpanel: ["main", "group", "sticker", "owner", "tools", "panel"],
    store: ["main", "group", "sticker", "owner", "store"],
    pushkontak: ["main", "group", "sticker", "owner", "pushkontak"],
  };
  let modeExcludeMap = {
    md: ["panel", "pushkontak", "store"],
    cpanel: null,
    store: null,
    pushkontak: null,
  };
  const allowedCats = modeAllowedMap[botMode];
  const excludeCats = modeExcludeMap[botMode] || [];
  const sortedCats = [...categories].sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });
  const result = [];
  let totalCmds = 0;
  for (const cat of sortedCats) {
    if (cat === "owner" && !m.isOwner) continue;
    if (allowedCats && !allowedCats.includes(cat.toLowerCase())) continue;
    if (excludeCats && excludeCats.includes(cat.toLowerCase())) continue;
    const cmds = commandsByCategory[cat] || [];
    if (cmds.length === 0) continue;
    const emoji = CATEGORY_EMOJIS[cat] || "📁";
    result.push({ cat, cmds, emoji });
  }
  for (const cat of categories) {
    totalCmds += (commandsByCategory[cat] || []).length;
  }
  return { sorted: result, totalCmds, commandsByCategory };
}
async function formatTime(date) {
  const timeHelper = await import("../../src/lib/ourin-time.js");
  return timeHelper.formatTime("HH:mm");
}
async function formatDateShort(date) {
  const timeHelper = await import("../../src/lib/ourin-time.js");
  return timeHelper.formatFull("dddd, DD MMMM YYYY");
}
async function buildMenuText(
  m,
  botConfig,
  db,
  uptime,
  botMode = "md",
  useBracketBoxStyle = false,
) {
  const prefix = botConfig.command?.prefix || ".";
  const user = db.getUser(m.sender);
  const timeHelper = await import("../../src/lib/ourin-time.js");
  const timeStr = timeHelper.formatTime("HH:mm");
  const dateStr = timeHelper.formatFull("dddd, DD MMMM YYYY");
  const categories = getCategories();
  const commandsByCategory = getCommandsByCategory();
  let totalCommands = 0;
  for (const category of categories) {
    totalCommands += (commandsByCategory[category] || []).length;
  }
  const totalCases = getCaseCount();
  const casesByCategory = getCasesByCategory();
  const totalFeatures = totalCommands + totalCases;
  let userRole = "Usuario",
    roleEmoji = "👤";
  if (m.isOwner) {
    userRole = "Creador";
    roleEmoji = "👑";
  } else if (m.isPremium) {
    userRole = "Premium";
    roleEmoji = "💎";
  }
  const greeting = getTimeGreeting();
  const uptimeFormatted = formatUptime(uptime);
  const totalUsers = db.getUserCount();
  let txt = `Hola *@${m.pushName || "Usuario"}* 🪸
Soy ${botConfig.bot?.name || "Nino-AI"}, un bot de WhatsApp listo para ayudarte.  
Puedes usarme para buscar información, obtener datos o ayudarte con tareas sencillas directamente desde WhatsApp — práctico y sin complicaciones.`;
  const botInfoLines = [
    `🖐 ɴᴏᴍʙʀᴇ    : ${botConfig.bot?.name || "Nino-AI"}`,
    `🔑 ᴠᴇʀsɪᴏ́ɴ  : v${botConfig.bot?.version || "1.2.0"}`,
    `⚙️ ᴍᴏᴅᴏ     : ${(botConfig.mode || "public").toUpperCase()}`,
    `🧶 ᴘʀᴇꜰɪᴊᴏ   : [ ${prefix} ]`,
    `⏱ ᴀᴄᴛɪᴠᴏ   : ${uptimeFormatted}`,
    `👥 ᴛᴏᴛᴀʟ    : ${totalUsers} Usuarios`,
    `🏷 ɢʀᴜᴘᴏ     : ${botMode.toUpperCase()}`,
    `👑 ᴄʀᴇᴀᴅᴏʀ  : ${botConfig.owner?.name || "Nino-AI"}`,
  ];
  const userInfoLines = [
    `🙋 ɴᴏᴍʙʀᴇ    : ${m.pushName}`,
    `🎭 ʀᴏʟ       : ${roleEmoji} ${userRole}`,
    `🎟 ᴇɴᴇʀɢɪ́ᴀ  : ${m.isOwner || m.isPremium ? "∞ Ilimitada" : (user?.energi ?? 25)}`,
    `⚡ ɴɪᴠᴇʟ    : ${Math.floor((user?.exp || 0) / 20000) + 1}`,
    `✨ ᴇxᴘ       : ${(user?.exp ?? 0).toLocaleString()}`,
    `💰 ᴍᴏɴᴇᴅᴀs  : ${(user?.koin ?? 0).toLocaleString()}`,
  ];
  const rpg = user?.rpg || {};
  if (rpg.health !== undefined) {
    userInfoLines.push(
      `❤️ ᴠɪᴅᴀ      : ${rpg.health}/${rpg.maxHealth || rpg.health}`,
    );
    userInfoLines.push(`🔮 ᴍᴀɴᴀ́      : ${rpg.mana}/${rpg.maxMana || rpg.mana}`);
    userInfoLines.push(
      `🏃 ᴇsᴛᴀ́ᴍɪɴᴀ  : ${rpg.stamina}/${rpg.maxStamina || rpg.stamina}`,
    );
  }
  const inv = user?.inventory || {};
  const invCount = Object.values(inv).reduce(
    (a, b) => a + (typeof b === "number" ? b : 0),
    0,
  );
  if (invCount > 0) userInfoLines.push(`🎒 ɪɴᴠᴇɴᴛᴀʀɪᴏ : ${invCount} objetos`);
  userInfoLines.push(`🕒 ʜᴏʀᴀ     : ${timeStr} WIB`);
  userInfoLines.push(`📅 ꜰᴇᴄʜᴀ     : ${dateStr}`);

  if (useBracketBoxStyle) {
    txt += `\n\n`;
    txt += createBracketBox("INFO DEL BOT", botInfoLines);
    txt += createBracketBox("INFO DE USUARIO", userInfoLines);
  } else {
    txt += `\n\n╭─〔 🤖 *ɪɴꜰᴏ ᴅᴇʟ ʙᴏᴛ* 〕\n`;
    txt += `*│* 🖐 ɴᴏᴍʙʀᴇ    : *${botConfig.bot?.name || "Nino-AI"}*\n`;
    txt += `*│* 🔑 ᴠᴇʀsɪᴏ́ɴ  : *v${botConfig.bot?.version || "1.2.0"}*\n`;
    txt += `*│* ⚙️ ᴍᴏᴅᴏ     : *${(botConfig.mode || "public").toUpperCase()}*\n`;
    txt += `*│* 🧶 ᴘʀᴇꜰɪᴊᴏ   : *[ ${prefix} ]*\n`;
    txt += `*│* ⏱ ᴀᴄᴛɪᴠᴏ   : *${uptimeFormatted}*\n`;
    txt += `*│* 👥 ᴛᴏᴛᴀʟ    : *${totalUsers} Usuarios*\n`;
    txt += `*│* 🏷 ɢʀᴜᴘᴏ     : *${botMode.toUpperCase()}*\n`;
    txt += `*│* 👑 ᴄʀᴇᴀᴅᴏʀ  : *${botConfig.owner?.name || "Nino-AI"}*\n`;
    txt += `╰────────────────⬣\n\n`;
    txt += `╭─〔 👤 *ɪɴꜰᴏ ᴅᴇ ᴜsᴜᴀʀɪᴏ* 〕\n`;
    txt += `*│* 🙋 ɴᴏᴍʙʀᴇ    : *${m.pushName}*\n`;
    txt += `*│* 🎭 ʀᴏʟ       : *${roleEmoji} ${userRole}*\n`;
    txt += `*│* 🎟 ᴇɴᴇʀɢɪ́ᴀ  : *${m.isOwner || m.isPremium ? "∞ Ilimitada" : (user?.energi ?? 25)}*\n`;
    txt += `*│* ⚡ ɴɪᴠᴇʟ    : *${Math.floor((user?.exp || 0) / 20000) + 1}*\n`;
    txt += `*│* ✨ ᴇxᴘ       : *${(user?.exp ?? 0).toLocaleString()}*\n`;
    txt += `*│* 💰 ᴍᴏɴᴇᴅᴀs  : *${(user?.koin ?? 0).toLocaleString()}*\n`;
    if (rpg.health !== undefined) {
      txt += `*│* ❤️ ᴠɪᴅᴀ      : *${rpg.health}/${rpg.maxHealth || rpg.health}*\n`;
      txt += `*│* 🔮 ᴍᴀɴᴀ́      : *${rpg.mana}/${rpg.maxMana || rpg.mana}*\n`;
      txt += `*│* 🏃 ᴇsᴛᴀ́ᴍɪɴᴀ  : *${rpg.stamina}/${rpg.maxStamina || rpg.stamina}*\n`;
    }
    if (invCount > 0) txt += `*│* 🎒 ɪɴᴠᴇɴᴛᴀʀɪᴏ : *${invCount} objetos*\n`;
    txt += `*│* 🕒 ʜᴏʀᴀ     : *${timeStr} WIB*\n`;
    txt += `*│* 📅 ꜰᴇᴄʜᴀ     : *${dateStr}*\n`;
    txt += `╰────────────────⬣\n\n`;
  }
  const categoryOrder = [
    "owner",
    "main",
    "utility",
    "tools",
    "fun",
    "game",
    "download",
    "search",
    "sticker",
    "media",
    "ai",
    "group",
    "religi",
    "info",
    "cek",
    "economy",
    "user",
    "canvas",
    "random",
    "premium",
    "ephoto",
    "jpm",
    "pushkontak",
    "panel",
    "store"
  ];
  const sortedCategories = [...categories].sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });
  let modeAllowedMap = {
    md: null,
    cpanel: ["main", "group", "sticker", "owner", "tools", "panel"],
    store: ["main", "group", "sticker", "owner", "store"],
    pushkontak: ["main", "group", "sticker", "owner", "pushkontak"],
  };
  let modeExcludeMap = {
    md: ["panel", "pushkontak", "store"],
    cpanel: null,
    store: null,
    pushkontak: null,
  };
  try {
    const botmodePlugin = await import("../group/botmode.js");
    if (botmodePlugin && botmodePlugin.MODES) {
      const modes = botmodePlugin.MODES;
      modeAllowedMap = {};
      modeExcludeMap = {};
      for (const [key, val] of Object.entries(modes)) {
        modeAllowedMap[key] = val.allowedCategories;
        modeExcludeMap[key] = val.excludeCategories;
      }
    }
  } catch (e) { }
  const allowedCategories = modeAllowedMap[botMode];
  const excludeCategories = modeExcludeMap[botMode] || [];
  const categoryLines = [];
  for (const category of sortedCategories) {
    if (category === "owner" && !m.isOwner) continue;
    if (
      allowedCategories &&
      !allowedCategories.includes(category.toLowerCase())
    )
      continue;
    if (excludeCategories && excludeCategories.includes(category.toLowerCase()))
      continue;
    const pluginCmds = commandsByCategory[category] || [];
    const caseCmds = casesByCategory[category] || [];
    const totalCmds = pluginCmds.length + caseCmds.length;
    if (totalCmds === 0) continue;
    const emoji = CATEGORY_EMOJIS[category] || "📁";
    categoryLines.push(`${prefix}menucat ${category} ${emoji}`);
  }
  if (useBracketBoxStyle) {
    txt += createBracketBox("LISTA DE CATEGORÍAS", categoryLines);
  } else {
    txt += `📂 *ʟɪsᴛᴀ ᴅᴇ ᴍᴇɴᴜ́s*\n`;
    for (const line of categoryLines) {
      txt += `- \`◦\` ${toSmallCaps(line)}\n`;
    }
  }
  return txt;
}

function createBracketBox(title, lines = [], emoji = "🤖") {
  let text = `╭─〔 ${emoji} \`${title}\`〕─⬣\n`;
  for (const line of lines) {
    text += `│ ✦ *${line}*\n`;
  }
  text += `╰─⬣\n\n`;
  return text;
}

function getContextInfo(
  botConfig,
  m,
  thumbBuffer,
  renderLargerThumbnail = false,
) {
  const saluranId = botConfig.saluran?.id || "120363400911374213@newsletter";
  const saluranName =
    botConfig.saluran?.name || botConfig.bot?.name || "Nino-AI";
  const saluranLink = botConfig.saluran?.link || "";
  const ctx = {
    mentionedJid: [m.sender],
    forwardingScore: 9,
    isForwarded: true,
    externalAdReply: {
      title: botConfig.bot?.name || "Nino-AI",
      body: `BOT WHATSAPP MULTI DEVICE`,
      sourceUrl: saluranLink,
      previewType: "VIDEO",
      showAdAttribution: false,
      renderLargerThumbnail,
    },
  };
  if (thumbBuffer) ctx.externalAdReply.thumbnail = thumbBuffer;
  return ctx;
}
function getVerifiedQuoted(botConfig, m) {
  if (m) {
    return {
      key: {
        participant: `${m.sender}`,
        remoteJid: `status@broadcast`,
      },
      message: {
        contactMessage: {
          displayName: `🍂 Estimado/a. ${m.pushName}`,
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;ttname,;;;\nFN:ttname\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Celular\nEND:VCARD`,
          sendEphemeral: true,
        },
      },
    };
  }
  return {
    key: {
      participant: `0@s.whatsapp.net`,
      remoteJid: `status@broadcast`,
    },
    message: {
      contactMessage: {
        displayName: `🪸 ${botConfig.bot?.name}`,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;ttname,;;;\nFN:ttname\nitem1.TEL;waid=13135550002:+1 (313) 555-0002\nitem1.X-ABLabel:Celular\nEND:VCARD`,
        sendEphemeral: true,
      },
    },
  };
}

async function handler(m, { sock, config: botConfig, db, uptime }) {
  const savedVariant = db.setting("menuVariant");
  const menuVariant = savedVariant || botConfig.ui?.menuVariant || 2;
  const groupData = m.isGroup ? db.getGroup(m.chat) || {} : {};
  const botMode = groupData.botMode || "md";
  const text = await buildMenuText(
    m,
    botConfig,
    db,
    uptime,
    botMode,
    menuVariant === 9,
  );

  let imageBuffer = null;
  let thumbBuffer = null;
  let videoBuffer = null;

  try {
    imageBuffer = fs.readFileSync(botConfig.assets["ourin"])
    thumbBuffer = fs.readFileSync(botConfig.assets["ourin2"])
  } catch (e) {
    console.error("Error al cargar los assets:", e.message);
  }
  const prefix = botConfig.command?.prefix || ".";
  const saluranId = botConfig.saluran?.id || "120363400911374213@newsletter";
  const saluranName =
    botConfig.saluran?.name || botConfig.bot?.name || "Nino-AI";
  const saluranLink =
    botConfig.saluran?.link ||
    "https://whatsapp.com/channel/0029VbB37bgBfxoAmAlsgE0t";
  const {
    sorted: menuSorted,
    totalCmds,
    commandsByCategory,
  } = getSortedCategories(m, botMode);
  const greeting = getTimeGreeting();
  const uptimeFormatted = formatUptime(uptime);
  const user = await db.getUser(m.sender) || {}
  try {
    const categories = getSortedCategories(m, botMode);
    const zann_pengin_rehat = categories.sorted.map(({ cat, cmds, emoji }) => {
      return {
        title: `${emoji} ${toMonoUpperBold(cat)}`,
        description: `Esta categoría tiene (${cmds.length}) Comandos`,
        id: `${m.prefix}menucat ${cat}`,
      };
    });
    switch (menuVariant) {
      case 1:
        if (imageBuffer) {
          await sock.sendMessage(m.chat, {
            image: fs.readFileSync(config.assets["ourin"]),
            caption: ``,
            footer: `Hola @${m.pushName} 👋
            
🌿 Bienvenido/a al asistente ${config.bot?.name || "Nino-AI"}

╭┈┈⫹⫺ *INFORMACIÓN DEL BOT* ⫹⫺┈┈╮
│ ◈ *Nombre del Bot* : *${config.bot?.name || "Nino-AI"}*
│ ◈ *Versión* : *${config.bot.version}* 
│ ◈ *Desarrollador* : *${config.bot.developer}* 
│ ◈ *Librería* : \`ourin-baileys\`
╰┈┈┈┈┈┈┈┈

╭┈┈⫹⫺ *INFORMACIÓN DE USUARIO* ⫹⫺┈┈╮
│ ◈ *Nombre* : *${m.pushName}*
│ ◈ *¿Miembro?* : *${m?.isOwner ? "No, es el Creador" : m?.isPremium ? "No, es Premium" : "Sí, Usuario"}*
│ ◈ *Nivel* : *${user.level || 0}*
│ ◈ *Exp* : *${user.exp || 0}* 
│ ◈ *Energía* : *${user.energi || 0}*
│ ◈ *Monedas* : *${user.koin || 0}*
│ ◈ *Registro* : *${user.isRegistered ? "Registrado" : "No registrado"}*
╰┈┈┈┈┈┈┈┈

Presiona el botón de abajo para más información y para elegir una categoría
`,
            interactiveButtons: [
              {
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                  title: "🍃 Menú Principal",
                  sections: [
                    {
                      title: "Aquí tienes las opciones",
                      rows: zann_pengin_rehat
                    }
                  ],
                  icon: "DEFAULT"
                })
              },
              {
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                  title: "Ver más",
                  sections: [
                    {
                      title: "Aquí tienes las opciones",
                      rows: [
                        {
                          title: "🍔 Ver todos los menús disponibles en este bot",
                          description: "Por favor presiona y envía",
                          id: `${m.prefix}sc`
                        },
                        {
                          title: "🥰 ¿Quieres tener un bot igual a este?",
                          description: "Presiona y envía, el bot te enviará un enlace de descarga",
                          id: `${m.prefix}sc`
                        },
                        {
                          title: "🌾 ¿Quién es el desarrollador de este bot?",
                          description: "Presiona y haz clic en enviar para continuar",
                          id: `${m.prefix}owner`
                        },
                      ]
                    }
                  ],
                  icon: "REVIEW"
                })
              },
            ]
          }, {
            quoted: getVerifiedQuoted(botConfig, m),
          })
        } else {
          await m.reply(text);
        }
        break;
      case 2:
        let s = ""
        categories.sorted.map(({ cat, cmds, emoji }) => {
          s += `╭─☰ ${toMonoUpperBold(cat)}\n`
          cmds.map((cmd) => {
            s += `> ${m.prefix}${cmd}\n`
          })
          s += "╰─⬣\n\n"
        });
        const media = await prepareWAMessageMedia({
          image: fs.readFileSync(config.assets["ourin"])
        }, { upload: sock.waUploadToServer })
        const readmore = String.fromCharCode(8206).repeat(4001)
        await sock.relayMessage(
          m.chat,
          {
            viewOnceMessage: {
              message: {
                messageContextInfo: {},
                interactiveMessage: {
                  header: {
                    title: "",
                    subtitle: "",
                    hasMediaAttachment: true,
                    imageMessage: media.imageMessage
                  },
                  body: {
                    text: `🥞 *Hola Hermano*

Bienvenido a ${config.bot?.name || "Nino-AI"}, nuestro bot te ayudará

🍅 *INFORMACIÓN DEL BOT*
> 🤖 *Nombre*: ${config.bot?.name || "Nino-AI"}
> ⚙️ *Versión*: ${config.bot?.version}
> 👨‍💻 *Desarrollador*: ${config.bot?.developer}
> 🧩 *Librería*: \`ourin-baileys\`

🍅 *INFORMACIÓN DE USUARIO*
> 🧑 *Nombre*: ${m.pushName}
> 🥐 *Rol*: ${m?.isOwner ? "🔥 Creador" : m?.isPremium ? "👑 Premium" : "😊 Usuario"}
> 🧀 *Nivel*: ${user.level || 0}
> 🍗 *Exp*: ${user.exp || 0}
> 🥩 *Energía*: ${user.energi || 0}
> 🎏 *Monedas*: ${user.koin || 0}
> 🍬 *Registro*: ${user.isRegistered ? "Registrado" : "No registrado"}

${readmore}${s}`
                  },
                  footer: {
                    text: "Selecciona el botón de abajo para más información"
                  },
                  contextInfo: {
                    isForwarded: true,
                    fprwardingScore: 9,
                    participant: "0@s.whatsapp.net",
                    quotedMessage: {
                      conversation: `${config.bot?.name || "Nino-AI"}`
                    },
                    mentionedJid: [
                      `${m.sender}`
                    ]
                  },
                  nativeFlowMessage: {
                    messageParamsJson: JSON.stringify({
                      limited_time_offer: {
                        text: `${greeting}`,
                        url: "Hola",
                        copy_code: "Creado por " + config.bot?.developer,
                        expiration_time: Date.now() + 1000000,
                      },
                      bottom_sheet: {
                        in_thread_buttons_limit: 2,
                        divider_indices: [1, 2, 3, 4, 5, 999],
                        list_title: "Por favor selecciona el menú que deseas",
                        button_title: "🍅 Ver más",
                      },
                      tap_target_configuration: {
                        title: " X ",
                        description: "bomboclard",
                        canonical_url: "https://ourin.site",
                        domain: "shop.example.com",
                        button_index: 0,
                      },
                    }),
                    buttons: [
                      {
                        name: "single_select",
                        buttonParamsJson: JSON.stringify({
                          has_multiple_buttons: true
                        })
                      },
                      {
                        name: "cta_url",
                        buttonParamsJson: JSON.stringify({
                          display_text: "🍫 Nuestro Creador",
                          url: `https://wa.me/${botConfig.owner?.number?.[0]}`,
                          merchant_url: `https://wa.me/${config.owner?.number?.[0]}`,
                        })
                      },
                      {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                          display_text: "🍛 Obtener Script ( Gratis )",
                          id: `${m.prefix}sc`
                        })
                      }
                    ]
                  }
                }
              }
            }
          },
          {}
        )

        break;

      case 3:
        const content = {
          buttonsMessage: {
            buttons: [
              {
                buttonId: `${m.prefix}owner`,
                buttonText: {
                  displayText: '🧀 Creador',
                },
                type: 1,
              },
              {
                buttonId: `${m.prefix}allmenu`,
                buttonText: {
                  displayText: '💐 Todo el menú',
                },
                type: 1,
              },
            ],
            locationMessage: {
              jpegThumbnail: await sharp(fs.readFileSync(config.assets["ourin"])).resize(300, 170).toBuffer(),
              name: config.bot?.name || "Nino-AI",
              address: `Versión actual: ${config.bot.version}`
            },
            contentText: `🥞 *Hola Hermano*

Bienvenido a ${config.bot?.name || "Nino-AI"}, nuestro bot te ayudará

🍅 *INFORMACIÓN DEL BOT*
> 🤖 *Nombre*: ${config.bot?.name || "Nino-AI"}
> ⚙️ *Versión*: ${config.bot?.version}
> 👨‍💻 *Desarrollador*: ${config.bot?.developer}
> 🧩 *Librería*: \`ourin-baileys\`

🍅 *INFORMACIÓN DE USUARIO*
> 🧑 *Nombre*: ${m.pushName}
> 🥐 *Rol*: ${m?.isOwner ? "🔥 Creador" : m?.isPremium ? "👑 Premium" : "😊 Usuario"}
> 🧀 *Nivel*: ${user.level || 0}
> 🍗 *Exp*: ${user.exp || 0}
> 🥩 *Energía*: ${user.energi || 0}
> 🎏 *Monedas*: ${user.koin || 0}
> 🍬 *Registro*: ${user.isRegistered ? "Registrado" : "No registrado"}`,
            footerText: '🍔 Por favor selecciona uno de los botones de abajo',
            headerType: 6,
          },
        };

        const msg = generateWAMessageFromContent(m.chat, content, {
          userJid: sock.user.jid,
        });

        await sock.relayMessage(m.chat, msg.message, {
          messageId: msg.key.id,
        });
        break

      case 4: {
        const thumbnail = await sharp(fs.readFileSync(config.assets["ourin"])).resize(300, 300).toBuffer()
        const qvideo = {
          key: {
            fromMe: false,
            participant: m.sender
          },
          message: {
            videoMessage: {
              caption: config.bot?.name || "Nino-AI",
              seconds: 999999999,
              mimetype: "video/mp4",
              jpegThumbnail: thumbnail,
              fileLength: "9999999"
            }
          }
        }
        const media4 = await prepareWAMessageMedia({
          video: fs.readFileSync(config.assets["ourin-mp4"]),
          gifPlayback: true
        }, { upload: sock.waUploadToServer });
        let singlePush = categories.sorted.map(cat => {
          return {
            name: "single_select",
            buttonParamsJson: JSON.stringify({
              title: `Menú de ${cat.emoji} ${cat.cat}`,
              sections: [
                {
                  title: "Por favor selecciona el comando",
                  highlight_label: config.bot?.name || "Nino-AI",
                  rows: cat.cmds.map((cmd, i) => {
                    return {
                      title: (i + 1).toString() + " " + cmd,
                      description: "¿Seleccionar este comando?",
                      id: `${prefix}${cmd}`
                    }
                  }
                  )
                }
              ],
              icon: "REVIEW"
            })
          }
        })
        const msg4 = generateWAMessageFromContent(m.chat, {
          viewOnceMessage: {
            message: {
              messageContextInfo: {},
              interactiveMessage: {
                header: {
                  title: "",
                  subtitle: "",
                  hasMediaAttachment: true,
                  videoMessage: media4.videoMessage
                },
                footer: {
                  text: `Por favor selecciona el botón de abajo`
                },
                body: {
                  text: `*${greeting} ${m.pushName}*, mi nombre es ${config.bot?.name || "Nino-AI"}.

  🏔 Puedo ayudarte con varias tareas dentro de WhatsApp. Y cuento con un programa en Javascript desarrollado por mi creador.

\`INFORMACIÓN DEL BOT\`
> 🍛 *Creador*: ${config.bot?.developer}
> 🥞 *Nombre*: ${config.bot?.name || "Nino-AI"}
> 🥩 *Versión*: ${config.bot?.version}
> 🍂 *Tipo*: \`Plugins x Cases\`
> Bone *Modo*: *${config.mode === 'public' ? '🍕 Desbloqueado para todos' : '🥖 Solo para el Creador'}*

Disfruta de mi servicio, hermano.`
                },
                contextInfo: {
                  mentionedJid: [m.sender],
                  isForwarded: true,
                  forwardingScore: 9,
                  forwardedNewsletterMessageInfo: {
                    newsletterJid: saluranId,
                    newsletterName: "Nino-AI Updates",
                    serverMessageId: 127,
                  },
                },
                nativeFlowMessage: {
                  messageParamsJson: JSON.stringify({
                    bottom_sheet: {
                      in_thread_buttons_limit: 2,
                      divider_indices: [1, 2, 3, 4, 5, 999],
                      list_title: "Por favor selecciona el menú",
                      button_title: "🍙 Ver Categorías",
                    },
                    tap_target_configuration: {
                      title: " X ",
                      description: "bomboclard",
                      canonical_url: "https://ourin.site",
                      domain: "shop.example.com",
                      button_index: 0,
                    },
                  }),
                  buttons: [
                    {
                      name: "cta_url",
                      buttonParamsJson: JSON.stringify({
                        display_text: "🧀 Visita a mi Creador",
                        url: `https://wa.me/${botConfig.owner?.number?.[0]}`,
                        merchant_url: `https://wa.me/${config.owner?.number?.[0]}`,
                      })
                    },
                    ...singlePush
                  ]
                }
              }
            }
          }
        }, { quoted: qvideo, userJid: sock.user.jid });

        await sock.relayMessage(m.chat, msg4.message, {
          messageId: msg4.key.id,
        });
        break;
      }

      case 5: {
        function runtime(seconds) {
          seconds = Number(seconds);

          const d = Math.floor(seconds / (3600 * 24));
          const h = Math.floor(seconds % (3600 * 24) / 3600);
          const m = Math.floor(seconds % 3600 / 60);
          const s = Math.floor(seconds % 60);

          return `${d} Días ${h} Horas ${m} Minutos ${s} Segundos`;
        }

        const weatherCode = {
          0: "☀️ Cerah",
          1: "🌤️ Cerah Berawan",
          2: "⛅ Berawan",
          3: "☁️ Mendung",
          45: "🌫️ Berkabut",
          48: "🌫️ Kabut Tebal",
          51: "🌦️ Gerimis",
          61: "🌧️ Hujan Ringan",
          63: "🌧️ Hujan",
          65: "⛈️ Hujan Lebat",
          80: "🌦️ Hujan Lokal",
          95: "⛈️ Badai Petir"
        }

        async function weatherMenu(city = "Jakarta") {
          try {
            const geo = await axios.get(
              `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
            )

            const loc = geo.data.results?.[0]
            if (!loc) return "Clima no disponible"

            const res = await axios.get(
              `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code`
            )

            const current = res.data.current
            const kondisi = weatherCode[current.weather_code] || "🌍 Desconocido"

            return `${kondisi} | 🌡️ ${Math.round(current.temperature_2m)}°C\n📍 ${loc.name}`
          } catch {
            return "Clima no disponible"
          }
        }
        const thumbnail = await sharp(fs.readFileSync(config.assets["ourin"])).resize(300, 300).toBuffer()
        const qOrder = {
          key: {
            fromMe: false,
            participant: '0@s.whatsapp.net',
            remoteJid: m.sender
          },
          message: {
            locationMessage: {
              degreesLatitude: 0,
              degreesLongitude: 0,
              name: await weatherMenu(),
              jpegThumbnail: thumbnail
            }
          }
        }
        const media4 = await prepareWAMessageMedia({
          video: fs.readFileSync(config.assets["ourin-mp4"]),
          gifPlayback: true
        }, { upload: sock.waUploadToServer });
        const msg4 = generateWAMessageFromContent(m.chat, {
          viewOnceMessage: {
            message: {
              messageContextInfo: {},
              interactiveMessage: {
                header: {
                  title: "",
                  subtitle: "",
                  hasMediaAttachment: true,
                  videoMessage: media4.videoMessage
                },
                footer: {
                  text: `Por favor selecciona el botón de abajo`
                },
                body: {
                  text: `🍟 Hola *${m.pushName}* _Soy un sistema automatizado (bot de WhatsApp) que puede ayudarte a realizar búsquedas y obtener datos o información únicamente a través de WhatsApp._

*\`乂 I N F O - B O T\`*
┌ ◦ Nombre : ${config.bot?.name || "Nino-AI"}
│ ◦ Autor : @${config.bot.developer}
│ ◦ Tipo de Script : Case x Plugins
│ ◦ Tiempo activo : ${runtime(process.uptime())}
└ ◦ Versión : ${config.bot.version}

*\`乂 I N F O - U S E R\`*
┌ ◦ Nombre : ${m.pushName}
│ ◦ Estado : ${m.isOwner ? "👑 Creador" : m.isPremium ? "💎 Premium" : "🏷️ Gratuito"}
│ ◦ Modo : ${config.mode === "public" ? "Puede ser usado por todos" : "Solo Creador :b"}
│ ◦ Número : @${m.sender.split("@")[0]}
└ ◦ ${greeting}
`
                },
                contextInfo: {
                  mentionedJid: [m.sender],
                  isForwarded: true,
                  forwardingScore: 9,
                  forwardedNewsletterMessageInfo: {
                    newsletterJid: saluranId,
                    newsletterName: "Nino-AI Updates",
                    serverMessageId: 127,
                  },
                },
                nativeFlowMessage: {
                  messageParamsJson: JSON.stringify({
                    bottom_sheet: {
                      in_thread_buttons_limit: 2,
                      divider_indices: [1, 2, 3, 4, 5, 999],
                      list_title: "Por favor selecciona el menú",
                      button_title: "🍙 Ver Categorías",
                    },
                    tap_target_configuration: {
                      title: " X ",
                      description: "bomboclard",
                      canonical_url: "https://ourin.site",
                      domain: "shop.example.com",
                      button_index: 0,
                    },
                  }),
                  buttons: [
                    {
                      name: "single_select",
                      buttonParamsJson: JSON.stringify({
                        title: "🍃 Menú Principal",
                        sections: [
                          {
                            title: "Aquí tienes las opciones",
                            rows: zann_pengin_rehat
                          }
                        ],
                        icon: "DEFAULT"
                      })
                    },
                    {
                      name: "cta_url",
                      buttonParamsJson: JSON.stringify({
                        display_text: "🧀 Visita a mi Creador",
                        url: `https://wa.me/${botConfig.owner?.number?.[0]}`,
                        merchant_url: `https://wa.me/${config.owner?.number?.[0]}`,
                      })
                    }
                  ]
                }
              }
            }
          }
        }, { quoted: qOrder, userJid: sock.user.jid });

        await sock.relayMessage(m.chat, msg4.message, {
          messageId: msg4.key.id,
        });
        break;
      }
      default:
        await m.reply(text);
        break;
    }
  } catch (err) {
    console.error("Error en el manejador del menú:", err);
    await m.reply(text);
  }
}
handler.command = ["menu"];
export default handler;
