import axios from 'axios'
import { f } from '../../src/lib/ourin-http.js'
import te from '../../src/lib/ourin-error.js'
import config from '../../config.js'
const pluginConfig = {
    name: 'gita',
    alias: ['gitagpt', 'bhagavadgita'],
    category: 'ai',
    description: 'Chatea con Gita GPT (Bhagavad Gita AI)',
    usage: '.gita <pregunta>',
    example: '.gita What is dharma?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.args.join(' ')
    if (!text) {
        return m.reply(`📿 *ɢɪᴛᴀ ɢᴘᴛ*\n\n> Ingresa una pregunta\n\n\`Ejemplo: ${m.prefix}gita What is dharma?\``)
    }

    m.react('🕕')

    try {
        const url = `https://api.cuki.biz.id/api/ai/gita?apikey=${config.APIkey.cuki}&q=${encodeURIComponent(text)}`
        const data = await f(url)

        const content = data.results

        m.react('✅')
        await m.reply(`${content?.trim()}`)

    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
