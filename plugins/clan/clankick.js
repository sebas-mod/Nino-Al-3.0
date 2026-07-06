import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'clankick',
    alias: ['kickclan', 'expulsarclan'],
    category: 'clan',
    description: 'Expulsa a un miembro del clan (Solo el Líder)',
    usage: '.clankick @user',
    example: '.clankick @user',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
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
    if (clan.leader !== m.sender) return m.reply(`❌ Solo el líder del clan puede expulsar miembros`)

    const target = m.mentionedJid?.[0] || m.quoted?.sender
    if (!target) {
        return m.reply(
            `👢 *EXPULSAR MIEMBRO*\n\n` +
            `Menciona (@) o responde al mensaje del miembro que deseas expulsar.\n\n` +
            `Ejemplo: *.clankick @user*`
        )
    }

    if (target === m.sender) return m.reply(`❌ No puedes expulsarte a ti mismo`)
    if (!clan.members.includes(target)) return m.reply(`❌ Ese usuario no es miembro de este clan`)

    clan.members = clan.members.filter(jid => jid !== target)
    db.setUser(target, { clanId: null })
    db.save()

    const emblem = clan.emblem || '🏰'

    await m.reply(
        `${emblem} *¡EXPULSADO!*\n\n` +
        `@${target.split('@')[0]} ha sido expulsado de *${clan.name}*\n` +
        `Miembros restantes: ${clan.members.length}/50`,
        { mentions: [target] }
    )
}

export { pluginConfig as config, handler }
