import { loadSent, saveSent, loadState, saveState, getOngoingAnimeList, startAutoCheck, stopAutoCheck, runCheck, isRunning } from '../../src/lib/ourin-auto-anime.js'
import config from '../../config.js'
import te from '../../src/lib/ourin-error.js'
const pluginConfig = {
    name: 'autoanimewinbu',
    alias: ['aaw', 'autoanime'],
    category: 'anime',
    description: 'Subida automática de anime en emisión y donghua desde winbu.net (720p Pixeldrain)',
    usage: '.autoanimewinbu <start|stop|status|cek|list|reset|addgrup|delgrup>',
    example: '.autoanimewinbu start',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock, args }) {
    const sub = m.text
    const state = loadState()


    switch (sub) {
        case 'start': {
            if (isRunning()) {
                return m.reply(`⚠️ ¡AutoAnime ya está en ejecución!`)
            }

            const groups = state.groups || []
            if (groups.length === 0) {
                return m.reply(
                    `❌ ¡Aún no hay grupos de destino establecidos!\n\n` +
                    `> Añade un grupo primero:\n` +
                    `> \`${m.prefix}autoanimewinbu addgrup\` (dentro del grupo de destino)\n` +
                    `> \`${m.prefix}autoanimewinbu addgrup 120363xxx@g.us\``
                )
            }

            const interval = state.interval || 5
            startAutoCheck(sock, interval)
            saveState({ ...state, enabled: true })

            return sock.sendMessage(m.chat, {
                text: `✅ *ᴀᴜᴛᴏ ᴀɴɪᴍᴇ sᴛᴀʀᴛᴇᴅ*\n\n` +
                    `> 📲 Grupos destino: *${groups.length}*\n` +
                    `> ⏱️ Intervalo: *${interval} minutos*\n` +
                    `> 🎞️ Filtor: *Pixeldrain 720p+*\n` +
                    `> ⏰ Antigüedad máx: *24 horas*\n\n` +
                    `Iniciando la primera revisión...`,
                interactiveButtons: [
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '📊 Estado',
                            id: `${m.prefix}autoanimewinbu status`
                        })
                    },
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '🛑 Detener',
                            id: `${m.prefix}autoanimewinbu stop`
                        })
                    }
                ]
            }, { quoted: m })
        }

        case 'stop': {
            stopAutoCheck()
            saveState({ ...state, enabled: false })
            return m.reply(`🛑 *AutoAnime detenido*`)
        }

        case 'status': {
            const sent = loadSent()
            const running = isRunning()
            const groups = state.groups || []

            let txt = `📊 *ᴀᴜᴛᴏ ᴀɴɪᴍᴇ sᴛᴀᴛᴜs*\n\n`
            txt += `> 🔄 Estado: *${running ? '🟢 ON' : '🔴 OFF'}*\n`
            txt += `> 💾 Inicio automático: *${state.enabled ? 'Sí' : 'No'}*\n`
            txt += `> 📋 Episodios enviados: *${sent.size}*\n`
            txt += `> ⏱️ Intervalo: *${state.interval || 5} minutos*\n`
            txt += `> 📲 Grupos destino: *${groups.length}*\n`

            if (groups.length > 0) {
                txt += `\n*Grupos:*\n`
                groups.forEach((g, i) => {
                    txt += `> ${i + 1}. \`${g}\`\n`
                })
            }

            return sock.sendMessage(m.chat, { text: txt }, { quoted: m })
        }

        case 'cek':
        case 'check': {
            if (!isRunning()) {
                startAutoCheck(sock, state.interval || 5)
            }
            await m.reply('🔍 Buscando los últimos animes...')
            try {
                await runCheck()
                return m.reply('✅ Revisión completada')
            } catch (e) {
                m.reply(te(m.prefix, m.command, m.pushName))
            }
        }

        case 'list': {
            await m.reply('📺 Obteniendo la lista de anime...')
            try {
                const list = await getOngoingAnimeList()
                if (list.length === 0) return m.reply('❌ No se encontraron animes')

                let txt = `📺 *ᴅᴀꜰᴛᴀʀ ᴀɴɪᴍᴇ ᴛᴇʀʙᴀʀᴜ*\n\n`
                txt += `> Total: *${list.length}* animes\n\n`
                list.slice(0, 15).forEach((a, i) => {
                    txt += `*${i + 1}.* ${a.title}\n`
                })
                if (list.length > 15) txt += `\n> ... y otros ${list.length - 15}`

                return sock.sendMessage(m.chat, { text: txt }, { quoted: m })
            } catch (e) {
                m.reply(te(m.prefix, m.command, m.pushName))
            }
        }

        case 'reset': {
            const sent = loadSent()
            const count = sent.size
            saveSent(new Set())
            return m.reply(`✅ ¡Reiniciado! Se han eliminado *${count}* episodios del historial.\n> Todos los episodios se pueden volver a enviar.`)
        }

        case 'addgrup':
        case 'addgroup': {
            const rest = (typeof args === 'string' ? args : '').replace(/^(addgrup|addgroup)\s*/i, '').trim()
            let grupId = rest

            if (!grupId && m.isGroup) {
                grupId = m.chat
            }

            if (!grupId || !grupId.includes('@g.us')) {
                return m.reply(
                    `❌ ID de grupo no válido\n\n` +
                    `> Usa este comando dentro de un grupo, o escribe:\n` +
                    `> \`${m.prefix}autoanimewinbu addgrup 120363xxx@g.us\``
                )
            }

            const groups = state.groups || []
            if (groups.includes(grupId)) {
                return m.reply(`⚠️ El grupo ya se encuentra en la lista de destino`)
            }

            groups.push(grupId)
            saveState({ ...state, groups })
            return m.reply(`✅ Grupo \`${grupId}\` añadido a la lista de destino\n> Total: *${groups.length}* grupos`)
        }

        case 'delgrup':
        case 'delgroup': {
            const rest = (typeof args === 'string' ? args : '').replace(/^(delgrup|delgroup)\s*/i, '').trim()
            let grupId = rest

            if (!grupId && m.isGroup) {
                grupId = m.chat
            }

            const groups = state.groups || []
            const idx = groups.indexOf(grupId)
            if (idx === -1) {
                return m.reply(`❌ No se encontró el grupo en la lista de destino`)
            }

            groups.splice(idx, 1)
            saveState({ ...state, groups })
            return m.reply(`✅ Grupo \`${grupId}\` eliminado de la lista de destino\n> Restantes: *${groups.length}* grupos`)
        }

        case 'interval': {
            const rest = (typeof args === 'string' ? args : '').replace(/^interval\s*/i, '').trim()
            const mins = parseInt(rest)
            if (!mins || mins < 1 || mins > 60) {
                return m.reply(`❌ El intervalo debe ser entre 1 y 60 minutos\n\n> Ejemplo: \`${m.prefix}autoanimewinbu interval 10\``)
            }

            saveState({ ...state, interval: mins })

            if (isRunning()) {
                stopAutoCheck()
                startAutoCheck(sock, mins)
            }

            return m.reply(`✅ Intervalo cambiado a *${mins} minutos*`)
        }

        default: {
            const running = isRunning()
            return sock.sendMessage(m.chat, {
                text: `🎬 *ᴀᴜᴛᴏ ᴀɴɪᴍᴇ ᴡɪɴʙᴜ*\n\n` +
                    `> Estado: *${running ? '🟢 ON' : '🔴 OFF'}*\n\n` +
                    `*ᴄᴏᴍᴍᴀɴᴅs:*\n` +
                    `> \`${m.prefix}aaw start\` — Iniciar revisión automática\n` +
                    `> \`${m.prefix}aaw stop\` — Detener revisión automática\n` +
                    `> \`${m.prefix}aaw status\` — Ver estado actual\n` +
                    `> \`${m.prefix}aaw cek\` — Realizar revisión manual ahora\n` +
                    `> \`${m.prefix}aaw list\` — Lista de los últimos animes\n` +
                    `> \`${m.prefix}aaw addgrup\` — Añadir grupo de destino\n` +
                    `> \`${m.prefix}aaw delgrup\` — Eliminar grupo de destino\n` +
                    `> \`${m.prefix}aaw interval 10\` — Cambiar el intervalo de tiempo\n` +
                    `> \`${m.prefix}aaw reset\` — Reiniciar historial de enviados`,
                interactiveButtons: [
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: running ? '🛑 Stop' : '▶️ Start',
                            id: `${m.prefix}autoanimewinbu ${running ? 'stop' : 'start'}`
                        })
                    },
                    {
                        name: 'quick_reply',
                        buttonParamsJson: JSON.stringify({
                            display_text: '📊 Estado',
                            id: `${m.prefix}autoanimewinbu status`
                        })
                    }
                ]
            }, { quoted: m })
        }
    }
}

export { pluginConfig as config, handler }
