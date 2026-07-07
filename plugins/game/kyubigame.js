import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
    name: "kyubigame",
    alias: ["kyubi", "naruto", "shinobi", "juegokyubi"],
    category: "game",
    description: "Explora el mundo shinobi y enfréntate a los enemigos ninja más poderosos",
    usage: ".kyubigame",
    example: ".kyubigame",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true,
};

const LOCATIONS = [
    {
        id: 1,
        name: "🍃 Aldea de la Hoja (Konoha)",
        levelReq: 1,
        monsters: [
            "Genin Principiante",
            "Bandido Salvaje",
            "Lobo del Bosque",
            "Ninja Espía",
        ],
        minReward: 100,
        maxReward: 300,
        dropChance: 40,
    },
    {
        id: 2,
        name: "🌳 Bosque de la Muerte",
        levelReq: 5,
        monsters: [
            "Ninja de Otogakure",
            "Tigre Gigante",
            "Ciempiés Venenoso",
            "Serpiente de Orochimaru",
        ],
        minReward: 250,
        maxReward: 500,
        dropChance: 45,
    },
    {
        id: 3,
        name: "☁️ Campo de Relámpagos",
        levelReq: 10,
        monsters: [
            "Ninja de Kumo",
            "Samurái de Hierro",
            "Búho de Rayo",
            "Lobo Eléctrico",
        ],
        minReward: 400,
        maxReward: 800,
        dropChance: 50,
    },
    {
        id: 4,
        name: "🦇 Cueva de Akatsuki",
        levelReq: 15,
        monsters: [
            "Clon de Zetsu Blanco",
            "Murciélago Venenoso",
            "Marioneta de Sasori",
            "Ninja Renegado",
        ],
        minReward: 600,
        maxReward: 1200,
        dropChance: 55,
    },
    {
        id: 5,
        name: "🌊 Valle del Fin",
        levelReq: 25,
        monsters: [
            "Ninja Asesino",
            "Clon del Mizukage",
            "Fantasma Uchiha",
            "Estatua de Gólem",
        ],
        minReward: 900,
        maxReward: 1700,
        dropChance: 60,
    },
    {
        id: 6,
        name: "💥 Campo de Guerra Shinobi",
        levelReq: 35,
        monsters: [
            "Zetsu Gigante",
            "Kage Edo Tensei",
            "Shinobi No-Muerto",
            "Ejército de Clones",
        ],
        minReward: 1300,
        maxReward: 2400,
        dropChance: 65,
    },
    {
        id: 7,
        name: "🦊 Jaula de Kurama",
        levelReq: 50,
        monsters: [
            "Chakra del Nueve Colas",
            "Kyubi Salvaje",
            "Kurama Oscuro",
            "Espíritu Bijuu",
        ],
        minReward: 2500,
        maxReward: 4500,
        dropChance: 75,
    }
];

const LOOT_TABLE = [
    { item: "kunai", chance: 40, qty: [2, 5], icon: "🗡️" },
    { item: "shuriken", chance: 35, qty: [3, 6], icon: "⚔️" },
    { item: "chakra", chance: 30, qty: [1, 3], icon: "🌀" },
    { item: "pergamino", chance: 15, qty: [1, 2], icon: "📜" },
    { item: "tazonramen", chance: 20, qty: [1, 2], icon: "🍜" },
];

async function handler(m, { sock }) {
    try {
        const db = getDatabase();
        const user = db.getUser(m.sender);

        if (!user.rpg) user.rpg = {};
        if (!user.rpg.attack) user.rpg.attack = 10;
        if (!user.rpg.health) user.rpg.health = 100;
        if (!user.rpg.maxHealth) user.rpg.maxHealth = 100;
        if (!user.rpg.stamina) user.rpg.stamina = 100;
        if (!user.rpg.maxStamina) user.rpg.maxStamina = 100;
        if (!user.inventory) user.inventory = {};

        const session = user.rpg.kyubigame_session || null;
        const userLevel = user.level || 1;

        if (session) {
            const SESSION_TIMEOUT = 5 * 60 * 1000;
            if (Date.now() - session.time > SESSION_TIMEOUT) {
                delete user.rpg.kyubigame_session;
                db.save();
            } else {
                return m.reply(
                    `⚔️ *MISIÓN SHINOBI AÚN ACTIVA*\n\n` +
                    `¡Todavía te encuentras en el campo de batalla!\n` +
                    `> Responde al último mensaje del bot con (\`atacar\` / \`huir\`) o cancela la misión escribiendo (\`cancelar\`).`,
                );
            }
        }

        const available = LOCATIONS.filter((d) => userLevel >= d.levelReq);
        if (available.length === 0) {
            return m.reply(
                `❌ *NIVEL DEMASIADO BAJO*\n\n> Tu nivel actual es *${userLevel}*. Necesitas al menos nivel *1* para comenzar tu aventura shinobi.`,
            );
        }

        user.rpg.kyubigame_session = {
            stage: "lobi",
            time: Date.now(),
        };
        db.save();

        let txt = `⛩️ *VESTÍBULO SHINOBI*\n\n`;
        txt += `📊 *Estadísticas Shinobi:*\n`;
        txt += `> Nivel: *${userLevel}*\n`;
        txt += `> Estamina: *${user.rpg.stamina ?? 100}/100*` + `\n\n`;
        txt += `Selecciona la ubicación de la misión que deseas explorar:\n\n`;

        for (const d of LOCATIONS) {
            if (userLevel >= d.levelReq) {
                txt += `🔓 *${d.id}.* ${d.name} (Lv ${d.levelReq}+)\n`;
            } else {
                txt += `> 🔒 *${d.id}.* ${d.name} (Requiere Lv ${d.levelReq})\n`;
            }
        }
        txt += `\n> 💡 Responde a este mensaje con el *número* de la ubicación (ejemplo: \`1\`) o escribe \`cancelar\` para salir.`;

        return m.reply(txt);
    } catch (error) {
        console.error(error);
        m.reply(te(m.prefix, m.command, m.pushName));
    }
}

async function kyubigameAnswerHandler(m, sock) {
    if (!m.body || m.isCommand) return false;

    const db = getDatabase();
    const user = db.getUser(m.sender);

    if (!user || !user.rpg || !user.rpg.kyubigame_session) return false;

    const session = user.rpg.kyubigame_session;
    const SESSION_TIMEOUT = 5 * 60 * 1000;
    if (Date.now() - session.time > SESSION_TIMEOUT) {
        delete user.rpg.kyubigame_session;
        db.save();
        await m.reply(
            `⏰ *MISIÓN EXPIRADA*\n\n> Tu sesión de misión shinobi ha expirado por inactividad de 5 minutos.`,
        );
        return true;
    }

    const text = m.body.trim().toLowerCase();
    const userLevel = user.level || 1;

    if (text === "batal" || text === "cancel" || text === "keluar" || text === "cancelar" || text === "salir") {
        delete user.rpg.kyubigame_session;
        db.save();
        await m.reply(`🚪 Has cancelado la misión con éxito y regresaste a la aldea a salvo.`);
        return true;
    }

    if (session.stage === "lobi") {
        const choiceId = parseInt(text);
        if (isNaN(choiceId)) return false;

        const location = LOCATIONS.find((d) => d.id === choiceId);

        if (!location) {
            await m.reply(
                `❌ *UBICACIÓN INVÁLIDA*\n\n> La ubicación número ${choiceId} no existe en el mapa shinobi.`,
            );
            return true;
        }

        if (userLevel < location.levelReq) {
            await m.reply(
                `🔒 *MISIÓN BLOQUEADA*\n\n> Tu nivel (*Lv ${userLevel}*) no es suficiente para ingresar a *${location.name}*.\n> Necesitas al menos *Lv ${location.levelReq}*.`,
            );
            return true;
        }

        const staminaCost = 30;
        user.rpg.stamina = user.rpg.stamina ?? 100;

        if (user.rpg.stamina < staminaCost) {
            await m.reply(
                `⚡ *CHAKRA/ESTAMINA INSUFICIENTE*\n\n` +
                `Necesitas al menos *${staminaCost} de estamina* para ingresar.\n` +
                `Tu estamina restante actual es de solo *${user.rpg.stamina}*.\n\n` +
                `> 💡 *Consejo:* Usa el comando \`.rest\` (descansar) o cancela la sesión actual escribiendo (\`cancelar\`).`,
            );
            return true;
        }

        user.rpg.stamina -= staminaCost;
        const monster =
            location.monsters[Math.floor(Math.random() * location.monsters.length)];
        const monsterPower = location.levelReq * 10 + Math.floor(Math.random() * 30);

        user.rpg.kyubigame_session = {
            stage: "encounter",
            locationId: location.id,
            locationName: location.name,
            levelReq: location.levelReq,
            monster: monster,
            monsterPower: monsterPower,
            maxReward: location.maxReward,
            minReward: location.minReward,
            dropChance: location.dropChance,
            time: Date.now(),
        };

        db.save();

        await m.react("⛩️");
        let txt = `⛩️ *INGRESANDO AL ÁREA DE LA MISIÓN*\n\n`;
        txt += `Te desplazas sigilosamente a través de *${location.name}*...\n`;
        txt += `> ⚡ Estamina reducida: *-${staminaCost}*\n\n`;
        txt += `¡De repente, un *👹 ${monster}* emerge de las sombras bloqueando tu camino!\n\n`;
        txt += `*⚔️ ¿QUÉ DESEAS HACER?*\n`;
        txt += `> Responde a este mensaje con \`atacar\` para luchar.\n`;
        txt += `> Responde a este mensaje con \`huir\` para retirarte (con riesgo).`;

        await m.reply(txt);
        return true;
    }

    if (session.stage === "encounter") {
        if (text === "serang" || text === "attack" || text === "lawan" || text === "atacar" || text === "luchar") {
            const userPower =
                (user.rpg.attack || 10) +
                userLevel * 4 +
                Math.floor(Math.random() * 20);
            const isWin = userPower >= session.monsterPower || Math.random() > 0.4;

            let reportText = "";

            if (isWin) {
                const expReward =
                    150 * (session.levelReq / 2) + Math.floor(Math.random() * 200);
                const ryoReward =
                    Math.floor(Math.random() * (session.maxReward - session.minReward)) +
                    session.minReward;

                const droppedItems = [];
                for (const loot of LOOT_TABLE) {
                    if (Math.random() * 100 < loot.chance * (session.dropChance / 50)) {
                        const qty =
                            Math.floor(Math.random() * (loot.qty[1] - loot.qty[0] + 1)) +
                            loot.qty[0];
                        user.inventory[loot.item] = (user.inventory[loot.item] || 0) + qty;
                        droppedItems.push(`${loot.icon} ${loot.item} (x${qty})`);
                    }
                }

                user.koin = (user.koin || 0) + ryoReward;
                await addExpWithLevelCheck(sock, m, db, user, expReward);

                reportText += `🎉 *¡MISIÓN COMPLETADA CON ÉXITO!*\n\n`;
                reportText += `¡Utilizando un jutsu letal, lograste derrotar a *${session.monster}*!\n\n`;
                reportText += `*🎁 RECOMPENSAS DE LA MISIÓN:*\n`;
                reportText += `> ✨ EXP: *+${Math.floor(expReward)}*\n`;
                reportText += `> 💰 Ryo (Monedas): *+${ryoReward.toLocaleString()}*\n`;

                if (droppedItems.length > 0) {
                    reportText += `\n*📦 BOTÍN SHINOBI OBTENIDO:*\n`;
                    reportText += `> ${droppedItems.join("\n> ")}\n`;
                }

                await m.react("🏆");
            } else {
                const ryoLoss = Math.floor((user.koin || 0) * 0.15);
                user.koin = Math.max(0, (user.koin || 0) - ryoLoss);
                user.rpg.health = Math.max(1, (user.rpg.health || 100) - 40);

                reportText += `💀 *¡MISIÓN FALLIDA!*\n\n`;
                reportText += `¡Tu fuerza no fue suficiente! *${session.monster}* te superó por completo.\n`;
                reportText += `Lograste utilizar un jutsu de sustitución para escapar a rastras, gravemente herido.\n\n`;
                reportText += `*💔 PÉRDIDAS:*\n`;
                reportText += `> 💸 Ryo perdido: *-${ryoLoss.toLocaleString()} Ryo*\n`;
                reportText += `> ❤️ Vida reducida: *-40 HP*\n\n`;
                reportText += `> 💡 *Consejo:* ¡Sube de nivel, come ramen o fortalece tus jutsus!`;

                await m.react("💀");
            }

            delete user.rpg.kyubigame_session;
            db.save();
            await m.reply(reportText);
            return true;
        } else if (text === "lari" || text === "kabur" || text === "run" || text === "huir" || text === "escapar") {
            const escapeChance = Math.random() > 0.5;
            let reportText = "";

            if (escapeChance) {
                reportText += `🏃‍♂️ *¡LOGRASTE ESCAPAR!*\n\n`;
                reportText += `Lanzaste una bomba de humo y corriste con todas tus fuerzas. ¡*${session.monster}* perdió tu rastro!\n`;
                reportText += `Regresas a salvo y sin heridas, pero esta expedición fue en vano.`;
                await m.react("💨");
            } else {
                const hpLoss = 25;
                user.rpg.health = Math.max(1, (user.rpg.health || 100) - hpLoss);
                reportText += `💥 *¡FALLASTE AL ESCAPAR!*\n\n`;
                reportText += `¡Tropezaste con una trampa ninja! ¡*${session.monster}* te alcanzó y te propinó un fuerte golpe en el cuerpo!\n\n`;
                reportText += `*💔 PÉRDIDAS:*\n`;
                reportText += `> ❤️ Vida reducida: *-${hpLoss} HP*`;
                await m.react("🩸");
            }

            delete user.rpg.kyubigame_session;
            db.save();
            await m.reply(reportText);
            return true;
        } else {
            await m.reply(
                `❓ *COMANDO DESCONOCIDO*\n\n` +
                `> Responde con \`atacar\` para enfrentarte al enemigo.\n` +
                `> Responde con \`huir\` para intentar escapar.\n` +
                `> Responde con \`cancelar\` si deseas abortar la misión por completo.`,
            );
            return true;
        }
    }

    return false;
}

export { pluginConfig as config, handler, kyubigameAnswerHandler };
