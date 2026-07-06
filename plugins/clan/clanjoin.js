import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'clanjoin',
    alias: ['joinclan', 'guildjoin', 'unirseclan'],
    category: 'clan',
    description: 'Unirse a un clan',
    usage: '.clanjoin <clan_id>',
    example: '.clanjoin ABC1',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

const MAX_MEMBERS = 50

async function handler(m) {
    const db = getDatabase()
    const user = db.getUser(m.sender)
    const clanId = m.text?.trim()

    if (!clanId) {
        return m.reply(
            `🏰 *UNIRSE AL CLAN*\n\n` +
            `¡Por favor, ingresa el ID del clan!\n\n` +
            `Ejemplo: *.clanjoin ABC1*\n` +
            `Revisar IDs disponibles: *.clanleaderboard*`
        )
    }

    if (user.clanId) {
        return m.reply(`❌ Ya perteneces a un clan.\nSal primero usando: *.clanleave*`)
    }

    if (!db.db.data.clans) db.db.data.clans = {}

    const clan = db.db.data.clans[clanId]
        || Object.values(db.db.data.clans).find(c => c.name.toLowerCase() === clanId.toLowerCase())
        || Object.values(db.db.data.clans).find(c => c.id.toLowerCase() === clanId.toLowerCase())
        
    if (!clan) return m.reply(`❌ No se encontró el clan.`)
    if (!clan.isOpen) return m.reply(`❌ *${clan.name}* está cerrado actualmente.`)
    if (clan.members.length >= MAX_MEMBERS) return m.reply(`❌ *${clan.name}* ya está lleno (${MAX_MEMBERS}/${MAX_MEMBERS}).`)

    clan.members.push(m.sender)
    db.setUser(m.sender, { clanId: clan.id })
    db.save()

    const emblem = clan.emblem || '🏰'

    await m.reply(
        `${emblem} *¡BIENVENIDO/A!*\n\n` +
        `@${m.sender.split('@')[0]} se ha unido a *${clan.name}*\n\n` +
        `Líder: @${clan.leader.split('@')[0]}\n` +
        `Miembros: ${clan.members.length}/${MAX_MEMBERS}\n\n` +
        `Ver información: *.claninfo*`,
        { mentions: [m.sender, clan.leader] }
    )
}

export { pluginConfig as config, handler }
