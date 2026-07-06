import { getCaseCount, getCasesByCategory } from "../../case/ourin.js";
import config from "../../config.js";
import { formatUptime, getTimeGreeting } from "../../src/lib/ourin-formatter.js";
import {
  getCommandsByCategory,
  getCategories,
} from "../../src/lib/ourin-plugins.js";

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

const CATEGORY_LABELS = {
  owner: "OWNER",
  main: "PRINCIPAL",
  utility: "UTILIDAD",
  tools: "HERRAMIENTAS",
  fun: "DIVERSION",
  game: "JUEGOS",
  download: "DESCARGAS",
  downloader: "DESCARGAS",
  search: "BUSQUEDA",
  sticker: "STICKERS",
  media: "MEDIA",
  ai: "IA",
  group: "GRUPO",
  religi: "RELIGION",
  islamic: "ISLAMICO",
  info: "INFO",
  cek: "CHECK",
  economy: "ECONOMIA",
  user: "USUARIO",
  canvas: "CANVAS",
  random: "RANDOM",
  premium: "PREMIUM",
  ephoto: "EPHOTO",
  jpm: "JPM",
  pushkontak: "PUSHKONTAK",
  panel: "PANEL",
  store: "TIENDA",
};

const CATEGORY_ORDER = [
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
  "store",
];

function sortCategories(categories) {
  return [...categories].sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a);
    const indexB = CATEGORY_ORDER.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });
}

function getModeFilters(botMode) {
  const modeAllowedMap = {
    md: null,
    cpanel: ["main", "group", "sticker", "owner", "tools", "panel"],
    store: ["main", "group", "sticker", "owner", "store"],
    pushkontak: ["main", "group", "sticker", "owner", "pushkontak"],
  };

  const modeExcludeMap = {
    md: ["panel", "pushkontak", "store"],
    cpanel: null,
    store: null,
    pushkontak: null,
  };

  return {
    allowedCategories: modeAllowedMap[botMode],
    excludeCategories: modeExcludeMap[botMode] || [],
  };
}

function getVisibleCategories(m, botMode) {
  const categories = sortCategories(getCategories());
  const commandsByCategory = getCommandsByCategory();
  const casesByCategory = getCasesByCategory();
  const { allowedCategories, excludeCategories } = getModeFilters(botMode);

  const visible = [];
  let totalCommands = 0;

  for (const category of categories) {
    const key = category.toLowerCase();
    if (key === "owner" && !m.isOwner) continue;
    if (allowedCategories && !allowedCategories.includes(key)) continue;
    if (excludeCategories.includes(key)) continue;

    const pluginCommands = commandsByCategory[category] || [];
    const caseCommands = casesByCategory[category] || [];
    const commands = [...pluginCommands, ...caseCommands];
    if (commands.length === 0) continue;

    totalCommands += commands.length;
    visible.push({ category, commands });
  }

  return { visible, totalCommands };
}

async function buildMenuText(m, botConfig, db, uptime, botMode = "md") {
  const prefix = botConfig.command?.prefix || ".";
  const user = db.getUser(m.sender) || {};
  const totalUsers = db.getUserCount?.() || 0;
  const totalCases = getCaseCount();
  const { visible, totalCommands } = getVisibleCategories(m, botMode);
  const totalFeatures = totalCommands + totalCases;
  const uptimeFormatted = formatUptime(uptime);
  const greeting = getTimeGreeting();

  const role = m.isOwner ? "Owner" : m.isPremium ? "Premium" : "Usuario";
  const energy = m.isOwner || m.isPremium ? "Ilimitado" : user?.energi ?? 25;
  const level = Math.floor((user?.exp || 0) / 20000) + 1;

  let text = `Hola *@${m.pushName || "Usuario"}*\n`;
  text += `Soy *Nino-Al*, un bot de WhatsApp listo para ayudarte.\n\n`;
  text += `*INFORMACION DEL BOT*\n`;
  text += `Nombre: Nino-Al\n`;
  text += `Version: v${botConfig.bot?.version || "1.2.0"}\n`;
  text += `Modo: ${(botConfig.mode || "public").toUpperCase()}\n`;
  text += `Prefijo: ${prefix}\n`;
  text += `Activo: ${uptimeFormatted}\n`;
  text += `Usuarios: ${totalUsers}\n`;
  text += `Grupo: ${botMode.toUpperCase()}\n`;
  text += `Owner: Sebas-MD\n\n`;

  text += `*INFORMACION DEL USUARIO*\n`;
  text += `Nombre: ${m.pushName || "Usuario"}\n`;
  text += `Rol: ${role}\n`;
  text += `Energia: ${energy}\n`;
  text += `Nivel: ${level}\n`;
  text += `Exp: ${(user?.exp ?? 0).toLocaleString()}\n`;
  text += `Monedas: ${(user?.koin ?? 0).toLocaleString()}\n`;
  text += `Saludo: ${greeting}\n\n`;

  text += `*CATEGORIAS*\n`;
  if (visible.length === 0) {
    text += `No hay categorias disponibles.\n`;
  } else {
    for (const { category, commands } of visible) {
      const label = CATEGORY_LABELS[category] || category.toUpperCase();
      text += `- ${prefix}menucat ${category} (${label}) - ${commands.length} comandos\n`;
    }
  }

  text += `\nTotal de comandos: ${totalCommands}\n`;
  text += `Total de funciones: ${totalFeatures}\n`;
  return text;
}

async function handler(m, { sock, config: botConfig = config, db, uptime }) {
  try {
    const groupData = m.isGroup ? db.getGroup(m.chat) || {} : {};
    const botMode = groupData.botMode || "md";
    const text = await buildMenuText(m, botConfig, db, uptime, botMode);

    await sock.sendMessage(
      m.chat,
      {
        text,
        mentions: [m.sender],
      },
      { quoted: m },
    );
  } catch (error) {
    console.error("[Menu] Error al ejecutar el comando:", error.message);
    await m.reply("Ocurrio un error al generar el menu.");
  }
}

export default {
  config: pluginConfig,
  handler,
};
