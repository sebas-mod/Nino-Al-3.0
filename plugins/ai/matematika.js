import te from '../../src/lib/ourin-error.js'
import axios from 'axios'
import config from '../../config.js'

const pluginConfig = {
    name: 'matematica',
    alias: ['mathgpt', 'math', 'mathsolver'],
    category: 'ai',
    description: 'IA para resolver problemas matemáticos',
    usage: '.matematica <problema>',
    example: '.matematica 2+2 cuanto es?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.args.join(' ')

    if (!text) {
        return m.reply(`📐 *ᴍᴀᴛʜ ɢᴘᴛ*\n\n> Ingresa un problema matemático\n\n\`Ejemplo: ${m.prefix}matematika 2+2 berapa?\``)
    }

    m.react('🕕')

    try {
        const url = `https://api.nexray.eu.cc/ai/mathgpt?text=${encodeURIComponent(text)}`
        
        const { data } = await axios.get(url, {
            timeout: 30000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            }
        })

        if (!data.status || !data.result) {
            await m.react('❌')
            return m.reply("⚠️ Error al procesar el problema matemático.")
        }

        const answer = data.result

        m.react('✅')
        await m.reply(`${answer}`)

    } catch (error) {
        m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
