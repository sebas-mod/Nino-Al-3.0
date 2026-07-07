import { games } from '../../src/lib/ourin-games.js'

games.register('tebakepep', {
    alias: ['advinaff', 'adovinafreefire', 'freefire'],
    emoji: '🔫',
    title: 'ADIVINA FREE FIRE',
    description: 'Adivina el personaje de Free Fire',
    hasImage: true
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebakepep')
export { pluginConfig as config, handler, answerHandler }
