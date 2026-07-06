import { getDatabase } from '../../src/lib/ourin-database.js'

const pluginConfig = {
    name: 'clanleave',
    alias: ['leaveclan', 'guildleave', 'salirclan'],
    category: 'clan',
    description: 'Salir del clan actual',
    usage: '.clanleave',
    example: '.clanleave',
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
    if (!clan) {
        db.setUser(m.sender, { clanId: null })
        db.save()
        return m.reply(`❌ No se encontró el clan, tus datos han sido limpiados`)
    }

    if (clan.leader === m.sender) {
        if (clan.members.length > 1) {
            return m.reply(
                `❌ ¡Tú eres el líder del clan!\n\n` +
                `Transfiere el liderazgo primero usando: *.clantransfer @user*\n` +
                `O expulsa a todos los miembros antes de salir.`
            )
        }
        // Si el líder está solo, se elimina/disuelve el clan por completo
        delete db.db.data.clans[user.clanId]
        db.setUser(m.sender, { clanId: null })
        db.save()

        const emblem = clan.emblem || '🏰'
        return m.reply(`${emblem} El clan *${clan.name}* ha sido disuelto`)
    }

    // Lógica para salir si eres un miembro común
    clan.members = clan.members.filter(jid => jid !== m.sender)
    db.setUser(m.sender, { clanId: null })
    db.save()

    await m.reply(`👋 Has salido del clan *${clan.name}*`)
}

export { pluginConfig as config, handler }
