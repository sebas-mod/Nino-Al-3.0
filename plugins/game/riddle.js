import { games } from '../../src/lib/ourin-games.js'

games.register('riddle', {
    alias: ['rd', 'acertijo', 'acertijos', 'adivinanza', 'adivinanzas'],
    emoji: '❓',
    title: 'ACERTIJO',
    description: 'Adivinanzas y acertijos'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('riddle')
export { pluginConfig as config, handler, answerHandler }
