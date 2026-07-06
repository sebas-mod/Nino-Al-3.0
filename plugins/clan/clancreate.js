import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'clancreate',
    alias: ['createclan', 'guildcreate', 'crearclan'],
    category: 'clan',
    description: 'Crea un clan nuevo',
    usage: '.clancreate <nombre>',
    example: '.clancreate DragonSlayer',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

const CLAN_CREATE_COST = 50000
const MAX_CLAN_NAME = 20
const CLAN_EMBLEMS = ['🐉', '🦅', '🐺', '🦁', '🔥', '⚡', '🌙', '☀️', '💎', '🗡️']

function generateShortId(name, existingClans) {
    const clean = name.replace(/[^a-zA-Z]/g, '').toUpperCase()
    let id = clean.length >= 3 ? clean.slice(0, 3) : clean.padEnd(3, 'X')
    if (!existingClans[id]) return id
    id = clean.slice(0, 4) || id
    if (!existingClans[id]) return id
    for (let i = 1; i <= 99; i++) {
        const attempt = clean.slice(0, 3) + i
        if (!existingClans[attempt]) return attempt
    }
    return clean.slice(0, 2) + Math.random().toString(36).slice(2, 5).toUpperCase()
}

async function handler(m) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    const clanName = m.text?.trim()

    if (!clanName) {
        return m.reply(
            `⚔️ *CREAR CLAN*\n\n` +
            `¡Crea un clan y reúne a tus miembros!\n\n` +
            `Costo: *${CLAN_CREATE_COST.toLocaleString('es-ES')} monedas*\n` +
            `Máx. nombre: *${MAX_CLAN_NAME} caracteres*\n\n` +
            `Ejemplo: *.clancreate DragonSlayer*`
        )
    }

    if (clanName.length > MAX_CLAN_NAME) {
        return m.reply(`❌ El nombre del clan no puede superar los ${MAX_CLAN_NAME} caracteres.`)
    }

    if (!/^[a-zA-Z0-9\s]+$/.test(clanName)) {
        return m.reply(`❌ El nombre del clan solo puede contener letras, números y espacios.`)
    }

    if (!db.db.data.clans) db.db.data.clans = {}

    if (user.clanId) {
        return m.reply(`❌ Ya perteneces a un clan.\nSal primero usando: *.clanleave*`)
    }

    const existingClan = Object.values(db.db.data.clans).find(c => c.name.toLowerCase() === clanName.toLowerCase())
    if (existingClan) {
        return m.reply(`❌ El nombre *${clanName}* ya está en uso.`)
    }

    if ((user.koin || 0) < CLAN_CREATE_COST) {
        return m.reply(
            `❌ Monedas insuficientes\n\n` +
            `Necesitas: *${CLAN_CREATE_COST.toLocaleString('es-ES')}*\n` +
            `Tienes: *${(user.koin || 0).toLocaleString('es-ES')}*`
        )
    }

    const emblem = CLAN_EMBLEMS[Math.floor(Math.random() * CLAN_EMBLEMS.length)]
    const clanId = generateShortId(clanName, db.db.data.clans)
    const clan = {
        id: clanId,
        name: clanName,
        emblem,
        leader: m.sender,
        members: [m.sender],
        exp: 0,
        level: 1,
        wins: 0,
        losses: 0,
        createdAt: new Date().toISOString(),
        description: 'Sin descripción aún',
        isOpen: true
    }

    db.db.data.clans[clanId] = clan
    db.updateKoin(m.sender, -CLAN_CREATE_COST)
    db.setUser(m.sender, { clanId })
    await db.save()

    await m.reply(
        `${emblem} *CLAN CREADO*\n\n` +
        `*${clanName}*\n` +
        `Líder: @${m.sender.split('@')[0]}\n` +
        `Estado: Abierto · 1/50 miembros\n\n` +
        `_-${CLAN_CREATE_COST.toLocaleString('es-ES')} monedas_\n\n` +
        `Invita amigos con: *.claninvite @user*\n` +
        `O comparte el ID: *${clanId}*`,
        { mentions: [m.sender] }
    )
}

export { pluginConfig as config, handler }
