import { games } from '../../src/lib/ourin-games.js'

games.register('tebaklagu', {
    alias: ['tl', 'adivinalacancion', 'cancion', 'musica'],
    emoji: '🎵',
    title: 'ADIVINA LA CANCIÓN',
    description: 'Adivina el título de la canción'
})

const { config: pluginConfig, handler, answerHandler } = games.createPlugin('tebaklagu')
export { pluginConfig as config, handler, answerHandler }
