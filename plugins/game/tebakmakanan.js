import { games } from '../../src/lib/ourin-games.js'

games.register('tebakmakanan', {
    alias: ['adivinacomida', 'comida', 'food'],
    emoji: '🍲',
    title: 'ADIVINA LA COMIDA',
    description: 'Adivina el nombre de la comida o plato',
    hasImage: true
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebakmakanan')
export { pluginConfig as config, handler, answerHandler }
