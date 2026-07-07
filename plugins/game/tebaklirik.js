import { games } from '../../src/lib/ourin-games.js'

games.register('tebaklirik', {
    alias: ['adivinalaletra', 'letra', 'letras'],
    emoji: '🎤',
    title: 'ADIVINA LA LETRA',
    description: 'Adivina la letra de la canción'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebaklirik')
export { pluginConfig as config, handler, answerHandler }
