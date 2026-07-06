import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'claninvite',
    alias: ['inviteclan', 'invitarclan'],
    category: 'clan',
    description: 'Invita y añade directamente a un usuario al clan',
    usage: '.claninvite @user',
    example: '.claninvite @user',
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

    const target = m.mentionedJid?.[0] || m.quoted?.sender
    if (!target) {
        return m.reply(
            `📨 *INVITAR AL CLAN*\n\n` +
            `Menciona (@) o responde al mensaje del usuario que deseas invitar.\n\n` +
            `Ejemplo: *.claninvite @user*`
        )
    }

    if (target === m.sender) return m.reply(`❌ No puedes invitarte a ti mismo`)

    const targetUser = db.getUser(target)
    if (targetUser?.clanId) return m.reply(`❌ Ese usuario ya pertenece a un clan`)
    if (clan.members.length >= 50) return m.reply(`❌ El clan ya está lleno (50/50)`)

    clan.members.push(target)
    db.setUser(target, { clanId: user.clanId })
    db.save()

    const emblem = clan.emblem || '🏰'

    await m.reply(
        `${emblem} *¡INVITADO!*\n\n` +
        `@${target.split('@')[0]} se ha unido a *${clan.name}*\n` +
        `Miembros: ${clan.members.length}/50`,
        { mentions: [m.sender, target] }
    )
}

export { pluginConfig as config, handler }
