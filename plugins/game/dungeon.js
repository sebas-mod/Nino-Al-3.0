import { getDatabase } from "../../src/lib/ourin-database.js";
import { addExpWithLevelCheck } from "../../src/lib/ourin-level.js";
import te from "../../src/lib/ourin-error.js";

const pluginConfig = {
    name: "dungeon",
    alias: ["dg", "explore", "labirin", "mazmorra"],
    category: "game",
    description: "Explora mazmorras y enfréntate a monstruos de forma interactiva",
    usage: ".dungeon",
    example: ".dungeon",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true,
};

const DUNGEONS = [
    {
        id: 1,
        name: "🌲 Bosque Oscuro",
        levelReq: 1,
        monsters: [
            "Goblin Salvaje",
            "Slime Gigante",
            "Lobo Nocturno",
            "Bandido del Bosque",
        ],
        minReward: 100,
        maxReward: 300,
        dropChance: 40,
    },
    {
        id: 2,
        name: "🍄 Pantano Venenoso",
        levelReq: 5,
        monsters: [
            "Rana Mutante",
            "Árbol Viviente",
            "Araña Venenosa",
            "Víbora del Pantano",
        ],
        minReward: 250,
        maxReward: 500,
        dropChance: 45,
    },
    {
        id: 3,
        name: "🏰 Castillo Viejo",
        levelReq: 10,
        monsters: [
            "Guerrero Esqueleto",
            "Zombi Hambriento",
            "Alma en Pena",
            "Gárgola de Piedra",
        ],
        minReward: 400,
        maxReward: 800,
        dropChance: 50,
    },
    {
        id: 4,
        name: "🏜️ Desierto de la Muerte",
        levelReq: 15,
        monsters: [
            "Escorpión Gigante",
            "Momia Viviente",
            "Gusano de Arena",
            "Genio Maligno",
        ],
        minReward: 600,
        maxReward: 1200,
        dropChance: 55,
    },
    {
        id: 5,
        name: "🌋 Volcán Activo",
        levelReq: 20,
        monsters: ["Elemental de Fuego", "Golem de Magma", "Dragón Joven", "Sabueso del Infierno"],
        minReward: 900,
        maxReward: 1700,
        dropChance: 60,
    },
    {
        id: 6,
        name: "🧊 Cueva de Hielo Eterno",
        levelReq: 25,
        monsters: ["Golem de Hielo", "Gigante de Escarcha", "Yeti Feroz", "Lobo de las Nieves"],
        minReward: 1300,
        maxReward: 2400,
        dropChance: 65,
    },
    {
        id: 7,
        name: "☁️ Ruinas del Cielo",
        levelReq: 30,
        monsters: ["Arpía de Tormenta", "Grifo Salvaje", "Valquiria Caída", "Golem de Viento"],
        minReward: 1800,
        maxReward: 3300,
        dropChance: 70,
    },
    {
        id: 8,
        name: "🌊 Océano de las Sombras",
        levelReq: 35,
        monsters: ["Cría de Kraken", "Sirena Cautivadora", "Tiburón Fantasma", "Leviatán Carmesí"],
        minReward: 2500,
        maxReward: 4500,
        dropChance: 75,
    },
    {
        id: 9,
        name: "🕳️ Abismo de la Nada",
        levelReq: 40,
        monsters: ["Ángel de la Muerte", "Caminante del Vacío", "Fiend de las Sombras", "Bégimo"],
        minReward: 3500,
        maxReward: 6000,
        dropChance: 80,
    },
    {
        id: 10,
        name: "👹 Inframundo Profundo",
        levelReq: 50,
        monsters: ["Demonio Rojo", "Súcubo Letal", "Cerbero", "Rey Demonio"],
        minReward: 5000,
        maxReward: 10000,
        dropChance: 90,
    },
];

const LOOT_TABLE = [
    { item: "hierro", chance: 40, qty: [1, 5], icon: "⛏️" },
    { item: "oro", chance: 20, qty: [1, 3], icon: "🪙" },
    { item: "diamante", chance: 5, qty: [1, 2], icon: "💎" },
    { item: "pocion", chance: 30, qty: [1, 3], icon: "🧪" },
    { item: "hierba", chance: 25, qty: [2, 6], icon: "🌿" },
    { item: "cuero", chance: 35, qty: [2, 5], icon: "👞" },
    { item: "cajamisteriosa", chance: 3, qty: [1, 1], icon: "📦" },
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

        const session = user.rpg.dungeon_session || null;
        const userLevel = user.level || 1;

        if (session) {
            const SESSION_TIMEOUT = 5 * 60 * 1000;
            if (Date.now() - session.time > SESSION_TIMEOUT) {
                delete user.rpg.dungeon_session;
                db.save();
            } else {
                return m.reply(
                    `⚔️ *SESIÓN DE MAZMORRA ACTIVA*\n\n` +
                    `¡Ya te encuentras en medio de una exploración!\n` +
                    `> Responde al último mensaje del bot para cancelar (escribe \`batal\`) o continuar con la acción (escribe \`serang\` / \`lari\`).`,
                );
            }
        }

        const available = DUNGEONS.filter((d) => userLevel >= d.levelReq);
        if (available.length === 0) {
            return m.reply(
                `❌ *NIVEL DEMASIADO BAJO*\n\n> Tu nivel actual es *${userLevel}*. Necesitas al menos nivel *1* para entrar a la mazmorra más fácil.`,
            );
        }

        user.rpg.dungeon_session = {
            stage: "lobi",
            time: Date.now(),
        };
        db.save();

        let txt = `🏰 *LOBBY DE LA MAZMORRA*\n\n`;
        txt += `📊 *Tus Estadísticas:*\n`;
        txt += `> Nivel: *${userLevel}*\n`;
        txt += `> Estamina: *${user.rpg.stamina ?? 100}/100*\n\n`;
        txt += `Elige la ubicación que deseas explorar:\n\n`;

        for (const d of DUNGEONS) {
            if (userLevel >= d.levelReq) {
                txt += `🔓 *${d.id}.* ${d.name} (Nivel ${d.levelReq}+)\n`;
            } else {
                txt += `> 🔒 *${d.id}.* ${d.name} (Requiere Nivel ${d.levelReq})\n`;
            }
        }
        txt += `\n> 💡 Responde a este mensaje con el *número* de la ubicación desbloqueada 🔓 (ejemplo: \`1\`) o escribe \`batal\` para salir.`;

        return m.reply(txt);
    } catch (error) {
        console.error(error);
        m.reply(te(m.prefix, m.command, m.pushName));
    }
}

async function dungeonAnswerHandler(m, sock) {
    if (!m.body || m.isCommand) return false;

    const db = getDatabase();
    const user = db.getUser(m.sender);

    if (!user || !user.rpg || !user.rpg.dungeon_session) return false;

    const session = user.rpg.dungeon_session;
    const SESSION_TIMEOUT = 5 * 60 * 1000;
    if (Date.now() - session.time > SESSION_TIMEOUT) {
        delete user.rpg.dungeon_session;
        db.save();
        await m.reply(
            `⏰ *SESIÓN DE MAZMORRA EXPIRADA*\n\n> Tu sesión ha caducado por inactividad durante más de 5 minutos.`,
        );
        return true;
    }

    const text = m.body.trim().toLowerCase();
    const userLevel = user.level || 1;

    if (text === "batal" || text === "cancel" || text === "keluar" || text === "cancelar" || text === "salir") {
        delete user.rpg.dungeon_session;
        db.save();
        await m.reply(`🚪 Has salido con éxito y a salvo del Lobby de la Mazmorra.`);
        return true;
    }

    if (session.stage === "lobi") {
        const choiceId = parseInt(text);
        if (isNaN(choiceId)) return false;

        const dungeon = DUNGEONS.find((d) => d.id === choiceId);

        if (!dungeon) {
            await m.reply(
                `❌ *OPCIÓN NO VÁLIDA*\n\n> No se encontró la mazmorra número ${choiceId}.`,
            );
            return true;
        }

        if (userLevel < dungeon.levelReq) {
            await m.reply(
                `🔒 *MAZMORRA BLOQUEADA*\n\n> Tu nivel (*Nivel ${userLevel}*) no es suficiente para entrar a *${dungeon.name}*.\n> Necesitas al menos *Nivel ${dungeon.levelReq}*.`,
            );
            return true;
        }

        const staminaCost = 30;
        user.rpg.stamina = user.rpg.stamina ?? 100;

        if (user.rpg.stamina < staminaCost) {
            await m.reply(
                `⚡ *ESTAMINA INSUFICIENTE*\n\n` +
                `Necesitas al menos *${staminaCost} de estamina* para ingresar.\n` +
                `Tu estamina actual es de solo *${user.rpg.stamina}*.\n\n` +
                `> 💡 *Consejo:* Usa el comando \`.rest\` o cancela la sesión (escribe \`batal\`).`,
            );
            return true;
        }

        user.rpg.stamina -= staminaCost;
        const monster =
            dungeon.monsters[Math.floor(Math.random() * dungeon.monsters.length)];
        const monsterPower = dungeon.levelReq * 10 + Math.floor(Math.random() * 30);

        user.rpg.dungeon_session = {
            stage: "encounter",
            dungeonId: dungeon.id,
            dungeonName: dungeon.name,
            levelReq: dungeon.levelReq,
            monster: monster,
            monsterPower: monsterPower,
            maxReward: dungeon.maxReward,
            minReward: dungeon.minReward,
            dropChance: dungeon.dropChance,
            time: Date.now(),
        };

        db.save();

        await m.react("🚪");
        let txt = `🚪 *ENTRANDO A LA MAZMORRA*\n\n`;
        txt += `Te adentras lentamente en las profundidades de *${dungeon.name}*...\n`;
        txt += `> ⚡ Estamina reducida: *-${staminaCost}*\n\n`;
        txt += `¡De repente, un *👹 ${monster}* emerge de las sombras bloqueando tu camino!\n\n`;
        txt += `*⚔️ ¿QUÉ DESEAS HACER?*\n`;
        txt += `> Responde a este mensaje con \`serang\` para atacar y luchar\n`;
        txt += `> Responde a este mensaje con \`lari\` para escapar (arriesgado)`;

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
                const goldReward =
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

                user.koin = (user.koin || 0) + goldReward;
                await addExpWithLevelCheck(sock, m, db, user, expReward);

                reportText += `🎉 *¡VICTORIA GLORIOSA!*\n\n`;
                reportText += `¡Con un ataque letal, has derrotado a *${session.monster}*!\n\n`;
                reportText += `*🎁 RECOMPENSAS OBTENIDAS:*\n`;
                reportText += `> ✨ EXP: *+${Math.floor(expReward)}*\n`;
                reportText += `> 💰 Monedas: *+${goldReward.toLocaleString()}*\n`;

                if (droppedItems.length > 0) {
                    reportText += `\n*📦 BOTÍN ENCONTRADO (LOOT):*\n`;
                    reportText += `> ${droppedItems.join("\n> ")}\n`;
                }

                await m.react("🏆");
            } else {
                const goldLoss = Math.floor((user.koin || 0) * 0.15);
                user.koin = Math.max(0, (user.koin || 0) - goldLoss);
                user.rpg.health = Math.max(1, (user.rpg.health || 100) - 40);

                reportText += `💀 *¡DERROTA TRÁGICA!*\n\n`;
                reportText += `¡Tu poder aún no es suficiente! El *${session.monster}* te ha asestado un golpe crítico implacable.\n`;
                reportText += `Lograste salir arrastrándote de la mazmorra con el cuerpo lleno de heridas.\n\n`;
                reportText += `*💔 PÉRDIDAS:*\n`;
                reportText += `> 💸 Dinero perdido: *-${goldLoss.toLocaleString()} Monedas*\n`;
                reportText += `> ❤️ Vida reducida: *-40 HP*\n\n`;
                reportText += `> 💡 *Consejo:* ¡Sube de nivel, consume pociones o mejora tu equipamiento!`;

                await m.react("💀");
            }

            delete user.rpg.dungeon_session;
            db.save();
            await m.reply(reportText);
            return true;
        } else if (text === "lari" || text === "kabur" || text === "run" || text === "escapar" || text === "huir") {
            const escapeChance = Math.random() > 0.5;
            let reportText = "";

            if (escapeChance) {
                reportText += `🏃‍♂️ *¡LOGRASTE ESCAPAR!*\n\n`;
                reportText += `Te diste la vuelta y corriste con todas tus fuerzas. ¡El *${session.monster}* te perdió el rastro!\n`;
                reportText += `Has salido a salvo y sin un rasguño, pero esta incursión fue en vano.`;
                await m.react("💨");
            } else {
                const hpLoss = 25;
                user.rpg.health = Math.max(1, (user.rpg.health || 100) - hpLoss);
                reportText += `💥 *¡FALLASTE AL ESCAPAR!*\n\n`;
                reportText += `¡Tropezaste con unas rocas! ¡El *${session.monster}* te alcanzó y descargó sus garras sobre ti!\n\n`;
                reportText += `*💔 DAÑO RECIBIDO:*\n`;
                reportText += `> ❤️ Vida reducida: *-${hpLoss} HP*`;
                await m.react("🩸");
            }

            delete user.rpg.dungeon_session;
            db.save();
            await m.reply(reportText);
            return true;
        } else {
            await m.reply(
                `❓ *OPCIÓN NO RECONOCIDA*\n\n` +
                `> Responde con \`serang\` para atacar al monstruo.\n` +
                `> Responde con \`lari\` para escapar.\n` +
                `> Responde con \`batal\` si deseas rendirte por completo.`,
            );
            return true;
        }
    }

    return false;
}

export { pluginConfig as config, handler, dungeonAnswerHandler };
