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
  description: "Muestra el menu principal del bot",
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
  owner: "ðŸ‘‘",
  main: "ðŸ ",
  utility: "ðŸ”§",
  tools: "ðŸ› ï¸",
  fun: "ðŸŽ®",
  game: "ðŸŽ¯",
  download: "ðŸ“¥",
  downloader: "ðŸ“¥",
  search: "ðŸ”",
  sticker: "ðŸ–¼ï¸",
  media: "ðŸŽ¬",
  ai: "ðŸ¤–",
  group: "ðŸ‘¥",
  religi: "â˜ªï¸",
  islamic: "ðŸ•Œ",
  info: "â„¹ï¸",
  cek: "ðŸ“",
  user: "ðŸ“Š",
  canvas: "ðŸŽ¨",
  random: "ðŸŽ²",
  ephoto: "ðŸ–Œï¸",
  jpm: "ðŸ“¨",
  anime: "ðŸ¥",
  asupan: "ðŸŽžï¸",
  clan: "âš”ï¸",
  convert: "ðŸ”„",
  berita: "ðŸ“°",
  rpg: "ðŸ—¡ï¸",
  nsfw: "ðŸ”ž",
  linode: "â˜ï¸",
  primbon: "ðŸ”®",
  cecan: "ðŸ’ƒ",
  stalker: "ðŸ•µï¸",
  tts: "ðŸ—£ï¸",
  vps: "ðŸŒŠ",
  panel: "ðŸ–¥ï¸"
};
function toSmallCaps(text) {
  const smallCaps = {
    a: "á´€",
    b: "Ê™",
    c: "á´„",
    d: "á´…",
    e: "á´‡",
    f: "êœ°",
    g: "É¢",
    h: "Êœ",
    i: "Éª",
    j: "á´Š",
    k: "á´‹",
    l: "ÊŸ",
    m: "á´",
    n: "É´",
    o: "á´",
    p: "á´˜",
    q: "Ç«",
    r: "Ê€",
    s: "s",
    t: "á´›",
    u: "á´œ",
    v: "á´ ",
    w: "á´¡",
    x: "x",
    y: "Ê",
    z: "á´¢",
  };
  return text
    .toLowerCase()
    .split("")
    .map((c) => smallCaps[c] || c)
    .join("");
}
const toMonoUpperBold = (text) => {
  const chars = {
    A: "ð—”",
    B: "ð—•",
    C: "ð—–",
    D: "ð——",
    E: "ð—˜",
    F: "ð—™",
    G: "ð—š",
    H: "ð—›",
    I: "ð—œ",
    J: "ð—",
    K: "ð—ž",
    L: "ð—Ÿ",
    M: "ð— ",
    N: "ð—¡",
    O: "ð—¢",
    P: "ð—£",
    Q: "ð—¤",
    R: "ð—¥",
    S: "ð—¦",
    T: "ð—§",
    U: "ð—¨",
    V: "ð—©",
    W: "ð—ª",
    X: "ð—«",
    Y: "ð—¬",
    Z: "ð—­",
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
    const emoji = CATEGORY_EMOJIS[cat] || "ðŸ“";
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
    roleEmoji = "ðŸ‘¤";
  if (m.isOwner) {
    userRole = "Owner";
    roleEmoji = "ðŸ‘‘";
  } else if (m.isPremium) {
    userRole = "Premium";
    roleEmoji = "ðŸ’Ž";
  }
  const greeting = getTimeGreeting();
  const uptimeFormatted = formatUptime(uptime);
  const totalUsers = db.getUserCount();
  let txt = `Hola *@${m.pushName || "Usuario"}* ðŸª¸
Soy Nino-Al, un bot de WhatsApp listo para ayudarte.  
Puedes usarme para buscar informacion, obtener datos o ayudarte con cosas simples directamente desde WhatsApp, de forma practica y sin complicaciones.`;
  const botInfoLines = [
    `ðŸ– É´á´€á´á´€     : Nino-Al`,
    `ðŸ”‘ á´ á´‡Ê€sÉª    : v${botConfig.bot?.version || "1.2.0"}`,
    `âš™ï¸ á´á´á´…á´‡     : ${(botConfig.mode || "public").toUpperCase()}`,
    `ðŸ§¶ á´˜Ê€á´‡êœ°Éªx    : [ ${prefix} ]`,
    `â± á´œá´˜á´›Éªá´á´‡   : ${uptimeFormatted}`,
    `ðŸ‘¥ á´›á´á´›á´€ÊŸ    : ${totalUsers} Usuarios`,
    `ðŸ· É¢Ê€á´á´œá´˜     : ${botMode.toUpperCase()}`,
    `ðŸ‘‘ á´á´¡É´á´‡Ê€    : Sebas-MD`,
  ];
  const userInfoLines = [
    `ðŸ™‹ É´á´€á´á´€     : ${m.pushName}`,
    `ðŸŽ­ Ê€á´ÊŸá´‡     : ${roleEmoji} ${userRole}`,
    `ðŸŽŸ á´‡É´á´‡Ê€É¢Éª   : ${m.isOwner || m.isPremium ? "âˆž Ilimitado" : (user?.energi ?? 25)}`,
    `âš¡ ÊŸá´‡á´ á´‡ÊŸ    : ${Math.floor((user?.exp || 0) / 20000) + 1}`,
    `âœ¨ á´‡xá´˜       : ${(user?.exp ?? 0).toLocaleString()}`,
    `ðŸ’° á´‹á´ÉªÉ´      : ${(user?.koin ?? 0).toLocaleString()}`,
  ];
  const rpg = user?.rpg || {};
  if (rpg.health !== undefined) {
    userInfoLines.push(
      `â¤ï¸ Êœá´˜        : ${rpg.health}/${rpg.maxHealth || rpg.health}`,
    );
    userInfoLines.push(`ðŸ”® á´á´€É´á´€      : ${rpg.mana}/${rpg.maxMana || rpg.mana}`);
    userInfoLines.push(
      `ðŸƒ sá´›á´€á´ÉªÉ´á´€   : ${rpg.stamina}/${rpg.maxStamina || rpg.stamina}`,
    );
  }
  const inv = user?.inventory || {};
  const invCount = Object.values(inv).reduce(
    (a, b) => a + (typeof b === "number" ? b : 0),
    0,
  );
  if (invCount > 0) userInfoLines.push(`ðŸŽ’ ÉªÉ´á´ á´‡É´á´›á´Ê€Ê : ${invCount} elementos`);
  userInfoLines.push(`ðŸ•’ á´¡á´€á´‹á´›á´œ    : ${timeStr} WIB`);
  userInfoLines.push(`ðŸ“… á´›á´€É´É¢É¢á´€ÊŸ  : ${dateStr}`);

  if (useBracketBoxStyle) {
    txt += `\n\n`;
    txt += createBracketBox("INFO DEL BOT", botInfoLines);
    txt += createBracketBox("INFO DEL USUARIO", userInfoLines);
  } else {
    txt += `\n\nâ•­â”€ã€” ðŸ¤– *Ê™á´á´› ÉªÉ´êœ°á´* ã€•\n`;
    txt += `*â”‚* ðŸ– É´á´€á´á´€     : *Nino-Al*\n`;
    txt += `*â”‚* ðŸ”‘ á´ á´‡Ê€sÉª    : *v${botConfig.bot?.version || "1.2.0"}*\n`;
    txt += `*â”‚* âš™ï¸ á´á´á´…á´‡     : *${(botConfig.mode || "public").toUpperCase()}*\n`;
    txt += `*â”‚* ðŸ§¶ á´˜Ê€á´‡êœ°Éªx    : *[ ${prefix} ]*\n`;
    txt += `*â”‚* â± á´œá´˜á´›Éªá´á´‡   : *${uptimeFormatted}*\n`;
    txt += `*â”‚* ðŸ‘¥ á´›á´á´›á´€ÊŸ    : *${totalUsers} Usuarios*\n`;
    txt += `*â”‚* ðŸ· É¢Ê€á´á´œá´˜     : *${botMode.toUpperCase()}*\n`;
    txt += `*â”‚* ðŸ‘‘ á´á´¡É´á´‡Ê€    : *Sebas-MD*\n`;
    txt += `â•°â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â¬£\n\n`;
    txt += `â•­â”€ã€” ðŸ‘¤ *á´œsá´‡Ê€ ÉªÉ´êœ°á´* ã€•\n`;
    txt += `*â”‚* ðŸ™‹ É´á´€á´á´€     : *${m.pushName}*\n`;
    txt += `*â”‚* ðŸŽ­ Ê€á´ÊŸá´‡     : *${roleEmoji} ${userRole}*\n`;
    txt += `*â”‚* ðŸŽŸ á´‡É´á´‡Ê€É¢Éª   : *${m.isOwner || m.isPremium ? "âˆž Ilimitado" : (user?.energi ?? 25)}*\n`;
    txt += `*â”‚* âš¡ ÊŸá´‡á´ á´‡ÊŸ    : *${Math.floor((user?.exp || 0) / 20000) + 1}*\n`;
    txt += `*â”‚* âœ¨ á´‡xá´˜       : *${(user?.exp ?? 0).toLocaleString()}*\n`;
    txt += `*â”‚* ðŸ’° á´‹á´ÉªÉ´      : *${(user?.koin ?? 0).toLocaleString()}*\n`;
    if (rpg.health !== undefined) {
      txt += `*â”‚* â¤ï¸ Êœá´˜        : *${rpg.health}/${rpg.maxHealth || rpg.health}*\n`;
      txt += `*â”‚* ðŸ”® á´á´€É´á´€      : *${rpg.mana}/${rpg.maxMana || rpg.mana}*\n`;
      txt += `*â”‚* ðŸƒ sá´›á´€á´ÉªÉ´á´€   : *${rpg.stamina}/${rpg.maxStamina || rpg.stamina}*\n`;
    }
    if (invCount > 0) txt += `*â”‚* ðŸŽ’ ÉªÉ´á´ á´‡É´á´›á´Ê€Ê : *${invCount} elementos*\n`;
    txt += `*â”‚* ðŸ•’ á´¡á´€á´‹á´›á´œ    : *${timeStr} WIB*\n`;
    txt += `*â”‚* ðŸ“… á´›á´€É´É¢É¢á´€ÊŸ  : *${dateStr}*\n`;
    txt += `â•°â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â¬£\n\n`;
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
    const emoji = CATEGORY_EMOJIS[category] || "ðŸ“";
    categoryLines.push(`${prefix}menucat ${category} ${emoji}`);
  }
  if (useBracketBoxStyle) {
    txt += createBracketBox("LISTA DE CATEGORIAS", categoryLines);
  } else {
    txt += `ðŸ“‚ *á´…á´€êœ°á´›á´€Ê€ á´á´‡É´á´œ*\n`;
    for (const line of categoryLines) {
      txt += `- \`â—¦\` ${toSmallCaps(line)}\n`;
    }
  }
  return txt;
}

function createBracketBox(title, lines = [], emoji = "ðŸ¤–") {
  let text = `â•­â”€ã€” ${emoji} \`${title}\`ã€•â”€â¬£\n`;
  for (const line of lines) {
    text += `â”‚ âœ¦ *${line}*\n`;
  }
  text += `â•°â”€â¬£\n\n`;
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
    botConfig.saluran?.name || "Nino-Al";
  const saluranLink = botConfig.saluran?.link || "";
  const ctx = {
    mentionedJid: [m.sender],
    forwardingScore: 9,
    isForwarded: true,
    externalAdReply: {
      title: "Nino-Al",
      body: `BOT DE WHATSAPP MULTIDISPOSITIVO`,
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
          displayName: `ðŸ‚ Estimado/a ${m.pushName}`,
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;ttname,;;;\nFN:ttname\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
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
        displayName: `ðŸª¸ Nino-Al`,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;ttname,;;;\nFN:ttname\nitem1.TEL;waid=13135550002:+1 (313) 555-0002\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
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
    console.error("Error al cargar assets:", e.message);
  }
  const prefix = botConfig.command?.prefix || ".";
  const saluranId = botConfig.saluran?.id || "120363400911374213@newsletter";
  const saluranName =
    botConfig.saluran?.name || "Nino-Al";
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
        description: `Esta categoria tiene (${cmds.length}) comandos`,
        id: `${m.prefix}menucat ${cat}`,
      };
    });
    switch (menuVariant) {
      case 1:
        if (imageBuffer) {
          await sock.sendMessage(m.chat, {
            image: fs.readFileSync(config.assets["ourin"]),
            caption: ``,
            footer: `Hola @${m.pushName} ðŸ‘‹
            
ðŸŒ¿ Bienvenido/a al asistente Nino-Al

â•­â”ˆâ”ˆâ«¹â«º *INFORMACION DEL BOT* â«¹â«ºâ”ˆâ”ˆâ•®
â”‚ â—ˆ *Nombre del bot* : *Nino-Al*
â”‚ â—ˆ *Version* : *${config.bot.version}*  
â”‚ â—ˆ *Desarrollador* : *Sebas-MD*  
â”‚ â—ˆ *Libreria* : \`ourin-baileys\`
â•°â”ˆâ”ˆâ”ˆâ”ˆâ”ˆâ”ˆâ”ˆâ”ˆ

â•­â”ˆâ”ˆâ«¹â«º *INFORMACION DEL USUARIO* â«¹â«ºâ”ˆâ”ˆâ•®
â”‚ â—ˆ *Nombre* : *${m.pushName}*
â”‚ â—ˆ *Miembro?* : *${m?.isOwner ? "No, pero es owner" : m?.isPremium ? "No, pero es premium" : "Si"}*
â”‚ â—ˆ *Nivel* : *${user.level || 0}*
â”‚ â—ˆ *Exp* : *${user.exp || 0}* 
â”‚ â—ˆ *Energia* : *${user.energi || 0}*
â”‚ â—ˆ *Monedas* : *${user.koin || 0}*
â”‚ â—ˆ *Registro* : *${user.isRegistroed ? "Si" : "No"}*
â”‚ â—ˆ *Energia* : *${user.energi || 0}*
â•°â”ˆâ”ˆâ”ˆâ”ˆâ”ˆâ”ˆâ”ˆâ”ˆ

Pulsa el boton de abajo para mas informacion y para elegir una categoria
`,
            interactiveButtons: [
              {
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                  title: "ðŸƒ Menu principal",
                  sections: [
                    {
                      title: "Estas son las opciones",
                      rows: zann_pengin_rehat
                    }
                  ],
                  icon: "DEFAULT"
                })
              },
              {
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                  title: "Ver mas",
                  sections: [
                    {
                      title: "Estas son las opciones",
                      rows: [
                        {
                          title: "ðŸ” Ver todos los menus disponibles en este bot",
                          description: "Toca y envia",
                          id: `${m.prefix}sc`
                        },
                        {
                          title: "ðŸ¥° Quieres tener uno igual a este bot?",
                          description: "Toca y envia; el bot te enviara un enlace de descarga",
                          id: `${m.prefix}sc`
                        },
                        {
                          title: "ðŸŒ¾ Quien es el owner de este bot?",
                          description: "Toca y pulsa enviar para continuar",
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
          s += `â•­â”€â˜° ${toMonoUpperBold(cat)}\n`
          cmds.map((cmd) => {
            s += `> ${m.prefix}${cmd}\n`
          })
          s += "â•°â”€â¬£\n\n"
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
                    text: `ðŸ¥ž *Hola*

Bienvenido/a a Nino-Al, nuestro bot te ayudara

ðŸ… *INFORMACION DEL BOT*
> ðŸ¤– *Nombre*: Nino-Al
> âš™ï¸ *Versionon*: ${config.bot?.version}
> ðŸ‘¨â€ðŸ’» *Desarrollador*: Sebas-MD
> ðŸ§© *Libreria*: \`ourin-baileys\`

ðŸ… *INFORMACION DEL USUARIO*
> ðŸ§‘ *Nombre*: ${m.pushName}
> ðŸ¥ *Rol*: ${m?.isOwner ? "ðŸ”¥ Owner" : m?.isPremium ? "ðŸ‘‘ Premium" : "ðŸ˜Š User"}
> ðŸ§€ *Nivel*: ${user.level || 0}
> ðŸ— *Exp*: ${user.exp || 0}
> ðŸ¥© *Energia*: ${user.energi || 0}
> ðŸŽ *Monedas*: ${user.koin || 0}
> ðŸ¬ *Registro*: ${user.isRegistroed ? "Si" : "No"}

${readmore}${s}`
                  },
                  footer: {
                    text: "Elige el boton de abajo para mas informacion"
                  },
                  contextInfo: {
                    isForwarded: true,
                    fprwardingScore: 9,
                    participant: "0@s.whatsapp.net",
                    quotedMessage: {
                      conversation: `Nino-Al`
                    },
                    mentionedJid: [
                      `${m.sender}`
                    ]
                  },
                  nativeFlowMessage: {
                    messageParamsJson: JSON.stringify({
                      limited_time_offer: {
                        text: `${greeting}`,
                        url: "Hai",
                        copy_code: "Creado por " + "Sebas-MD",
                        expiration_time: Date.now() + 1000000,
                      },
                      bottom_sheet: {
                        in_thread_buttons_limit: 2,
                        divider_indices: [1, 2, 3, 4, 5, 999],
                        list_title: "Elige el menu que quieras",
                        button_title: "ðŸ… Ver mas",
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
                          display_text: "ðŸ« Nuestro owner",
                          url: `https://wa.me/${botConfig.owner?.number?.[0]}`,
                          merchant_url: `https://wa.me/${config.owner?.number?.[0]}`,
                        })
                      },
                      {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                          display_text: "ðŸ› Obtener script (gratis)",
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
                  displayText: 'ðŸ§€ Owner',
                },
                type: 1,
              },
              {
                buttonId: `${m.prefix}allmenu`,
                buttonText: {
                  displayText: 'ðŸ’ Menu completo',
                },
                type: 1,
              },
            ],
            locationMessage: {
              jpegThumbnail: await sharp(fs.readFileSync(config.assets["ourin"])).resize(300, 170).toBuffer(),
              name: "Nino-Al",
              address: `Version saat ini: ${config.bot.version}`
            },
            contentText: `ðŸ¥ž *Hola*

Bienvenido/a a Nino-Al, nuestro bot te ayudara

ðŸ… *INFORMACION DEL BOT*
> ðŸ¤– *Nombre*: Nino-Al
> âš™ï¸ *Versionon*: ${config.bot?.version}
> ðŸ‘¨â€ðŸ’» *Desarrollador*: Sebas-MD
> ðŸ§© *Libreria*: \`ourin-baileys\`

ðŸ… *INFORMACION DEL USUARIO*
> ðŸ§‘ *Nombre*: ${m.pushName}
> ðŸ¥ *Rol*: ${m?.isOwner ? "ðŸ”¥ Owner" : m?.isPremium ? "ðŸ‘‘ Premium" : "ðŸ˜Š User"}
> ðŸ§€ *Nivel*: ${user.level || 0}
> ðŸ— *Exp*: ${user.exp || 0}
> ðŸ¥© *Energia*: ${user.energi || 0}
> ðŸŽ *Monedas*: ${user.koin || 0}
> ðŸ¬ *Registro*: ${user.isRegistroed ? "Si" : "No"}`,
            footerText: 'ðŸ” Elige uno de los botones de abajo',
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
              caption: "Nino-Al",
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
              title: `${cat.emoji} ${cat.cat} Menu`,
              sections: [
                {
                  title: "Selecciona el comando",
                  highlight_label: "Nino-Al",
                  rows: cat.cmds.map((cmd, i) => {
                    return {
                      title: (i + 1).toString() + " " + cmd,
                      description: "Seleccionar este comando?",
                      id: `${prefix}${cmd}`
                    }
                  })
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
                  text: `Selecciona el boton de abajo`
                },
                body: {
                  text: `*${greeting} ${m.pushName}*, ð˜”ð˜º ð˜¯ð˜¢ð˜®ð˜¦ ð˜ªð˜´ Nino-Al.

  ðŸ” ð˜ ð˜Šð˜¢ð˜¯ ð˜©ð˜¦ð˜­ð˜± ð˜ºð˜°ð˜¶ ð˜¸ð˜ªð˜µð˜© ð˜´ð˜¦ð˜·ð˜¦ð˜³ð˜¢ð˜­ ð˜µð˜©ð˜ªð˜¯ð˜¨ð˜´ ð˜¸ð˜ªð˜µð˜©ð˜ªð˜¯ ð˜žð˜©ð˜¢ð˜µð˜´ð˜ˆð˜±ð˜±. ð˜ˆð˜¯ð˜¥ ð˜ ð˜¢ð˜® ð˜ˆð˜³ð˜®ð˜¦ð˜¥ ð˜¢ *ð˜‘ð˜¢ð˜·ð˜¢ð˜´ð˜¤ð˜³ð˜ªð˜±ð˜µ* ð˜—ð˜³ð˜°ð˜¨ð˜³ð˜¢ð˜® ð˜ˆð˜´ð˜´ð˜¦ð˜®ð˜£ð˜­ð˜¦ð˜¥ ð˜£ð˜º ð˜®ð˜º ð˜¤ð˜³ð˜¦ð˜¢ð˜µð˜°ð˜³.

\`INFORMACION DEL BOT\`
> ðŸ› *Creador*: Sebas-MD
> ðŸ¥ž *Nombre*: Nino-Al
> ðŸ¥© *Versionon*: ${config.bot?.version}
> ðŸ‚ *Tipo*: \`Plugin x Cases\`
> ðŸ¦´ *Modo*: *${config.mode === 'public' ? 'ðŸ• Disponible para todos' : 'ðŸ¥– Solo para el owner'}*

Disfruta usando el bot.`
                },
                contextInfo: {
                  mentionedJid: [m.sender],
                  isForwarded: true,
                  forwardingScore: 9,
                  forwardedNewsletterMessageInfo: {
                    newsletterJid: saluranId,
                    newsletterName: saluranName,
                    serverMessageId: 127,
                  },
                },
                nativeFlowMessage: {
                  messageParamsJson: JSON.stringify({
                    bottom_sheet: {
                      in_thread_buttons_limit: 2,
                      divider_indices: [1, 2, 3, 4, 5, 999],
                      list_title: "Selecciona el menu",
                      button_title: "ðŸ™ Ver categorias",
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
                        display_text: "ðŸ§€ Visitar a mi creador",
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

          return `${d} Dias ${m} Minutos ${s} Segundos`;
        }

        const weatherCode = {
          0: "â˜€ï¸ Soleado",
          1: "ðŸŒ¤ï¸ Soleado con nubes",
          2: "â›… Nublado",
          3: "â˜ï¸ Cubierto",
          45: "ðŸŒ«ï¸ Con niebla",
          48: "ðŸŒ«ï¸ Niebla densa",
          51: "ðŸŒ¦ï¸ Llovizna",
          61: "ðŸŒ§ï¸ Lluvia ligera",
          63: "ðŸŒ§ï¸ Lluvia",
          65: "â›ˆï¸ Lluvia fuerte",
          80: "ðŸŒ¦ï¸ Lluvia local",
          95: "â›ˆï¸ Tormenta electrica"
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
            const kondisi = weatherCode[current.weather_code] || "ðŸŒ Desconocido"

            return `${kondisi} | ðŸŒ¡ï¸ ${Math.round(current.temperature_2m)}Â°C\nðŸ“ ${loc.name}`
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
                  text: `Selecciona el boton de abajo`
                },
                body: {
                  text: `ðŸŸ Hola *${m.pushName}* 
                  
_soy un sistema automatizado (bot de WhatsApp) que puede ayudarte a buscar y obtener datos o informacion solo a traves de WhatsApp._

*\`ä¹‚ I N F O - B O T\`*
â”Œ â—¦ Nombre : Nino-Al
â”‚ â—¦ Autor : @Sebas-MD
â”‚ â—¦ Tipo de script : Case x Plugins
â”‚ â—¦ Tiempo activo : ${runtime(process.uptime())}
â”” â—¦ Version : ${config.bot.version}

*\`ä¹‚ I N F O - U S E R\`*
â”Œ â—¦ Nombre : ${m.pushName}
â”‚ â—¦ Estado : ${m.isOwner ? "ðŸ‘‘ Owner" : m.isPremium ? "ðŸ’Ž Premium" : "ðŸ·ï¸ Gratis"}
â”‚ â—¦ Modo : ${config.mode === "pblic" ? "Puede usarlo cualquiera" : "Solo owner :b"}
â”‚ â—¦ Numero : @${m.sender.split("@")[0]}
â”” â—¦ ${greeting}
`
                },
                contextInfo: {
                  mentionedJid: [m.sender],
                  isForwarded: true,
                  forwardingScore: 9,
                  forwardedNewsletterMessageInfo: {
                    newsletterJid: saluranId,
                    newsletterName: saluranName,
                    serverMessageId: 127,
                  },
                },
                nativeFlowMessage: {
                  messageParamsJson: JSON.stringify({
                    limited_time_offer: {
                      text: `${greeting}`,
                      url: "Hai",
                      // copy_code: "Creado por " + "Sebas-MD",
                      expiration_time: Date.now() + 10000,
                    },
                    bottom_sheet: {
                      in_thread_buttons_limit: 2,
                      divider_indices: [1, 2, 3, 4, 5, 999],
                      list_title: "Selecciona el menu",
                      button_title: "ðŸ™ Ver categorias",
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
                      name: "",
                      buttonParamsJson: ""
                    },
                    {
                      name: "quick_reply",
                      buttonParamsJson: JSON.stringify({
                        display_text: "ðŸ¥© Menu completo",
                        id: `${prefix}allmenu`
                      })
                    },
                    {
                      name: "quick_reply",
                      buttonParamsJson: JSON.stringify({
                        display_text: "ðŸ¥ž Reglas",
                        id: `${prefix}rules`
                      })
                    },
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
      case 6: {
        function runtime(seconds) {
          seconds = Number(seconds);

          const d = Math.floor(seconds / (3600 * 24));
          const h = Math.floor(seconds % (3600 * 24) / 3600);
          const m = Math.floor(seconds % 3600 / 60);
          const s = Math.floor(seconds % 60);

          return `${d} Dias ${m} Minutos ${s} Segundos`;
        }

        const weatherCode = {
          0: "â˜€ï¸ Soleado",
          1: "ðŸŒ¤ï¸ Soleado con nubes",
          2: "â›… Nublado",
          3: "â˜ï¸ Cubierto",
          45: "ðŸŒ«ï¸ Con niebla",
          48: "ðŸŒ«ï¸ Niebla densa",
          51: "ðŸŒ¦ï¸ Llovizna",
          61: "ðŸŒ§ï¸ Lluvia ligera",
          63: "ðŸŒ§ï¸ Lluvia",
          65: "â›ˆï¸ Lluvia fuerte",
          80: "ðŸŒ¦ï¸ Lluvia local",
          95: "â›ˆï¸ Tormenta electrica"
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
            const kondisi = weatherCode[current.weather_code] || "ðŸŒ Desconocido"

            return `${kondisi} | ðŸŒ¡ï¸ ${Math.round(current.temperature_2m)}Â°C\nðŸ“ ${loc.name}`
          } catch {
            return "Clima no disponible"
          }
        }
        const rawStats = fs.readFileSync(path.join(process.cwd(), 'database/main/stats.json'), 'utf8')
        const statsData = JSON.parse(rawStats)
        const commandStats = Object.entries(statsData)
          .filter(([key]) => key.startsWith('command_'))
          .map(([key, count]) => ({ name: key.replace('command_', ''), count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)

        let topCmdText = "\n*\`ä¹‚ T O P - C O M A N D O S\`*\n"
        if (commandStats.length > 0) {
          commandStats.forEach((cmd, i) => {
            topCmdText += `${i === commandStats.length - 1 ? 'â””' : 'â”œ'} â—¦ ${m.prefix}${cmd.name} (${cmd.count}x)\n`
          })
        } else {
          topCmdText += "â”” â—¦ No ada command\n"
        }

        const thumbnail = await sharp(fs.readFileSync(config.assets["ourin"])).resize(300, 300).toBuffer()
        const msg6 = generateWAMessageFromContent(m.chat, {
          viewOnceMessage: {
            message: {
              messageContextInfo: {},
              interactiveMessage: {
                header: {
                  hasMediaAttachment: true,
                  locationMessage: {
                    degreesLatitude: 0,
                    degreesLongitude: 0,
                    name: "Nino-Al",
                    address: await weatherMenu(),
                    jpegThumbnail: thumbnail
                  }
                },
                body: {
                  text: `ðŸŸ Hola *${m.pushName}* \n\n_soy un sistema automatizado (bot de WhatsApp) que puede ayudarte a buscar y obtener datos o informacion solo a traves de WhatsApp._\n\n*\`ä¹‚ I N F O - B O T\`*\nâ”Œ â—¦ Nombre : Nino-Al\nâ”‚ â—¦ Autor : @Sebas-MD\nâ”‚ â—¦ Tipo de script : Case x Plugins\nâ”‚ â—¦ Tiempo activo : ${runtime(process.uptime())}\nâ”” â—¦ Version : ${config.bot.version}\n\n*\`ä¹‚ I N F O - U S E R\`*\nâ”Œ â—¦ Nombre : ${m.pushName}\nâ”‚ â—¦ Estado : ${m.isOwner ? "ðŸ‘‘ Owner" : m.isPremium ? "ðŸ’Ž Premium" : "ðŸ·ï¸ Gratis"}\nâ”‚ â—¦ Modo : ${config.mode === "pblic" ? "Puede usarlo cualquiera" : "Solo owner :b"}\nâ”‚ â—¦ Numero : @${m.sender.split("@")[0]}\nâ”” â—¦ ${greeting}\n${topCmdText}`
                },
                contextInfo: {
                  mentionedJid: [m.sender],
                  isForwarded: true,
                  forwardingScore: 9,
                },
                nativeFlowMessage: {
                  messageParamsJson: JSON.stringify({
                    limited_time_offer: {
                      text: `${greeting}`,
                      url: "Hai",
                      expiration_time: Date.now() + 10000,
                    },
                    bottom_sheet: {
                      in_thread_buttons_limit: 2,
                      divider_indices: [1, 2, 3, 4, 5, 999],
                      list_title: "Selecciona el menu",
                      button_title: "ðŸ™ Ver categorias",
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
                      name: "",
                      buttonParamsJson: ""
                    },
                    {
                      name: "quick_reply",
                      buttonParamsJson: JSON.stringify({
                        display_text: "ðŸ¥© Menu completo",
                        id: `${prefix}allmenu`
                      })
                    },
                    {
                      name: "quick_reply",
                      buttonParamsJson: JSON.stringify({
                        display_text: "ðŸ¥ž Reglas",
                        id: `${prefix}rules`
                      })
                    },
                  ]
                }
              }
            }
          }
        }, { quoted: m, userJid: sock.user.jid });

        await sock.relayMessage(m.chat, msg6.message, {
          messageId: msg6.key.id,
        });
        break;
      }
      default:
        await m.reply(text);
    }
    const audioEnabled = db.setting("audioMenu") !== false;
    if (audioEnabled) {
      const audioUrl = botConfig.assets["ourin-mp3"];
      try {
        switch (menuVariant) {
          case 1:
            try {
              const oggPath = await (async () => {
                const tempDir = path.join(process.cwd(), "temp");
                if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
                const destPath = path.join(tempDir, "menu_audio_opus.ogg");
                if (fs.existsSync(destPath)) return destPath;
                const mp3Path = path.join(tempDir, "menu_audio.mp3");
                const res = await axios.get(audioUrl, { responseType: "arraybuffer" });
                fs.writeFileSync(mp3Path, Buffer.from(res.data));
                const { spawn } = await import("child_process");
                return new Promise((resolve, reject) => {
                  const ffmpeg = spawn("ffmpeg", ["-y", "-i", mp3Path, "-c:a", "libopus", "-b:a", "48k", "-vbr", "on", destPath]);
                  ffmpeg.on("close", (code) => {
                    if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
                    if (code === 0) resolve(destPath);
                    else reject(new Error("FFmpeg error"));
                  });
                  ffmpeg.on("error", (err) => {
                    if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
                    reject(err);
                  });
                });
              })();
              await sock.sendMessage(m.chat, {
                audio: { url: oggPath },
                mimetype: "audio/ogg; codecs=opus",
                ptt: true,
              }, { quoted: m });
            } catch (err) {
              await sock.sendMessage(m.chat, {
                audio: { url: audioUrl },
                mimetype: "audio/mpeg",
                ptt: false,
              }, { quoted: m });
            }
            break;
          case 2: {
            const qpoll = {
              key: { participant: "0@s.whatsapp.net" },
              message: {
                pollCreationMessage: {
                  name: "Nino-Al"
                }
              }
            };
            try {
              const oggPath = await (async () => {
                const tempDir = path.join(process.cwd(), "temp");
                if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
                const destPath = path.join(tempDir, "menu_audio_opus.ogg");
                if (fs.existsSync(destPath)) return destPath;
                const mp3Path = path.join(tempDir, "menu_audio.mp3");
                const res = await axios.get(audioUrl, { responseType: "arraybuffer" });
                fs.writeFileSync(mp3Path, Buffer.from(res.data));
                const { spawn } = await import("child_process");
                return new Promise((resolve, reject) => {
                  const ffmpeg = spawn("ffmpeg", ["-y", "-i", mp3Path, "-c:a", "libopus", "-b:a", "48k", "-vbr", "on", destPath]);
                  ffmpeg.on("close", (code) => {
                    if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
                    if (code === 0) resolve(destPath);
                    else reject(new Error("FFmpeg error"));
                  });
                  ffmpeg.on("error", (err) => {
                    if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
                    reject(err);
                  });
                });
              })();
              await sock.sendMessage(m.chat, {
                audio: { url: oggPath },
                mimetype: "audio/ogg; codecs=opus",
                ptt: true,
              }, { quoted: qpoll });
            } catch (err) {
              await sock.sendMessage(m.chat, {
                audio: fs.readFileSync(config.assets["ourin-mp3"]),
                mimetype: "audio/mpeg",
                ptt: false,
              }, { quoted: qpoll });
            }
            break;
          }
          case 3: {
            const qtext = {
              key: {
                fromMe: false,
                participant: m.sender,
              },
              message: {
                conversation: "setelin musiknya nya bang"
              }
            };
            await sock.sendMessage(m.chat, {
              audio: fs.readFileSync(config.assets["ourin-mp3"]),
              mimetype: "audio/mpeg",
              ptt: false,
            }, { quoted: qtext });
            break;
          }
          case 4:
          default: {
            const ftroliQuoted = {
              key: {
                fromMe: false,
                participant: "0@s.whatsapp.net",
                remoteJid: "status@broadcast",
              },
              message: {
                orderMessage: {
                  orderId: "44444444444444",
                  thumbnail:
                    (thumbBuffer || imageBuffer ? await (await getSharp())(thumbBuffer || imageBuffer)
                      .resize({ width: 300, height: 300 })
                      .toBuffer() : null),
                  itemCount: totalCmds,
                  status: "INQUIRY",
                  surface: "CATALOG",
                  message: `â˜… Nino-Al`,
                  orderTitle: `ðŸ“‹ ${totalCmds} Comandos`,
                  sellerJid: botConfig.botNumber
                    ? `${botConfig.botNumber}@s.whatsapp.net`
                    : m.sender,
                  token: "ourin-menu-v8",
                  totalAmount1000: 3333333,
                  totalCurrencyCode: "IDR",
                  contextInfo: {
                    isForwarded: true,
                    forwardingScore: 9,
                    forwardedNewsletterMessageInfo: {
                      newsletterJid: saluranId,
                      newsletterName: saluranName,
                      serverMessageId: 127,
                    },
                  },
                },
              },
            };
            try {
              await sock.sendMessage(
                m.chat,
                {
                  audio: fs.readFileSync(config.assets["ourin-mp3"]),
                  mimetype: "audio/mpeg",
                },
                { quoted: ftroliQuoted },
              );
            } catch (ffmpegErr) {
              await sock.sendMessage(
                m.chat,
                {
                  audio: fs.readFileSync(config.assets["ourin-mp3"]),
                  mimetype: "audio/mpeg",
                  contextInfo: getContextInfo(botConfig, m, thumbBuffer),
                },
                { quoted: getVerifiedQuoted(botConfig) },
              );
            }
            break;
          }
        }
      } catch (e) {
        console.error("[Menu] Error al enviar audio dinamico:", e.message);
      }
    }
  } catch (error) {
    console.error("[Menu] Error al ejecutar el comando:", error.message);
  }
}
export default {
  config: pluginConfig,
  handler,
};



