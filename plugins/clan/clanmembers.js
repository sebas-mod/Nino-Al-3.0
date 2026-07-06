import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'clanmembers',
    alias: ['clanmember', 'guildmembers', 'miembrosclan'],
    category: 'clan',
    description: 'Muestra la lista de miembros del clan',
    usage: '.clanmembers',
    example: '.clanmembers',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const db = getDatabase()
    const user = db.getUser(m.sender)

    if (!user?.clanId) return m.reply(`❌ No perteneces a ningún clan`)
    if (!db.db.data.clans) db.db.data.clans = {}

    const clan = db.db.data.clans[user.clanId]
    if (!clan) return m.reply(`❌ Clan no encontrado`)

    const emblem = clan.emblem || '🏰'
    const mentions = []

    const memberLines = clan.members.map((jid, i) => {
        const memberUser = db.getUser(jid)
        const isLeader = jid === clan.leader
        const level = memberUser?.rpg?.level || memberUser?.level || 1
        const koin = (memberUser?.koin || 0).toLocaleString('es-ES')
        mentions.push(jid)

        const role = isLeader ? '👑' : '•'
        return `${role} @${jid.split('@')[0]}  Nivel ${level} · ${koin} monedas`
    })

    await m.reply(
        `${emblem} *${clan.name}* — Miembros\n\n` +
        memberLines.join('\n') +
        `\n\n${clan.members.length}/50 miembros`,
        { mentions }
    )
}

export { pluginConfig as config, handler }
