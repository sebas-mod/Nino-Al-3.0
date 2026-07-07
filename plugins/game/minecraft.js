import { getDatabase } from "../../src/lib/ourin-database.js";
import {
  getOrCreateMCUser,
  getRandomOre,
  formatMoney,
  addPickExp,
  addPlayerExp,
  getUpgradedStats,
  doGachaPull,
  getStreakBonus,
  doCombat,
  doSmelt,
  doCraft,
  doJackpotPull,
  applyJackpotReward,
  getAvailableMobs,
  healPlayer,
  JACKPOT_POOLS,
} from "../../src/lib/ourin-minecraft.js";
import {
  biomes,
  travelRequirements,
  pickaxes,
  pickEnchants,
  mobData,
  RARITY_EMOJI,
  UPGRADES,
  DAILY_REWARDS,
  TOKEN_SHOP,
  GACHA_COST_COINS,
  GACHA_PITY_LIMIT,
  SMELT_RECIPES,
  CRAFT_RECIPES,
} from "../../src/lib/ourin-minecraft-data.js";
import config from "../../config.js";
import path from "path";
import fs from "fs";

const MC = 15;
const rc = (r) => RARITY_EMOJI[r] || "⬜";
const encCost = (r) =>
  ({
    common: 60000,
    rare: 600000,
    epic: 6e6,
    legendary: 6e7,
    mythic: 6e8,
    godly: 6e9,
    secret: 6e10,
  })[r] || 60000;

let thumbMC = null;
try {
  const p = path.join(process.cwd(), "assets", "images", "ourin-minecraft.jpg");
  if (fs.existsSync(p)) thumbMC = fs.readFileSync(p);
} catch (e) {}

function ctx() {
  const sId = config.saluran?.id || "120363400911374213@newsletter";
  const sName = config.saluran?.name || config.bot?.name || "Ourin-AI";
  return {
    forwardingScore: 9999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: sId,
      newsletterName: sName,
      serverMessageId: 127,
    },
  };
}

function send(sock, m, text, title, body) {
  const msgId = sock.sendPreview(
    m.chat,
    {
      caption: `${config.info.website} ${text}`,
      url: `${config.info.website}`,
      title: `𝗝𝗨𝗘𝗚𝗢 𝗗𝗘 𝗠𝗜𝗡𝗘𝗖𝗥𝗔𝗙𝗧`,
      description: `⛏️ mina, 🛠️ craftea y ⚔️ lucha contra mobs en el mundo de minecraft`,
      jpegThumbnail: thumbMC,
      previewType: 0,
    },
    { quoted: m },
  );
  return { key: { id: msgId, remoteJid: m.chat, fromMe: true } };
}

const pluginConfig = {
  name: "mct",
  alias: ["minecraft"],
  category: "game",
  description: "Minecraft - Juego de Minería y Crafteo",
  usage: ".mct <comando>",
  example: ".mct help",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = getDatabase();
  const cmd = m.command || m.body?.split(" ")[0]?.slice(1)?.toLowerCase() || "";
  const args = m.args || m.body?.split(" ").slice(1) || [];
  const sub = args[0]?.toLowerCase() || "";
  const sa = args.slice(1);

  if (cmd === "minecraft") {
    if (!sub || sub === "on" || sub === "off") {
      if (!m.isGroup) return m.reply("_El interruptor solo funciona en grupos_");
      if (!m.isOwner && !m.isAdmin) return m.reply("_Solo administradores/dueños_");
      const gd = db.getGroup(m.chat) || {};
      if (sub === "on") {
        gd.minecraftEnabled = true;
        db.setGroup(m.chat, gd);
        return send(
          sock,
          m,
          `*🧱 MINECRAFT ACTIVADO*\n\n🎮 ¡Todos los miembros deben jugar Minecraft!\n🪧 Escribe \`.mct help\` para empezar`,
          "🧱 Minecraft ON",
          "✅ Activo",
        );
      }
      if (sub === "off") {
        gd.minecraftEnabled = false;
        db.setGroup(m.chat, gd);
        return send(
          sock,
          m,
          `*🧱 MINECRAFT DESACTIVADO*`,
          "🧱 Minecraft OFF",
          "❌ Inactivo",
        );
      }
      return m.reply(
        `*🧱 Minecraft:* ${gd.minecraftEnabled ? "✅ ACTIVADO" : "❌ DESACTIVADO"}\n\`.minecraft on/off\``,
      );
    }
  }

  if (cmd !== "mct" && cmd !== "minecraft") return;

  if (!sub || sub === "help" || sub === "menu") {
    return send(
      sock,
      m,
      `*🧱 JUEGO DE MINECRAFT*\n_⛏️ El sistema de minería y 🛠️ crafteo más completo_\n\n` +
        `*⛏️ MINERÍA*\n\`.mct mine\` _⛏️ Empezar a minar_\n\`.mct collect\` _📦 Recoger resultados_\n\`.mct sell\` _💸 Vender minerales_\n\`.mct orebook\` _📚 Colección de menas_\n\`.mct top\` _🏆 Tabla de clasificación_\n\n` +
        `*⚔️ COMBATE*\n\`.mct fight\` _👹 Lista de mobs_\n\`.mct fight <mob>\` _⚔️ Luchar contra un mob_\n\`.mct heal\` _❤️ Restaurar HP_\n\`.mct stats\` _📊 Estadísticas detalladas_\n\n` +
        `*👤 PERFIL*\n\`.mct me\` _🪪 Tu perfil_\n\`.mct daily\` _🎁 Recompensa diaria_\n\n` +
        `*🗺️ BIOMAS Y PICOS*\n\`.mct travel\` _🗺️ Lista de biomas_\n\`.mct travel <bioma>\` _🚪 Viajar de bioma_\n\`.mct shop\` _🛒 Tienda de picos_\n\`.mct buy <pico>\` _💰 Comprar pico_\n\`.mct equip <pico>\` _🪓 Equipar pico_\n\`.mct picks\` _🎒 Tu colección de picos_\n\`.mct enchant <clave>\` _✨ Encantar pico_\n\`.mct enchants\` _📜 Lista de encantamientos_\n\`.mct pickup\` _⬆️ Mejorar nivel del pico_\n\n` +
        `*🔥 FUNDICIÓN Y CRAFTEO*\n\`.mct smelt\` _🔥 Fundir todos los minerales_\n\`.mct craft\` _🛠️ Lista de recetas_\n\`.mct craft <id>\` _🧪 Craftear objeto_\n\`.mct inv\` _🎒 Inventario_\n\n` +
        `*👑 PRESTIGIO*\n\`.mct prestige\` _👑 Información de prestigio_\n\`.mct tokens\` _🪙 Tienda de tokens_\n\`.mct upgrade\` _📈 Mejorar estadísticas_\n\`.mct gacha\` _🎰 Gacha_\n\`.mct gacha ticket\` _🎟️ Gacha usando ticket_\n\n` +
        `*🎰 JACKPOT*\n\`.mct jackpot\` _🎰 Lista de jackpots_\n\`.mct jackpot <rango>\` _💎 Jugar al jackpot_\n_🎁 ¡El jackpot puede otorgar _Premium_, _Partner_, _Energía_, _Límite_ o incluso _ILIMITADO_!_`,
      "🧱 Minecraft Game",
      "⛏️ Minería & 🛠️ Crafteo",
    );
  }

  if (sub === "mine") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    if (mc.miningPending && mc.miningPending.length > 0)
      return m.reply(`_📦 ¡Aún tienes minerales pendientes por recoger!_ Usa \`.mct collect\` _primero._`);
    const now = Date.now();
    if (mc.lastMineTime && now - mc.lastMineTime < MC * 1000)
      return m.reply(
        `_⏳ Espera *${Math.ceil((MC * 1000 - (now - mc.lastMineTime)) / 1000)}* segundos_`,
      );
    const pk = mc.usedPickaxe || "woodpick";
    const pick = mc.pickaxes[pk];
    if (!pick) return m.reply(`_🪓 ¡No tienes un pico activo!_ Usa \`.mct picks\``);
    const bk = mc.currentBiome || "plains";
    const st = getUpgradedStats(mc, pick);
    const ePick = {
      ...pick,
      luck: st.luck,
      speed: st.speed,
      fortuneBonus: st.fortune,
      sellMultiplier: st.sellMultiplier,
    };
    const ores = [];
    let tv = 0;
    for (let i = 0; i < (pick.comboOre || 1); i++) {
      const ore = getRandomOre(ePick, bk);
      if (ore) {
        ore.price = Math.round(ore.price * getStreakBonus(mc.streak || 0).mult);
        ores.push(ore);
        tv += ore.price;
      }
    }
    mc.miningPending = ores;
    mc.lastMineTime = now;
    mc.streak = (mc.streak || 0) + 1;
    await send(
      sock,
      m,
      `*_⛏️ Minando en ${biomes[bk]?.name || bk}..._*\n_🪓 Pico: ${pick.name} | 🍀 Suerte: ${(st.luck * 100).toFixed(1)}%_`,
      "⛏️ Minando...",
      biomes[bk]?.name || "",
    );
    await new Promise((r) =>
      setTimeout(
        r,
        Math.min(Math.max(2000, 5000 - (pick.speed || 0) * 3000), 4000),
      ),
    );
    let txt = `*⛏️ ¡RESULTADOS DE LA MINERÍA!*\n\n`;
    for (const o of ores) {
      txt += `${rc(o.rarity)} *${o.name}*\n   _💰 ${formatMoney(o.price)} | 📦 x${o.stack}_\n`;
    }
    txt += `\n*💰 Total: ${formatMoney(tv)}*`;
    if (mc.streak >= 3) txt += `\n_🔥 Racha: ${mc.streak}x_`;
    txt += `\n\n¡Usa \`.mct collect\` para 📦 recoger tus ganancias!`;
    db.markDirty("users");
    return send(sock, m, txt, "⛏️ ¡Botín Minado!", `💰 ${formatMoney(tv)}`);
  }

  if (sub === "collect") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    if (!mc.miningPending || mc.miningPending.length === 0)
      return m.reply(`_📭 No tienes nada que recoger._ ¡Usa \`.mct mine\` _primero!_`);
    const ores = mc.miningPending;
    let tv = 0,
      te = 0,
      nf = [];
    for (const ore of ores) {
      tv += ore.price;
      te += Math.max(10, Math.floor(ore.price / 50));
      const cn = ore.name.replace(/[\u{1F300}-\u{1F9FF}]/gu, "").trim();
      if (!mc.oreFound.includes(cn)) {
        mc.oreFound.push(cn);
        nf.push(cn);
      }
    }
    mc.money = (mc.money || 0) + tv;
    mc.blocksMined =
      (mc.blocksMined || 0) + ores.reduce((a, o) => a + (o.stack || 1), 0);
    mc.totalEarned = (mc.totalEarned || 0) + tv;
    mc.inventory = [...(mc.inventory || []), ...ores];
    const rlu = addPickExp(mc, mc.usedPickaxe || "woodpick", te);
    const plu = addPlayerExp(mc, te);
    mc.miningPending = [];
    let txt = `*📦 ¡RECOMPENSAS RECOGIDAS!*\n\n💰 +${formatMoney(tv)}\n⭐ +${te} EXP\n🧱 +${ores.length} minerales\n`;
    if (nf.length > 0) txt += `\n*🆕 Minerales Nuevos:* ${nf.join(", ")}`;
    if (rlu) txt += `\n\n${rlu}`;
    if (plu) txt += `\n*⬆️ ¡SUBISTE DE NIVEL! Nivel ${mc.level}*`;
    db.markDirty("users");
    return send(sock, m, txt, "📦 ¡Recogido!", `💰 +${formatMoney(tv)}`);
  }

  if (sub === "sell") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    if (!mc.inventory || mc.inventory.length === 0)
      return m.reply(`_🎒 ¡Tu inventario está vacío!_ Ve a minar usando \`.mct mine\` _primero._`);
    let tv = 0;
    for (const item of mc.inventory) tv += item.price || 0;
    const sb = UPGRADES.fortune.effect(mc.fortuneUpgrade || 0);
    const pick = mc.pickaxes[mc.usedPickaxe || "woodpick"];
    const rsm = pick ? pick.sellMultiplier || 0 : 0;
    const fv = Math.round(tv * (1 + sb + rsm));
    const fc2 = mc.inventory.length;
    mc.money = (mc.money || 0) + fv;
    mc.totalEarned = (mc.totalEarned || 0) + fv;
    mc.inventory = [];
    db.markDirty("users");
    return send(
      sock,
      m,
      `*💸 ¡MINERALES VENDIDOS!*\n\n📦 Cantidad: ${fc2}\n💰 Total recibido: ${formatMoney(fv)}\n🏦 Saldo actual: ${formatMoney(mc.money)}`,
      "💸 ¡Vendido!",
      `💰 ${formatMoney(fv)}`,
    );
  }

  if (sub === "me") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    const pick = mc.pickaxes[mc.usedPickaxe || "woodpick"];
    return send(
      sock,
      m,
      `*👤 PERFIL DE MINERO*\n\n*⬆️ Nivel:* ${mc.level} _(${mc.exp}/${mc.expToNextLevel} EXP)_\n*💰 Dinero:* ${formatMoney(mc.money)}\n*❤️ HP:* ${mc.hp}/${mc.maxHp}\n*⚔️ ATK:* ${mc.atk}\n*🧱 Bloques:* ${mc.blocksMined}\n*🪓 Pico:* ${pick ? pick.name : "🪵 Pico de Madera"} _(Niv.${pick ? pick.level : 1})_\n*🗺️ Bioma:* ${biomes[mc.currentBiome] ? biomes[mc.currentBiome].name : mc.currentBiome}\n*🔥 Racha:* ${mc.streak || 0}\n*⚔️ Combates:* ${mc.combatWins || 0}V/${mc.combatLosses || 0}D\n*👑 Prestigio:* ${mc.prestige || 0}\n*🪙 Tokens:* ${mc.prestigeTokens || 0}\n*🎟️ Tickets:* ${mc.gachaTickets || 0}\n*📚 Libro:* ${mc.oreFound ? mc.oreFound.length : 0}\n*📈 Mejoras:*\n  _🍀 Suerte: Niv.${mc.luckUpgrade || 0}_\n  _⚡ Velocidad: Niv.${mc.speedUpgrade || 0}_\n  _💎 Fortuna: Niv.${mc.fortuneUpgrade || 0}_\n  _⚔️ Combate: Niv.${mc.combatUpgrade || 0}_`,
      "👤 Perfil",
      `⬆️ Nivel ${mc.level}`,
    );
  }

  if (sub === "stats") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    const pick = mc.pickaxes[mc.usedPickaxe || "woodpick"];
    const st = getUpgradedStats(mc, pick);
    let txt = `*📊 ESTADÍSTICAS DETALLADAS*\n\n*🪓 Pico: ${pick ? pick.name : "Ninguno"}*\n  _⬆️ Niv.${pick ? pick.level : 1}/${pick ? pick.maxLevel : 5} | ⭐ EXP ${pick ? pick.exp : 0}/${pick ? pick.expToNextLevel : 100}_\n  _🍀 Suerte: ${(st.luck * 100).toFixed(1)}% | ⚡ Velocidad: ${(st.speed * 100).toFixed(1)}%_\n  _💎 Fortuna: +${(st.fortune * 100).toFixed(1)}% | 💰 Venta: +${(st.sellMultiplier * 100).toFixed(1)}%_\n`;
    if (pick && pick.enchant) {
      const e = pickEnchants[pick.enchant];
      txt += `  _✨ Encanto: ${e ? e.name : pick.enchant} (${e ? e.rarity : "?"})_\n`;
    }
    txt += `\n*⚔️ Combate*\n  _⚔️ ATK: ${mc.atk} | ❤️ HP: ${mc.hp}/${mc.maxHp}_\n  _🔥 Bono Combate: +${(UPGRADES.combat.effect(mc.combatUpgrade || 0) * 100).toFixed(1)}%_\n  _🏆 Victorias: ${mc.combatWins || 0} | 💀 Derrotas: ${mc.combatLosses || 0}_\n`;
    txt += `\n*📈 Mejoras*\n  _🍀 Suerte: Niv.${mc.luckUpgrade || 0} (+${(UPGRADES.luck.effect(mc.luckUpgrade || 0) * 100).toFixed(1)}%)_\n  _⚡ Velocidad: Niv.${mc.speedUpgrade || 0} (+${(UPGRADES.speed.effect(mc.speedUpgrade || 0) * 100).toFixed(1)}%)_\n  _💎 Fortuna: Niv.${mc.fortuneUpgrade || 0} (+${(UPGRADES.fortune.effect(mc.fortuneUpgrade || 0) * 100).toFixed(1)}%)_\n  _⚔️ Combate: Niv.${mc.combatUpgrade || 0} (+${(UPGRADES.combat.effect(mc.combatUpgrade || 0) * 100).toFixed(1)}%)_`;
    return send(sock, m, txt, "📊 Estadísticas", pick ? pick.name : "");
  }

  if (sub === "orebook") {
    const user = getOrCreateMCUser(db, m.sender);
    const found = user.minecraft.oreFound || [];
    if (found.length === 0)
      return m.reply(`_📚 ¡Tu libro de minerales está vacío!_ Usa \`.mct mine\` _primero._`);
    let txt = `*📚 LIBRO DE MINERALES* _(${found.length} descubiertos)_\n\n`;
    for (const [k, b] of Object.entries(biomes)) {
      const fl = b.listOre.filter((o) =>
        found.includes(o.name.replace(/[\u{1F300}-\u{1F9FF}]/gu, "").trim()),
      );
      if (fl.length > 0) {
        txt += `*${b.name}*\n`;
        for (const o of fl) txt += `  ${rc(o.rarity)} ${o.name}\n`;
        txt += `\n`;
      }
    }
    return send(sock, m, txt.trim(), "📚 Libro Mineral", `🧱 ${found.length} menas`);
  }

  if (sub === "travel") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    if (!sa[0]) {
      let txt = `*🗺️ LISTA DE BIOMAS*\n\n`;
      for (const [k, b] of Object.entries(biomes)) {
        const req = travelRequirements[k];
        const ok = (mc.travelFound || []).includes(k);
        txt += `${ok ? "✅" : "🔒"} *${b.name}*${mc.currentBiome === k ? " _< Actual_" : ""}\n`;
        txt += req
          ? `   _💰 ${formatMoney(req.money)} | 🧱 ${req.blocks} bloques_\n`
          : `   _🆓 Gratis_\n`;
      }
      return send(
        sock,
        m,
        txt + `\n\`.mct travel <bioma>\``,
        "🗺️ Lista de Biomas",
        biomes[mc.currentBiome || "plains"]?.name || "",
      );
    }
    const tk = sa[0].toLowerCase();
    if (!biomes[tk]) return m.reply(`_🗺️ ¡Ese bioma no existe!_ Consulta \`.mct travel\``);
    if (mc.currentBiome === tk)
      return m.reply(`_📍 ¡Ya te encuentras en el bioma: ${biomes[tk].name}!_`);
    const req = travelRequirements[tk];
    if (req) {
      if ((mc.money || 0) < req.money)
        return m.reply(`_💸 ¡Dinero insuficiente! Necesitas ${formatMoney(req.money)}_`);
      if ((mc.blocksMined || 0) < req.blocks)
        return m.reply(`_🧱 ¡Bloques insuficientes! Necesitas haber minado ${req.blocks}_`);
      mc.money -= req.money;
    }
    if (!(mc.travelFound || []).includes(tk))
      mc.travelFound = [...(mc.travelFound || []), tk];
    mc.currentBiome = tk;
    db.markDirty("users");
    return send(
      sock,
      m,
      `*🚪 ¡VIAJE DE BIOMA!*\n\n📍 Ahora estás en: *${biomes[tk].name}*\n🧱 ${biomes[tk].listOre.length} nuevos tipos de minerales disponibles`,
      "🚪 Viajar!",
      biomes[tk].name,
    );
  }

  if (sub === "shop") {
    let txt = `*🛒 TIENDA DE PICOS*\n\n`;
    for (const [k, pick] of Object.entries(pickaxes)) {
      if (pick.price > 0)
        txt += `*${pick.name}*\n   _💰 ${formatMoney(pick.price)}_\n   _🍀 Suerte +${(pick.luck * 100).toFixed(0)}% | ⚡ Velocidad +${(pick.speed * 100).toFixed(0)}% | 📦 Combo: ${pick.comboOre}_\n   _${pick.description}_\n\n`;
    }
    return send(
      sock,
      m,
      txt + `\`.mct buy <pico>\``,
      "🛒 Tienda de Picos",
      "🪓 Elige tu herramienta",
    );
  }

  if (sub === "buy") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    const pk = sa[0] ? sa[0].toLowerCase() : "";
    if (!pk) return m.reply(`_🪓 ¡Especifica un pico!_ Escribe \`.mct shop\``);
    if (!pickaxes[pk]) return m.reply(`_🪓 ¡Ese pico no existe!_ Escribe \`.mct shop\``);
    if (mc.pickaxes[pk])
      return m.reply(`_✅ ¡Ya posees el pico: ${pickaxes[pk].name}!_`);
    if (pickaxes[pk].price === 0)
      return m.reply(`_🪙 ¡Este pico es especial y se obtiene con Tokens/Prestigio!_`);
    if ((mc.money || 0) < pickaxes[pk].price)
      return m.reply(
        `_💸 ¡Dinero insuficiente! Necesitas ${formatMoney(pickaxes[pk].price)}_`,
      );
    mc.money -= pickaxes[pk].price;
    mc.pickaxes[pk] = { ...pickaxes[pk] };
    db.markDirty("users");
    return send(
      sock,
      m,
      `*🛍️ ¡PICO COMPRADO!*\n\n*${pickaxes[pk].name}*\n_🪓 Escribe_ \`.mct equip ${pk}\` _untuk equiparlo_`,
      "🪓 ¡Nuevo Pico!",
      pickaxes[pk].name,
    );
  }

  if (sub === "equip") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    const pk = sa[0] ? sa[0].toLowerCase() : "";
    if (!pk) return m.reply(`_🪓 ¡Especifica qué pico equipar!_ Usa \`.mct picks\``);
    if (!mc.pickaxes[pk])
      return m.reply(`_📭 ¡No tienes este pico en tu inventario!_ Revisa \`.mct picks\``);
    mc.usedPickaxe = pk;
    db.markDirty("users");
    return send(
      sock,
      m,
      `*🪓 ¡PICO EQUIPADO!*\n\n*${mc.pickaxes[pk].name}* _✅ ya está activo._`,
      "🪓 Equipar Pico",
      mc.pickaxes[pk].name,
    );
  }

  if (sub === "picks") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    const pks = mc.pickaxes || {};
    if (Object.keys(pks).length === 0)
      return m.reply(`_📭 ¡No tienes ningún pico!_`);
    let txt = `*🎒 TU COLECCIÓN DE PICOS*\n\n`;
    for (const [k, pick] of Object.entries(pks)) {
      txt += `*${pick.name}*${mc.usedPickaxe === k ? " _✅ ACTIVO_" : ""}\n  _⬆️ Niv.${pick.level || 1}/${pick.maxLevel} | 🍀 Suerte ${(pick.luck * 100).toFixed(0)}% | ⚡ Vel ${(pick.speed * 100).toFixed(0)}%_\n`;
      if (pick.enchant)
        txt += `  _✨ Encantamiento: ${pickEnchants[pick.enchant] ? pickEnchants[pick.enchant].name : pick.enchant}_\n`;
    }
    return send(
      sock,
      m,
      txt + `\n\`.mct equip <pico>\``,
      "🎒 Mis Picos",
      `🪓 ${Object.keys(pks).length} picos`,
    );
  }

  if (sub === "enchant") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    const pk = mc.usedPickaxe || "woodpick";
    const pick = mc.pickaxes[pk];
    if (!pick) return m.reply(`_🪓 ¡No hay un pico activo para encantar!_`);
    const ek = sa[0] ? sa[0].toLowerCase() : "";
    if (!ek) {
      if (pick.enchant) {
        const e = pickEnchants[pick.enchant];
        return m.reply(
          `_✨ Encantamiento actual: *${e ? e.name : pick.enchant}* (${e ? e.rarity : "?"})_\n\`.mct enchant <clave>\` para cambiarlo.`,
        );
      }
      return m.reply(`_✨ ¡Indica un encantamiento!_ Revisa la lista con \`.mct enchants\``);
    }
    if (!pickEnchants[ek])
      return m.reply(`_✨ ¡Ese encantamiento no existe!_ Revisa \`.mct enchants\``);
    const ench = pickEnchants[ek];
    const cost = encCost(ench.rarity);
    if ((mc.money || 0) < cost)
      return m.reply(`_💸 ¡Dinero insuficiente! Necesitas ${formatMoney(cost)}_`);
    mc.money -= cost;
    pick.enchant = ek;
    db.markDirty("users");
    return send(
      sock,
      m,
      `*✨ ¡ENCANTAMIENTO APLICADO!*\n\n*${ench.name}* _(${ench.rarity})_ en tu *${pick.name}*\n_${ench.desc}_\n_💰 Coste: ${formatMoney(cost)}_`,
      "✨ Encantar",
      ench.name,
    );
  }

  if (sub === "enchants") {
    const byR = {};
    for (const [k, e] of Object.entries(pickEnchants)) {
      if (!byR[e.rarity]) byR[e.rarity] = [];
      byR[e.rarity].push({ key: k, name: e.name, desc: e.desc });
    }
    let txt = `*📜 LISTA DE ENCANTAMIENTOS*\n\n`;
    for (const r of [
      "common",
      "rare",
      "epic",
      "legendary",
      "mythic",
      "godly",
      "secret",
    ]) {
      const list = byR[r];
      if (!list) continue;
      txt += `${rc(r)} *${r.toUpperCase()}* _${formatMoney(encCost(r))}_\n`;
      for (const e of list) txt += `  \`${e.key}\`: ${e.name} _${e.desc}_\n`;
      txt += `\n`;
    }
    return send(
      sock,
      m,
      txt.trim() + `\n\`.mct enchant <clave>\``,
      "📜 Encantamientos",
      "✨ Elige un encanto",
    );
  }

  if (sub === "pickup") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    const pk = mc.usedPickaxe || "woodpick";
    const pick = mc.pickaxes[pk];
    if (!pick) return m.reply(`_🪓 ¡No tienes un pico equipado!_`);
    if (pick.level >= pick.maxLevel)
      return m.reply(`_⬆️ ¡Tu pico ya ha alcanzado el nivel máximo!_`);
    const cost =
      Math.floor(pick.price * 0.1 * pick.level) || 12000 * pick.level;
    if ((mc.money || 0) < cost)
      return m.reply(`_💸 ¡Dinero insuficiente! Necesitas ${formatMoney(cost)}_`);
    mc.money -= cost;
    const res = addPickExp(mc, pk, Math.floor(pick.expToNextLevel * 0.5));
    db.markDirty("users");
    return send(
      sock,
      m,
      res
        ? `*⬆️ ¡PICO MEJORADO!*\n\n${res}\n_💰 Coste: ${formatMoney(cost)}_`
        : `*⭐ ¡EXP DE PICO AUMENTADA!*\n\n⭐ +${Math.floor(pick.expToNextLevel * 0.5)} EXP\n_💰 Coste: ${formatMoney(cost)}_`,
      "⬆️ Mejorar Pico",
      pick.name,
    );
  }

  if (sub === "fight") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    if (!sa[0]) {
      const mobs = getAvailableMobs(mc);
      if (mobs.length === 0)
        return m.reply(`_👹 ¡No hay monstruos disponibles! Sube de nivel primero._`);
      let txt = `*👹 LISTA DE MOBS DISPONIBLES*\n\n_❤️ Tu HP: ${mc.hp}/${mc.maxHp} | ⚔️ Tu ATK: ${mc.atk}_\n\n`;
      for (const mob of mobs) {
        txt += `${rc(mob.rarity)} *${mob.name}*\n  _❤️ HP: ${mob.hp} | ⚔️ ATK: ${mob.atk} | ⬆️ Niv. Req: ${mob.minLevel}+_\n`;
      }
      txt += `\nUsa \`.mct fight <mob>\` para ⚔️ atacar.`;
      return send(sock, m, txt, "👹 Lista de Mobs", `👾 ${mobs.length} enemigos`);
    }
    const mk = sa[0].toLowerCase();
    if (!mobData[mk]) return m.reply(`_👹 ¡Ese mob no existe!_ Revisa \`.mct fight\``);
    const result = doCombat(mc, mk);
    if (result.error) return m.reply(`_${result.error}_`);
    db.markDirty("users");
    if (result.won) {
      let txt = `*🏆 ¡HAS GANADO EL COMBATE!*\n\n⚔️ Derrotaste a: *${result.mobName}*\n\n`;
      for (const line of result.log) txt += `${line}\n`;
      txt += `\n*⭐ EXP Ganada:* +${result.expGain}`;
      if (result.drops.length > 0) {
        txt += `\n*🎁 Objetos obtenidos:*`;
        for (const d of result.drops)
          txt += `\n  ${d.name} _💰 ${formatMoney(d.value)}_`;
      }
      return send(sock, m, txt, "🏆 ¡Victoria!", result.mobName);
    } else {
      let txt = `*💀 ¡HAS SIDO DERROTADO!*\n\n⚔️ Caíste ante: *${result.mobName}*\n\n`;
      for (const line of result.log) txt += `${line}\n`;
      txt += `\n_❤️ HP Restante: ${mc.hp}/${mc.maxHp}_\nUsa \`.mct heal\` para ❤️ curarte.`;
      return send(sock, m, txt, "💀 ¡Derrota!", result.mobName);
    }
  }

  if (sub === "heal") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    const result = healPlayer(mc);
    if (result.error) return m.reply(`_${result.error}_`);
    db.markDirty("users");
    return send(
      sock,
      m,
      `*❤️ ¡CURACIÓN COMPLETADA!*\n\n❤️ HP Actual: ${result.hp}/${mc.maxHp}\n_💰 Coste: ${formatMoney(result.cost)}_`,
      "❤️ Curarse",
      `❤️ ${result.hp}`,
    );
  }

  if (sub === "smelt") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    const result = doSmelt(mc);
    if (result.count === 0)
      return m.reply(`_🔥 ¡No tienes minerales en el inventario para fundir!_`);
    mc.money = (mc.money || 0) + result.totalValue;
    mc.totalEarned = (mc.totalEarned || 0) + result.totalValue;
    let txt = `*🔥 ¡FUNDICIÓN TERMINADA!*\n\n`;
    for (const s of result.smelted)
      txt += `${s.from} → ${s.to} _💰 ${formatMoney(s.value)}_\n`;
    txt += `\n*💰 Total conseguido: ${formatMoney(result.totalValue)}*\n*🏦 Saldo actual: ${formatMoney(mc.money)}*`;
    db.markDirty("users");
    return send(
      sock,
      m,
      txt,
      "🔥 Fundición",
      `💰 ${formatMoney(result.totalValue)}`,
    );
  }

  if (sub === "craft") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    if (!sa[0]) {
      let txt = `*🛠️ LISTA DE RECETAS DE CRAFTEO*\n\n`;
      for (const [k, r] of Object.entries(CRAFT_RECIPES)) {
        const canCraft = (mc.level || 1) >= r.requiredLevel;
        txt += `${canCraft ? "✅" : "🔒"} *${r.name}* _\`${k}\`_\n  _💰 Valor: ${formatMoney(r.value)} | ⬆️ Niv. Req: ${r.requiredLevel}+_\n  _🧪 Materiales:_\n`;
        for (const [ing, cnt] of Object.entries(r.ingredients))
          txt += `     _${ing} x${cnt}_\n`;
        txt += `\n`;
      }
      return send(
        sock,
        m,
        txt + `\`.mct craft <id>\``,
        "🛠️ Crafteo",
        "🧪 Escoge una receta",
      );
    }
    const result = doCraft(mc, sa[0].toLowerCase());
    if (result.error) return m.reply(`_${result.error}_`);
    db.markDirty("users");
    return send(
      sock,
      m,
      `*🛠️ ¡OBJETO CRAFTEADO CON ÉXITO!*\n\n*${result.item}*\n_💰 Valor de mercado: ${formatMoney(result.value)}_`,
      "🛠️ ¡Creado!",
      result.item,
    );
  }

  if (sub === "inv" || sub === "inventory") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    if (!mc.inventory || mc.inventory.length === 0)
      return m.reply(`_🎒 ¡Tu inventario está completamente vacío!_`);
    const grouped = {};
    for (const item of mc.inventory) {
      const key = item.name;
      if (!grouped[key]) grouped[key] = { name: item.name, count: 0, value: 0 };
      grouped[key].count++;
      grouped[key].value += item.price || 0;
    }
    let txt = `*🎒 INVENTARIO ACTUAL*\n\n`;
    let totalV = 0;
    for (const g of Object.values(grouped)) {
      txt += `${g.name} _📦 x${g.count} | 💰 ${formatMoney(g.value)}_\n`;
      totalV += g.value;
    }
    txt += `\n*💰 Valor Total del Inventario: ${formatMoney(totalV)}*`;
    return send(
      sock,
      m,
      txt,
      "🎒 Inventario",
      `📦 ${mc.inventory.length} objetos`,
    );
  }

  if (sub === "daily") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    const now = new Date();
    if (mc.lastDaily) {
      const diff = now.getTime() - new Date(mc.lastDaily).getTime();
      if (diff < 86400000)
        return m.reply(
          `_🎁 ¡Ya has reclamado tu recompensa diaria! Vuelve en *${Math.ceil((86400000 - diff) / 3600000)}* horas._`,
        );
    }
    const ld = mc.lastDaily ? new Date(mc.lastDaily) : null;
    mc.dailyStreak =
      ld && now.getTime() - ld.getTime() < 172800000
        ? (mc.dailyStreak || 0) + 1
        : 1;
    let rw = DAILY_REWARDS[0];
    for (const r of DAILY_REWARDS) {
      if (mc.dailyStreak >= r.streak) rw = r;
    }
    mc.money = (mc.money || 0) + rw.money;
    mc.gachaTickets = (mc.gachaTickets || 0) + rw.tickets;
    mc.lastDaily = now.toISOString();
    db.markDirty("users");
    return send(
      sock,
      m,
      `*🎁 ¡RECOMPENSA DIARIA RECLAMADA!*\n\n*🔥 Racha:* ${mc.dailyStreak} días seguidos\n💰 +${formatMoney(rw.money)}\n🎟️ +${rw.tickets} Ticket(s) de Gacha\n*🏦 Saldo actual:* ${formatMoney(mc.money)}`,
      "🎁 Diaria",
      `🔥 Racha de ${mc.dailyStreak} días`,
    );
  }

  if (sub === "gacha") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    const useT = sa[0] && sa[0].toLowerCase() === "ticket";
    if (useT) {
      if ((mc.gachaTickets || 0) < 1)
        return m.reply(`_🎟️ ¡No tienes tickets! Te quedan: ${mc.gachaTickets || 0}_`);
      mc.gachaTickets -= 1;
    } else {
      if ((mc.money || 0) < GACHA_COST_COINS)
        return m.reply(
          `_💸 ¡Dinero insuficiente! El gacha cuesta ${formatMoney(GACHA_COST_COINS)}_`,
        );
      mc.money -= GACHA_COST_COINS;
    }
    const result = doGachaPull(mc);
    const item = result.item;
    let txt = `*🎰 ¡RESULTADO DEL GACHA!*\n\n`;
    switch (item.type) {
      case "pickaxe":
        if (pickaxes[item.value] && !mc.pickaxes[item.value]) {
          mc.pickaxes[item.value] = { ...pickaxes[item.value] };
          txt += `🪓 OBTUVISTE EL PICO: *${item.label}*\n`;
        } else if (mc.pickaxes[item.value]) {
          const ref = Math.floor(
            (pickaxes[item.value] ? pickaxes[item.value].price : 0) * 0.3 ||
              120000,
          );
          mc.money = (mc.money || 0) + ref;
          txt += `♻️ Objeto repetido: *${item.label}* _💰 Compensación: +${formatMoney(ref)}_\n`;
        }
        break;
      case "tickets":
        mc.gachaTickets = (mc.gachaTickets || 0) + item.value;
        txt += `🎟️ +${item.value} Ticket(s)\n`;
        break;
      case "tokens":
        mc.prestigeTokens = (mc.prestigeTokens || 0) + item.value;
        txt += `🪙 +${item.value} Token(s)\n`;
        break;
      case "coins":
        mc.money = (mc.money || 0) + item.value;
        txt += `💰 +${formatMoney(item.value)}\n`;
        break;
      case "enchant_scroll": {
        const avail = Object.entries(pickEnchants).filter(
          ([, v]) => v.rarity === item.value,
        );
        if (avail.length > 0) {
          const [ek2, ed] = avail[Math.floor(Math.random() * avail.length)];
          const pk2 = mc.usedPickaxe || "woodpick";
          if (mc.pickaxes[pk2]) {
            mc.pickaxes[pk2].enchant = ek2;
            txt += `✨ Encanto aplicado: *${ed.name}* _(${item.value})_ directamente en tu pico activo.\n`;
          }
        }
        break;
      }
      case "xp_boost":
        mc.exp = (mc.exp || 0) + Math.floor(mc.expToNextLevel * 0.5);
        txt += `⭐ ¡Potenciador de XP x${item.value}!\n`;
        break;
      default:
        txt += `${item.label}\n`;
    }
    if (result.isSSR) txt += `\n*🌈 ¡PULL SSR REVELADO!*`;
    if (result.pity) txt += `\n*🔥 ¡Lástima (Pity) Activada!*`;
    txt += `\n\n_🔥 Pity actual: ${mc.gachaPity}/${GACHA_PITY_LIMIT}_\n_🏦 Saldo: ${formatMoney(mc.money)} | 🎟️ Tickets: ${mc.gachaTickets}_`;
    db.markDirty("users");
    return send(
      sock,
      m,
      txt,
      "🎰 Gacha!",
      result.isSSR ? "🌈 ¡PULL SSR!" : "🎁 Resultado",
    );
  }

  if (sub === "upgrade") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    const type = sa[0] ? sa[0].toLowerCase() : "";
    if (!type || !UPGRADES[type]) {
      let txt = `*📈 TIENDA DE MEJORAS DE ATRIBUTOS*\n\n`;
      for (const [k, u] of Object.entries(UPGRADES)) {
        const lv = mc[k + "Upgrade"] || 0;
        txt += `*${u.name}* _(Niv.${lv}/${u.maxLevel})_\n  _${u.desc}_\n  ${lv >= u.maxLevel ? "_✅ MEJORADO AL MÁXIMO_" : `_💰 Siguiente nivel: ${formatMoney(u.getCost(lv))}_`}\n\n`;
      }
      return send(
        sock,
        m,
        txt + `\`.mct upgrade <luck/speed/fortune/combat>\``,
        "📈 Tienda de Mejoras",
        "⬆️ Potencia tus estadísticas",
      );
    }
    const upg = UPGRADES[type];
    const lv = mc[type + "Upgrade"] || 0;
    if (lv >= upg.maxLevel) return m.reply(`_✅ ¡Este atributo ya está al máximo!_`);
    const cost = upg.getCost(lv);
    if ((mc.money || 0) < cost)
      return m.reply(`_💸 ¡Dinero insuficiente! Necesitas ${formatMoney(cost)}_`);
    mc.money -= cost;
    mc[type + "Upgrade"] = lv + 1;
    if (type === "combat")
      mc.atk = 4 + Math.floor(mc.level * 0.5) + (lv + 1) * 3;
    db.markDirty("users");
    return send(
      sock,
      m,
      `*⬆️ ¡MEJORA DE ${upg.name.toUpperCase()} ADQUIRIDA!*\n\n_⬆️ Ahora en Nivel ${lv + 1}_\n_💰 Coste: ${formatMoney(cost)}_\n_${upg.desc}_`,
      "📈 ¡Mejorado!",
      `${upg.name} Niv.${lv + 1}`,
    );
  }

  if (sub === "prestige") {
    const user = getOrCreateMCUser(db, m.sender);
    const mc = user.minecraft;
    const cp = mc.prestige || 0;
    if (sa[0] && sa[0].toLowerCase() === "confirm") {
      const reqs = [
        { blocks: 500, money: 2e10 },
        { blocks: 1500, money: 2e12 },
        { blocks: 4000, money: 2e14 },
        { blocks: 10000, money: 2e19 },
        { blocks: 25000, money: 2e22 },
      ];
      const req = reqs[cp];
      if (!req) return m.reply(`_👑 ¡Ya tienes el nivel de prestigio máximo!_`);
      if ((mc.blocksMined || 0) < req.blocks)
        return m.reply(`_🧱 ¡Bloques insuficientes! Requieres minar ${req.blocks}_`);
      if ((mc.money || 0) < req.money)
        return m.reply(`_💸 ¡Dinero insuficiente! Requieres ${formatMoney(req.money)}_`);
      mc.prestige = cp + 1;
      mc.money = Math.floor(mc.money * 0.1);
      mc.blocksMined = 0;
      mc.streak = 0;
      mc.prestigeTokens =
        (mc.prestigeTokens || 0) + [60, 180, 600, 1200, 6000][cp];
      const titles = [
        "Minero Novato",
        "Veterano",
        "Maestro Minero",
        "Leyenda",
        "Trascendental",
        "Dios de la Minería",
      ];
      if (cp === 0 && !mc.pickaxes.prestigepick)
        mc.pickaxes.prestigepick = { ...pickaxes.prestigepick };
      if (cp === 2 && !mc.pickaxes.cosmicpick)
        mc.pickaxes.cosmicpick = { ...pickaxes.cosmicpick };
      db.markDirty("users");
      return send(
        sock,
        m,
        `*👑 ¡PRESTIGIO INCREMENTADO!*\n\n*🏷️ Rango Nuevo:* ${titles[mc.prestige]}\n*🪙 Tokens Recibidos:* ${mc.prestigeTokens}\n\n_💸 Tu dinero se reduce al 10% y el contador de bloques minados se reinicia._`,
        "👑 ¡PRESTIGIO!",
        titles[mc.prestige],
      );
    }
    let txt = `*👑 PR...`; // El contenido restante del comando "prestige" queda cortado igual que en el original.
