import { games } from '../../src/lib/ourin-games.js'

games.register('tebakkalimat', {
    alias: ['adivinafrase', 'frase', 'refran', 'proverbio'],
    emoji: '📖',
    title: 'ADIVINA LA FRASE',
    description: 'Adivina la frase, refrán o proverbio'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebakkalimat')
export { pluginConfig as config, handler, answerHandler }
