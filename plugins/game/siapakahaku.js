import { games } from '../../src/lib/ourin-games.js'

games.register('siapakahaku', {
    alias: ['quiensoy', 'quien', 'whoami'],
    emoji: '🎭',
    title: '¿QUIÉN SOY?',
    description: 'Adivina el personaje u objeto a partir de la descripción'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('siapakahaku')
export { pluginConfig as config, handler, answerHandler }
