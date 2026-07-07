import { getDatabase } from "../../src/lib/ourin-database.js";
import {
  getOrCreateFischUser,
  getRandomFish,
  formatMoney,
  addRodExp,
  addPlayerExp,
  getUpgradedStats,
  doGachaPull,
  getStreakBonus,
  JACKPOT_POOLS,
  doJackpotPull,
  applyJackpotReward,
} from "../../src/lib/ourin-fisch.js";
import {
  islands,
  travelRequirements,
  fishingRod,
  rodEnchants,
  mutations,
  RARITY_EMOJI,
  UPGRADES,
  DAILY_REWARDS,
  TOKEN_SHOP,
  GACHA_COST_COINS,
  GACHA_PITY_LIMIT,
} from "../../src/lib/ourin-fisch-data.js";
import config from "../../config.js";
import path from "path";
import fs from "fs";

const FC = 15;
const rc = (r) => RARITY_EMOJI[r] || "W";
const encCost = (r) =>
  ({
    common: 50000,
    rare: 500000,
    epic: 5e6,
    legendary: 5e7,
    mythic: 5e8,
    godly: 5e9,
    secret: 5e10,
  })[r] || 50000;

let thumbFish = null;
try {
  const p = path.join(process.cwd(), "assets", "images", "ourin-fishit.jpg");
  if (fs.existsSync(p)) thumbFish = fs.readFileSync(p);
} catch (e) {}

function ctx(title, body) {
  const sId = config.saluran?.id || "120363400911374213@newsletter";
  const sName = config.saluran?.name || config.bot?.name || "Ourin-AI";
  const c = {
    forwardingScore: 9999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: sId,
      newsletterName: sName,
      serverMessageId: 127,
    },
  };
  return c;
}

function send(sock, m, text, title, body) {
  const msgId = sock.sendPreview(
    m.chat,
    {
      caption: `${config.info.website} ${text}`,
      url: `${config.info.website}`,
      title: `𝗙𝗜𝗦𝗛 𝗜𝗧 𝗚𝗔module`,
      description: `¡Consigue recompensas y diviértete con los resultados de tu pesca!`,
      jpegThumbnail: thumbFish,
      previewType: 0,
    },
    { quoted: m },
  );
  return { key: { id: msgId, remoteJid: m.chat, fromMe: true } };
}

const pluginConfig = {
  name: "fisht",
  alias: ["fishit", "pescar", "pez"],
  category: "game",
  description: "Fishit - Juego de Caña de Pescar",
  usage: ".fisht <comando>",
  example: ".fisht help",
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

  if (cmd === "fishit") {
    if (!sub || sub === "on" || sub === "off") {
      if (!m.isGroup) return m.reply("_El interruptor solo funciona en grupos_");
      if (!m.isOwner && !m.isAdmin) return m.reply("_Solo administradores u dueños_");
      const gd = db.getGroup(m.chat) || {};
      if (sub === "on") {
        gd.fishitEnabled = true;
        db.setGroup(m.chat, gd);
        return send(
          sock,
          m,
          `*FISHIT ACTIVADO*\n\n¡Todos los miembros deben jugar Fishit!\nEscribe \`.fisht help\` para empezar`,
          "Fishit ON",
          "Activar",
        );
      }
      if (sub === "off") {
        gd.fishitEnabled = false;
        db.setGroup(m.chat, gd);
        return send(sock, m, `*FISHIT DESACTIVADO*`, "Fishit OFF", "Desactivar");
      }
      return m.reply(
        `*Fishit:* ${gd.fishitEnabled ? "ACTIVADO" : "DESACTIVADO"}\n\`.fishit on/off\``,
      );
    }
  }

  if (cmd !== "fisht" && cmd !== "fishit") return;

  if (!sub || sub === "help" || sub === "menu" || sub === "ayuda") {
    return send(
      sock,
      m,
      `*JUEGO FISHIT*\n_El sistema de juego de pesca más completo_\n\n` +
        `*PESCA*\n\`.fisht mancing\` _Empezar a pescar_\n\`.fisht view\` _Recoger captura_\n\`.fisht sell\` _Vender pescados_\n\`.fisht fishbook\` _Enciclopedia de peces_\n\`.fisht mutbook\` _Colección de mutaciones_\n\`.fisht top\` _Tabla de clasificación_\n\n` +
        `*PERFIL*\n\`.fisht me\` _Tu perfil_\n\`.fisht stats\` _Estadísticas detalladas_\n\`.fisht daily\` _Recompensa diaria_\n\n` +
        `*ISLAS Y CAÑAS*\n\`.fisht travel\` _Lista de islas_\n\`.fisht travel <isla>\` _Viajar a otra isla_\n\`.fisht shop\` _Tienda de cañas_\n\`.fisht buy <caña>\` _Comprar caña_\n\`.fisht equip <caña>\` _Equipar caña_\n\`.fisht rods\` _Colección de cañas_\n\`.fisht enchant <clave>\` _Encantar caña_\n\`.fisht enchants\` _Lista de encantamientos_\n\`.fisht rodup\` _Mejorar nivel de caña_\n\n` +
        `*PRESTIGIO*\n\`.fisht prestige\` _Información de prestigio_\n\`.fisht tokens\` _Tienda de fichas (tokens)_\n\`.fisht upgrade\` _Mejorar estadísticas_\n\`.fisht gacha\` _Gacha con monedas_\n\`.fisht gacha ticket\` _Gacha usando tickets_\n\n` +
        `*JACKPOT*\n\`.fisht jackpot\` _Lista de jackpots_\n\`.fisht jackpot <tier>\` _Jugar al jackpot_\n_¡El Jackpot te puede dar Premium, Socio, Energía, Límite o incluso ILIMITADO!_`,
      "Juego Fishit",
      "Juego de Cañas de Pescar",
    );
  }
  if (sub === "mancing" || sub === "fish" || sub === "pescar") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    if (f.fishingPending && f.fishingPending.length > 0)
      return m.reply(`_¡Aún tienes una captura pendiente!_ Usa \`.fisht view\` _primero._`);
    const now = Date.now();
    if (f.lastFishTime && now - f.lastFishTime < FC * 1000)
      return m.reply(
        `_Por favor espera *${Math.ceil((FC * 1000 - (now - f.lastFishTime)) / 1000)}* segundos_`,
      );
    const rk = f.usedFishingRod || "basicrod";
    const rod = f.fishingRods[rk];
    if (!rod) return m.reply(`_¡No tienes ninguna caña activa!_ Usa \`.fisht rods\``);
    const ik = f.currentIsland || "mousewood";
    const st = getUpgradedStats(f, rod);
    const eRod = {
      ...rod,
      luck: st.luck,
      speed: st.speed,
      sellMultiplier: st.sellMultiplier,
    };
    const catches = [];
    let tv = 0;
    for (let i = 0; i < (rod.comboFish || 1); i++) {
      const fish = getRandomFish(eRod, ik);
      if (fish) {
        fish.price = Math.round(
          fish.price * getStreakBonus(f.streak || 0).mult,
        );
        catches.push(fish);
        tv += fish.price;
      }
    }
    f.fishingPending = catches;
    f.lastFishTime = now;
    f.streak = (f.streak || 0) + 1;
    await send(
      sock,
      m,
      `*_Pescando en ${islands[ik]?.name || ik}..._*\n_Caña: ${rod.name} | Suerte: ${(st.luck * 100).toFixed(1)}%_`,
      "Pescando...",
      islands[ik]?.name || "",
    );
    await new Promise((r) =>
      setTimeout(
        r,
        Math.min(Math.max(2000, 5000 - (rod.speed || 0) * 3000), 4000),
      ),
    );
    let txt = `*¡RESULTADO DE LA PESCA!*\n\n`;
    for (const c of catches) {
      txt += `${rc(c.rarity)} *${c.name}*\n   _${formatMoney(c.price)} | ${c.kg}kg_\n`;
      if (c.isMutated)
        txt += `   _Mutación: ${c.mutations.filter((x) => x !== "Normal").join(", ")}_\n`;
    }
    txt += `\n*Total: ${formatMoney(tv)}*`;
    if (f.streak >= 3) txt += `\n_Racha: ${f.streak}x_`;
    txt += `\n\nUsa \`.fisht view\` para recoger la captura.`;
    db.markDirty("users");
    return send(sock, m, txt, "¡Resultado!", formatMoney(tv));
  }

  if (sub === "view" || sub === "recoger") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    if (!f.fishingPending || f.fishingPending.length === 0)
      return m.reply(`_No tienes capturas pendientes._ ¡Usa \`.fisht mancing\` _primero!_`);
    const catches = f.fishingPending;
    let tv = 0,
      te = 0,
      nf = [],
      nm = [];
    for (const fish of catches) {
      tv += fish.price;
      te += Math.max(10, Math.floor(fish.price / 50));
      const cn = fish.name.replace(/[\u{1F300}-\u{1F9FF}]/gu, "").trim();
      if (!f.fishFound.includes(cn)) {
        f.fishFound.push(cn);
        nf.push(cn);
      }
      if (fish.isMutated)
        for (const mut of fish.mutations) {
          if (mut !== "Normal" && !f.mutationFound.includes(mut)) {
            f.mutationFound.push(mut);
            nm.push(mut);
          }
        }
    }
    f.money = (f.money || 0) + tv;
    f.fishCaught = (f.fishCaught || 0) + catches.length;
    f.totalEarned = (f.totalEarned || 0) + tv;
    f.inventory = [...(f.inventory || []), ...catches];
    const rlu = addRodExp(f, f.usedFishingRod || "basicrod", te);
    const plu = addPlayerExp(f, te);
    f.fishingPending = [];
    let txt = `*¡CAPTURA GUARDADA INVENTARIO!*\n\n+${formatMoney(tv)}\n+${te} EXP\n+${catches.length} peces\n`;
    if (nf.length > 0) txt += `\n*Peces Nuevos:* ${nf.join(", ")}`;
    if (nm.length > 0) txt += `\n*Mutaciones Nuevas:* ${nm.join(", ")}`;
    if (rlu) txt += `\n\n${rlu}`;
    if (plu) txt += `\n*¡SUBISTE DE NIVEL! Nivel ${f.level}*`;
    db.markDirty("users");
    return send(sock, m, txt, "¡Captura Recogida!", `+${formatMoney(tv)}`);
  }

  if (sub === "sell" || sub === "vender") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    if (!f.inventory || f.inventory.length === 0)
      return m.reply(`_¡Tu inventario está vacío!_ Ve a pescar con \`.fisht mancing\` _primero._`);
    let tv = 0;
    for (const fish of f.inventory) tv += fish.price || 0;
    const sb = UPGRADES.sell.effect(f.sellUpgrade || 0);
    const rod = f.fishingRods[f.usedFishingRod || "basicrod"];
    const rsm = rod ? rod.sellMultiplier || 0 : 0;
    const fv = Math.round(tv * (1 + sb + rsm));
    const fc2 = f.inventory.length;
    f.money = (f.money || 0) + fv;
    f.totalEarned = (f.totalEarned || 0) + fv;
    f.inventory = [];
    db.markDirty("users");
    return send(
      sock,
      m,
      `*¡PECES VENDIDOS!*\n\nCantidad: ${fc2}\nTotal Recibido: ${formatMoney(fv)}\nSaldo actual: ${formatMoney(f.money)}`,
      "Peces Vendidos",
      formatMoney(fv),
    );
  }

  if (sub === "me" || sub === "perfil") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    const rod = f.fishingRods[f.usedFishingRod || "basicrod"];
    return send(
      sock,
      m,
      `*PERFIL DE PESCADOR*\n\n*Nivel:* ${f.level} _(${f.exp}/${f.expToNextLevel} EXP)_\n*Dinero:* ${formatMoney(f.money)}\n*Peces atrapados:* ${f.fishCaught}\n*Caña:* ${rod ? rod.name : "Básica"} _(Nivel ${rod ? rod.level : 1})_\n*Isla actual:* ${islands[f.currentIsland] ? islands[f.currentIsland].name : f.currentIsland}\n*Racha:* ${f.streak || 0}\n*Prestigio:* ${f.prestige || 0}\n*Fichas (Tokens):* ${f.prestigeTokens || 0}\n*Tickets:* ${f.gachaTickets || 0}\n*Enciclopedia (FishBook):* ${f.fishFound ? f.fishFound.length : 0}\n*Mutaciones:* ${f.mutationFound ? f.mutationFound.length : 0}\n*Mejoras:*\n  _Suerte: Nivel ${f.luckUpgrade || 0}_\n  _Velocidad: Nivel ${f.speedUpgrade || 0}_\n  _Venta: Nivel ${f.sellUpgrade || 0}_`,
      "Perfil",
      `Nivel ${f.level}`,
    );
  }

  if (sub === "stats" || sub === "estadisticas") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    const rod = f.fishingRods[f.usedFishingRod || "basicrod"];
    const st = getUpgradedStats(f, rod);
    let txt = `*ESTADÍSTICAS DETALLADAS*\n\n*Caña: ${rod ? rod.name : "Ninguna"}*\n  _Nivel ${rod ? rod.level : 1}/${rod ? rod.maxLevel : 5} | EXP ${rod ? rod.exp : 0}/${rod ? rod.expToNextLevel : 100}_\n  _Suerte: ${(st.luck * 100).toFixed(1)}% | Velocidad: ${(st.speed * 100).toFixed(1)}%_\n  _Multiplicador Venta: +${(st.sellMultiplier * 100).toFixed(1)}% | Combo: ${rod ? rod.comboFish : 1}_\n`;
    if (rod && rod.enchant) {
      const e = rodEnchants[rod.enchant];
      txt += `  _Encantamiento: ${e ? e.name : rod.enchant} (${e ? e.rarity : "?"})_\n`;
    }
    txt += `\n*Mejoras del Jugador*\n  _Suerte: Nivel ${f.luckUpgrade || 0} (+${(UPGRADES.luck.effect(f.luckUpgrade || 0) * 100).toFixed(1)}%)_\n  _Velocidad: Nivel ${f.speedUpgrade || 0} (+${(UPGRADES.speed.effect(f.speedUpgrade || 0) * 100).toFixed(1)}%)_\n  _Venta: Nivel ${f.sellUpgrade || 0} (+${(UPGRADES.sell.effect(f.sellUpgrade || 0) * 100).toFixed(1)}%)_`;
    return send(sock, m, txt, "Estadísticas Detalladas", rod ? rod.name : "");
  }
  if (sub === "fishbook") {
    const user = getOrCreateFischUser(db, m.sender);
    const found = user.fisch.fishFound || [];
    if (found.length === 0)
      return m.reply(`_¡Tu Fish Book está vacío!_ Ve a pescar con \`.fisht mancing\` _primero._`);
    let txt = `*FISH BOOK* _(${found.length} especies)_\n\n`;
    for (const [k, isle] of Object.entries(islands)) {
      const fl = isle.listFish.filter((f) => found.includes(f.name));
      if (fl.length > 0) {
        txt += `*${isle.name}*\n`;
        for (const f of fl) txt += `  ${rc(f.rarity)} ${f.name}\n`;
        txt += `\n`;
      }
    }
    return send(sock, m, txt.trim(), "Fish Book", `${found.length} especies`);
  }

  if (sub === "mutbook") {
    const user = getOrCreateFischUser(db, m.sender);
    const found = user.fisch.mutationFound || [];
    if (found.length === 0) return m.reply(`_¡Tu libro de mutaciones está vacío!_`);
    let txt = `*MUTATION BOOK* _(${found.length})_\n\n`;
    for (const mut of found) {
      const d = mutations[mut];
      if (d) txt += `*${mut}* _x${d.multiplier}_\n`;
    }
    return send(sock, m, txt.trim(), "Mutation Book", `${found.length} mutaciones`);
  }

  if (sub === "travel" || sub === "viajar") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    if (!sa[0]) {
      let txt = `*LISTA DE ISLAS*\n\n`;
      for (const [k, isle] of Object.entries(islands)) {
        const req = travelRequirements[k];
        const ok = (f.travelFound || []).includes(k);
        txt += `${ok ? "[DESBLOQUEADA]" : "[BLOQUEADA]"} *${isle.name}*${f.currentIsland === k ? " _< Estás aquí_" : ""}\n`;
        txt += req
          ? `    _${formatMoney(req.money)} | ${req.fish} peces atrapados_\n`
          : `    _Gratis_\n`;
      }
      return send(
        sock,
        m,
        txt + `\n\`.fisht travel <nombre_isla>\``,
        "Lista de Islas",
        islands[f.currentIsland || "mousewood"]?.name || "",
      );
    }
    const tk = sa[0].toLowerCase();
    if (!islands[tk]) return m.reply(`_¡Esa isla no existe!_ Revisa la lista con \`.fisht travel\``);
    if (f.currentIsland === tk)
      return m.reply(`_¡Ya te encuentras en ${islands[tk].name}!_`);
    const req = travelRequirements[tk];
    if (req) {
      if ((f.money || 0) < req.money)
        return m.reply(`_¡Dinero insuficiente! Necesitas ${formatMoney(req.money)}_`);
      if ((f.fishCaught || 0) < req.fish)
        return m.reply(`_¡No has pescado lo suficiente! Necesitas ${req.fish} peces atrapados en total._`);
      f.money -= req.money;
    }
    if (!(f.travelFound || []).includes(tk))
      f.travelFound = [...(f.travelFound || []), tk];
    f.currentIsland = tk;
    db.markDirty("users");
    return send(
      sock,
      m,
      `*¡MUDANZA DE ISLA!*\n\nAhora estás en *${islands[tk].name}*\n${islands[tk].listFish.length} tipos de peces disponibles para pescar.`,
      "¡Buen viaje!",
      islands[tk].name,
    );
  }

  if (sub === "shop" || sub === "tienda") {
    let txt = `*TIENDA DE CAÑAS DE PESCAR*\n\n`;
    for (const [k, rod] of Object.entries(fishingRod)) {
      if (rod.price > 0)
        txt += `*${rod.name}*\n    _${formatMoney(rod.price)}_\n    _Suerte +${(rod.luck * 100).toFixed(0)}% | Velocidad +${(rod.speed * 100).toFixed(0)}% | Combo: ${rod.comboFish}_\n    _${rod.description}_\n\n`;
    }
    return send(
      sock,
      m,
      txt + `\`.fisht buy <caña>\``,
      "Tienda de Cañas",
      "Elige la mejor caña",
    );
  }

  if (sub === "buy" || sub === "comprar") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    const rk = sa[0] ? sa[0].toLowerCase() : "";
    if (!rk) return m.reply(`_¡Especifica qué caña quieres comprar!_ Revisa \`.fisht shop\``);
    if (!fishingRod[rk]) return m.reply(`_¡Esa caña no existe!_ Revisa la lista en \`.fisht shop\``);
    if (f.fishingRods[rk])
      return m.reply(`_¡Ya posees la caña ${fishingRod[rk].name}!_`);
    if (fishingRod[rk].price === 0)
      return m.reply(`_¡Esta caña solo se puede obtener con Fichas de Prestigio!_`);
    if ((f.money || 0) < fishingRod[rk].price)
      return m.reply(
        `_¡Dinero insuficiente! Necesitas ${formatMoney(fishingRod[rk].price)}_`,
      );
    f.money -= fishingRod[rk].price;
    f.fishingRods[rk] = { ...fishingRod[rk] };
    db.markDirty("users");
    return send(
      sock,
      m,
      `*¡CAÑA COMPRADA!*\n\n*${fishingRod[rk].name}*\n_Escribe_ \`.fisht equip ${rk}\` _puedes activarla ahora._`,
      "¡Nueva Caña!",
      fishingRod[rk].name,
    );
  }

  if (sub === "equip" || sub === "equipar") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    const rk = sa[0] ? sa[0].toLowerCase() : "";
    if (!rk) return m.reply(`_¡Especifica qué caña equipar!_ Revisa tus opciones con \`.fisht rods\``);
    if (!f.fishingRods[rk])
      return m.reply(`_¡No eres dueño de esta caña!_ Revisa tu colección con \`.fisht rods\``);
    f.usedFishingRod = rk;
    db.markDirty("users");
    return send(
      sock,
      m,
      `*¡CAÑA EQUIPADA!*\n\n*${f.fishingRods[rk].name}* _ahora está activa._`,
      "¡Equipado!",
      f.fishingRods[rk].name,
    );
  }

  if (sub === "rods" || sub === "cañas") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    const rods = f.fishingRods || {};
    if (Object.keys(rods).length === 0) return m.reply(`_¡No tienes cañas!_`);
    let txt = `*COLECCIÓN DE CAÑAS*\n\n`;
    for (const [k, rod] of Object.entries(rods)) {
      txt += `*${rod.name}*${f.usedFishingRod === k ? " _[ACTIVA]_" : ""}\n  _Nivel ${rod.level || 1}/${rod.maxLevel} | Suerte ${(rod.luck * 100).toFixed(0)}% | Velocidad ${(rod.speed * 100).toFixed(0)}%_\n`;
      if (rod.enchant)
        txt += `  _Encanto: ${rodEnchants[rod.enchant] ? rodEnchants[rod.enchant].name : rod.enchant}_\n`;
    }
    return send(
      sock,
      m,
      txt + `\n\`.fisht equip <caña>\``,
      "Colección de Cañas",
      `${Object.keys(rods).length} cañas`,
    );
  }
  if (sub === "enchant" || sub === "encantar") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    const rk = f.usedFishingRod || "basicrod";
    const rod = f.fishingRods[rk];
    if (!rod) return m.reply(`_¡No tienes una caña activa para encantar!_`);
    const ek = sa[0] ? sa[0].toLowerCase() : "";
    if (!ek) {
      if (rod.enchant) {
        const e = rodEnchants[rod.enchant];
        return m.reply(
          `_Encantamiento actual: *${e ? e.name : rod.enchant}* (${e ? e.rarity : "?"})_\nEscribe \`.fisht enchant <clave>\` para cambiarlo.`,
        );
      }
      return m.reply(`_¡Especifica un encantamiento!_ Revisa la lista con \`.fisht enchants\``);
    }
    if (!rodEnchants[ek])
      return m.reply(`_¡Ese encantamiento no existe!_ Revisa la lista con \`.fisht enchants\``);
    const ench = rodEnchants[ek];
    const cost = encCost(ench.rarity);
    if ((f.money || 0) < cost)
      return m.reply(`_¡Dinero insuficiente! Necesitas ${formatMoney(cost)}_`);
    f.money -= cost;
    rod.enchant = ek;
    db.markDirty("users");
    return send(
      sock,
      m,
      `*¡ENCANTAMIENTO APLICADO!*\n\n*${ench.name}* _(${ench.rarity})_ a tu caña *${rod.name}*\n_${ench.desc}_\n_Costo total: ${formatMoney(cost)}_`,
      "¡Encantado!",
      ench.name,
    );
  }

  if (sub === "enchants" || sub === "encantamientos") {
    const byR = {};
    for (const [k, e] of Object.entries(rodEnchants)) {
      if (!byR[e.rarity]) byR[e.rarity] = [];
      byR[e.rarity].push({ key: k, name: e.name, desc: e.desc });
    }
    let txt = `*LISTA DE ENCANTAMIENTOS*\n\n`;
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
      txt += `${rc(r)} *${r.toUpperCase()}* _Precio por aplicar: ${formatMoney(encCost(r))}_\n`;
      for (const e of list) txt += `  \`${e.key}\`: ${e.name} _${e.desc}_\n`;
      txt += `\n`;
    }
    return send(
      sock,
      m,
      txt.trim() + `\n\`.fisht enchant <clave>\``,
      "Encantamientos",
      "Elige un encantamiento",
    );
  }

  if (sub === "rodup" || sub === "mejorarcaña") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    const rk = f.usedFishingRod || "basicrod";
    const rod = f.fishingRods[rk];
    if (!rod) return m.reply(`_¡No tienes una caña activa!_`);
    if (rod.level >= rod.maxLevel) return m.reply(`_¡Tu caña ya alcanzó el nivel máximo!_`);
    const cost = Math.floor(rod.price * 0.1 * rod.level) || 10000 * rod.level;
    if ((f.money || 0) < cost)
      return m.reply(`_¡Dinero insuficiente! Necesitas ${formatMoney(cost)}_`);
    f.money -= cost;
    const res = addRodExp(f, rk, Math.floor(rod.expToNextLevel * 0.5));
    db.markDirty("users");
    return send(
      sock,
      m,
      res
        ? `*¡CAÑA MEJORADA!*\n\n${res}\n_Costo: ${formatMoney(cost)}_`
        : `*¡EXP DE CAÑA AUMENTADA!*\n\n+${Math.floor(rod.expToNextLevel * 0.5)} EXP\n_Costo: ${formatMoney(cost)}_`,
      "¡Mejora de Caña!",
      rod.name,
    );
  }

  if (sub === "daily" || sub === "diario") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    const now = new Date();
    if (f.lastDaily) {
      const diff = now.getTime() - new Date(f.lastDaily).getTime();
      if (diff < 86400000)
        return m.reply(
          `_¡Ya reclamaste tu recompensa diaria! Vuelve en *${Math.ceil((86400000 - diff) / 3600000)}* horas._`,
        );
    }
    const ld = f.lastDaily ? new Date(f.lastDaily) : null;
    f.dailyStreak =
      ld && now.getTime() - ld.getTime() < 172800000
        ? (f.dailyStreak || 0) + 1
        : 1;
    let rw = DAILY_REWARDS[0];
    for (const r of DAILY_REWARDS) {
      if (f.dailyStreak >= r.streak) rw = r;
    }
    f.money = (f.money || 0) + rw.money;
    f.gachaTickets = (f.gachaTickets || 0) + rw.tickets;
    f.lastDaily = now.toISOString();
    db.markDirty("users");
    return send(
      sock,
      m,
      `*¡RECOMPENSA DIARIA!*\n\n*Racha:* ${f.dailyStreak} días seguidos\n+${formatMoney(rw.money)}\n+${rw.tickets} Ticket(s) de Gacha\n*Saldo:* ${formatMoney(f.money)}`,
      "Recompensa Diaria",
      `Racha de ${f.dailyStreak} días`,
    );
  }

  if (sub === "gacha") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    const useT = sa[0] && sa[0].toLowerCase() === "ticket";
    if (useT) {
      if ((f.gachaTickets || 0) < 1)
        return m.reply(`_¡Te quedaste sin tickets! Tienes: ${f.gachaTickets || 0}_`);
      f.gachaTickets -= 1;
    } else {
      if ((f.money || 0) < GACHA_COST_COINS)
        return m.reply(`_¡Dinero insuficiente! Necesitas ${formatMoney(GACHA_COST_COINS)}_`);
      f.money -= GACHA_COST_COINS;
    }
    const result = doGachaPull(f);
    const item = result.item;
    let txt = `*¡RESULTADO DEL GACHA!*\n\n`;
    switch (item.type) {
      case "rod":
        if (fishingRod[item.value] && !f.fishingRods[item.value]) {
          f.fishingRods[item.value] = { ...fishingRod[item.value] };
          txt += `¡GANASTE UNA CAÑA!: *${item.label}*\n`;
        } else if (f.fishingRods[item.value]) {
          const ref = Math.floor(
            (fishingRod[item.value] ? fishingRod[item.value].price : 0) * 0.3 ||
              100000,
          );
          f.money = (f.money || 0) + ref;
          txt += `Duplicada: *${item.label}* _(Reembolso: +${formatMoney(ref)})_\n`;
        }
        break;
      case "tickets":
        f.gachaTickets = (f.gachaTickets || 0) + item.value;
        txt += `+${item.value} Ticket(s)\n`;
        break;
      case "tokens":
        f.prestigeTokens = (f.prestigeTokens || 0) + item.value;
        txt += `+${item.value} Ficha(s) (Tokens)\n`;
        break;
      case "coins":
        f.money = (f.money || 0) + item.value;
        txt += `+${formatMoney(item.value)}\n`;
        break;
      case "enchant_scroll":
        {
          const avail = Object.entries(rodEnchants).filter(
            ([, v]) => v.rarity === item.value,
          );
          if (avail.length > 0) {
            const [ek2, ed] = avail[Math.floor(Math.random() * avail.length)];
            const rk2 = f.usedFishingRod || "basicrod";
            if (f.fishingRods[rk2]) {
              f.fishingRods[rk2].enchant = ek2;
              txt += `Encantamiento: *${ed.name}* _(${item.value})_ transferido a tu caña activa.\n`;
            }
          }
        }
        break;
      case "xp_boost":
        f.exp = (f.exp || 0) + Math.floor(f.expToNextLevel * 0.5);
        txt += `¡Potenciador de XP x${item.value}!\n`;
        break;
      default:
        txt += `${item.label}\n`;
    }
    if (result.isSSR) txt += `\n*¡TIRO SSR DE LA SUERTE!*`;
    if (result.pity) txt += `\n*¡Sistema de Compasión (Pity) Activado!*`;
    txt += `\n\n_Contador Pity: ${f.gachaPity}/${GACHA_PITY_LIMIT}_\n_Tu Dinero: ${formatMoney(f.money)} | Tickets: ${f.gachaTickets}_`;
    db.markDirty("users");
    return send(sock, m, txt, "Gacha", result.isSSR ? "¡TIRO SSR EXCLUSIVO!" : "Resultado");
  }
  if (sub === "upgrade" || sub === "mejorar") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    const type = sa[0] ? sa[0].toLowerCase() : "";
    if (!type || !UPGRADES[type]) {
      let txt = `*TIENDA DE MEJORAS PERMANENTES*\n\n`;
      for (const [k, u] of Object.entries(UPGRADES)) {
        const lv = f[k + "Upgrade"] || 0;
        txt += `*${u.name}* _(Nivel ${lv}/${u.maxLevel})_\n  _${u.desc}_\n  ${lv >= u.maxLevel ? "_NIVEL MÁXIMO_" : `_Siguiente mejora: ${formatMoney(u.getCost(lv))}_`}\n\n`;
      }
      return send(
        sock,
        m,
        txt + `\`.fisht upgrade <luck/speed/sell>\``,
        "Tienda de Mejoras",
        "Aumenta tus estadísticas",
      );
    }
    const upg = UPGRADES[type];
    const lv = f[type + "Upgrade"] || 0;
    if (lv >= upg.maxLevel) return m.reply(`_¡Ya está al nivel máximo!_`);
    const cost = upg.getCost(lv);
    if ((f.money || 0) < cost)
      return m.reply(`_¡Dinero insuficiente! Necesitas ${formatMoney(cost)}_`);
    f.money -= cost;
    f[type + "Upgrade"] = lv + 1;
    db.markDirty("users");
    return send(
      sock,
      m,
      `*¡MEJORA DE ${upg.name.toUpperCase()} ADQUIRIDA!*\n\n_Nivel actual: ${lv + 1}_\n_Costo: ${formatMoney(cost)}_\n_${upg.desc}_`,
      "¡Estadísticas Mejoradas!",
      `${upg.name} Nivel ${lv + 1}`,
    );
  }

  if (sub === "prestige" || sub === "prestigio") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    const cp = f.prestige || 0;
    if (sa[0] && sa[0].toLowerCase() === "confirm") {
      const reqs = [
        { fish: 500, money: 1e10 },
        { fish: 1500, money: 1e12 },
        { fish: 4000, money: 1e14 },
        { fish: 10000, money: 1e19 },
        { fish: 25000, money: 1e22 },
      ];
      const req = reqs[cp];
      if (!req) return m.reply(`_¡Ya alcanzaste el nivel de prestigio máximo disponible!_`);
      if ((f.fishCaught || 0) < req.fish)
        return m.reply(`_¡Te faltan peces! Requiere un total de ${req.fish} peces atrapados._`);
      if ((f.money || 0) < req.money)
        return m.reply(`_¡Dinero insuficiente! Requiere un total de ${formatMoney(req.money)}_`);
      f.prestige = cp + 1;
      f.money = Math.floor(f.money * 0.1);
      f.fishCaught = 0;
      f.streak = 0;
      f.prestigeTokens =
        (f.prestigeTokens || 0) + [50, 150, 500, 1000, 5000][cp];
      const titles = [
        "Pescador Novato",
        "Veterano de las Aguas",
        "Maestro Pescador",
        "Leyenda Viviente",
        "Trascendental",
        "Dios de la Pesca",
      ];
      if (cp === 0 && !f.fishingRods.prestigerod)
        f.fishingRods.prestigerod = { ...fishingRod.prestigerod };
      if (cp === 2 && !f.fishingRods.cosmicrod)
        f.fishingRods.cosmicrod = { ...fishingRod.cosmicrod };
      db.markDirty("users");
      return send(
        sock,
        m,
        `*¡AVANCE DE PRESTIGIO!*\n\n*Título obtenido:* ${titles[f.prestige]}\n*Fichas (Tokens) ganadas:* ${f.prestigeTokens}\n\n_Nota: Se dedujo el 90% de tu dinero y se reinició el contador de peces._`,
        "¡PRESTIGIO!",
        titles[f.prestige],
      );
    }
    let txt = `*SISTEMA DE PRESTIGIO*\n\n*Tu Prestigio:* ${cp}\n*Fichas (Tokens):* ${f.prestigeTokens || 0}\n\n`;
    const allReqs = [
      { lv: 1, fish: 500, money: 1e10, rw: "Caña Prestige Rod + 50 tokens" },
      { lv: 2, fish: 1500, money: 1e12, rw: "Bono Suerte +20% + 150 tokens" },
      { lv: 3, fish: 4000, money: 1e14, rw: "Caña Cósmica Cosmic Rod + 500 tokens" },
      { lv: 4, fish: 10000, money: 1e19, rw: "Doble de Experiencia (2x EXP) + 1000 tokens" },
      { lv: 5, fish: 25000, money: 1e22, rw: "Caña Eterna Eternity Rod + 5000 tokens" },
    ];
    for (const r of allReqs)
      txt += `${cp >= r.lv ? "[COMPLETADO]" : "[BLOQUEADO]"} *P${r.lv}*: _${r.fish} peces | ${formatMoney(r.money)}_\n  _Premio: ${r.rw}_\n\n`;
    return send(
      sock,
      m,
      txt + `\`.fisht prestige confirm\` _(¡Atención! Esta acción no se puede deshacer)_`,
      "Prestigio",
      `Rango P${cp}`,
    );
  }

  if (sub === "tokens" || sub === "fichas") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    if (!sa[0]) {
      let txt = `*TIENDA DE TOKENS DE PRESTIGIO*\n\n*Tus Fichas:* ${f.prestigeTokens || 0}\n\n`;
      for (const item of TOKEN_SHOP)
        txt += `*${item.name}* _Costo: ${item.cost} fichas_\n`;
      return send(
        sock,
        m,
        txt + `\n\`.fisht tokens <id_item>\``,
        "Tienda de Fichas",
        `${f.prestigeTokens || 0} fichas`,
      );
    }
    const iid = sa[0].toLowerCase();
    const item = TOKEN_SHOP.find((i) => i.id === iid);
    if (!item) return m.reply(`_¡Ese artículo no existe en la tienda!_ Revisa las opciones con \`.fisht tokens\``);
    if ((f.prestigeTokens || 0) < item.cost)
      return m.reply(`_¡Fichas insuficientes! Necesitas un total de ${item.cost}_`);
    f.prestigeTokens -= item.cost;
    switch (item.type) {
      case "rod":
        if (fishingRod[item.value] && !f.fishingRods[item.value]) {
          f.fishingRods[item.value] = { ...fishingRod[item.value] };
        } else {
          f.prestigeTokens += item.cost;
          return m.reply(`_¡Ya eres dueño de esta caña de pescar!_`);
        }
        break;
      case "tickets":
        f.gachaTickets = (f.gachaTickets || 0) + item.value;
        break;
      case "coins":
        f.money = (f.money || 0) + item.value;
        break;
    }
    db.markDirty("users");
    return send(
      sock,
      m,
      `*¡COMPRA COMPLETADA!*\n\n*${item.name}* _adquirido por ${item.cost} fichas_`,
      "Canje de Fichas",
      item.name,
    );
  }

  if (sub === "jackpot") {
    const user = getOrCreateFischUser(db, m.sender);
    const f = user.fisch;
    if (!sa[0]) {
      let txt = `*SISTEMA DE JACKPOT (PREMIO MAYOR)*\n\n_¡Un sistema arriesgado con recompensas colosales!_\n_Puedes ganar estatus Premium, Partner, Energía, Límites extendidos o incluso beneficios ILIMITADOS en el bot_\n\n`;
      for (const pool of JACKPOT_POOLS) {
        txt += `*${pool.name}*\n  _Precio por tiro: ${formatMoney(pool.cost)}_\n  _Probabilidad base: ${pool.weight}%_\n  _Recompensas posibles:_\n`;
        for (const rw of pool.rewards) {
          const label =
            {
              coins: "Monedas",
              energi: "Energía",
              limit: "Límite",
              tickets: "Tickets de Gacha",
              tokens: "Fichas de Prestigio",
              exp_boost: "Potenciador EXP",
              premium_7d: "Premium 7 Días",
              premium_30d: "Premium 30 Días",
              partner_7d: "Socio (Partner) 7 Días",
              partner_30d: "Socio (Partner) 30 Días",
              unlimited_energi: "Energía ILIMITADA",
              unlimited_limit: "Límite ILIMITADO",
            }[rw.type] || rw.type;
          txt += `     _${label}: ${rw.min === rw.max ? rw.min : `${rw.min}-${rw.max}`} (${rw.weight}%)_\n`;
        }
        txt += `\n`;
      }
      return send(
        sock,
        m,
        txt + `\n\`.fisht jackpot <mini/mega/ultra/legend>\``,
        "Jackpot",
        "Grandes Premios",
      );
    }
    const poolId = sa[0].toLowerCase();
    const pool = JACKPOT_POOLS.find((p) => p.id === poolId);
    if (!pool) return m.reply(`_¡Ese nivel de pozo no existe!_ Elige de la lista con \`.fisht jackpot\``);
    if ((f.money || 0) < pool.cost)
      return m.reply(`_¡Dinero insuficiente! Necesitas ${formatMoney(pool.cost)}_`);
    f.money -= pool.cost;
    const result = doJackpotPull(f, poolId);
    if (!result) return m.reply(`_¡Error en la tirada! Inténtalo de nuevo._`);
    const applied = applyJackpotReward(db, f, m.sender, result);
    db.markDirty("users");
    let txt = `*¡POZO ${pool.name.toUpperCase()}!*\n\n`;
    const isBig = [
      "premium_7d",
      "premium_30d",
      "partner_7d",
      "partner_30d",
      "unlimited_energi",
      "unlimited_limit",
    ].includes(result.reward.type);
    if (isBig) txt += `*¡RECOMPENSA MAYOR DE JACKPOT!* 🥳🎉\n\n`;
    txt += `${applied.desc}\n\n_Costo del tiro: ${formatMoney(pool.cost)}_\n_Tu saldo actual: ${formatMoney(f.money)}_`;
    return send(
      sock,
      m,
      txt,
      isBig ? "¡PREMIO MAYOR!" : pool.name,
      applied.desc,
    );
  }

  if (sub === "top" || sub === "leaderboard") {
    const users = db.db.data.users || {};
    const rankings = [];
    for (const [jid, ud] of Object.entries(users)) {
      if (ud.fisch)
        rankings.push({
          jid,
          fishCaught: ud.fisch.fishCaught || 0,
          money: ud.fisch.money || 0,
          level: ud.fisch.level || 1,
          prestige: ud.fisch.prestige || 0,
        });
    }
    if (rankings.length === 0) return m.reply(`_¡Aún no hay ningún jugador registrado!_`);
    rankings.sort((a, b) => {
      if (b.prestige !== a.prestige) return b.prestige - a.prestige;
      if (b.fishCaught !== a.fishCaught) return b.fishCaught - a.fishCaught;
      return b.money - a.money;
    });
    let txt = `*TABLA DE CLASIFICACIÓN (FISHIT)*\n\n`;
    const top = rankings.slice(0, 10);
    for (let i = 0; i < top.length; i++) {
      const p = top[i];
      const medal =
        i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;
      txt += `${medal} @${p.jid}\n  _Prestigio: P${p.prestige} | ${p.fishCaught} peces | Saldo: ${formatMoney(p.money)}_\n`;
    }
    return send(sock, m, txt.trim(), "Tabla de Clasificación", "Top Jugadores");
  }
}

export { pluginConfig as config, handler };
