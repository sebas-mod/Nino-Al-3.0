import { getDatabase } from '../../src/lib/ourin-database.js'
import config from '../../config.js'

const pluginConfig = {
    name: 'suitpvp',
    alias: ['ppt', 'suit', 'rps', 'janken'],
    category: 'game',
    description: 'Juega a Piedra, Papel o Tijera con otro jugador',
    usage: '.ppt @tag',
    example: '.ppt @628xxx',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

if (!global.suitGames) global.suitGames = {}

const TIMEOUT = 90000
const WIN_REWARD = 1000

const EMOJI = {
    piedra: '✊',
    tijera: '✌️',
    papel: '✋'
}

async function handler(m, { sock }) {
    const db = getDatabase()
    
    const existingRoom = Object.values(global.suitGames).find(
        room => [room.p, room.p2].includes(m.sender)
    )
    
    if (existingRoom) {
        return m.reply(
            `❌ ¡Ya estás en una partida de Piedra, Papel o Tijera!\n\n` +
            `> Termina tu juego actual primero.`
        )
    }
    
    let target = null
    if (m.quoted) {
        target = m.quoted.sender
    } else if (m.mentionedJid?.[0]) {
        target = m.mentionedJid[0]
    }
    
    if (!target) {
        return m.reply(
            `✊✌️✋ *ᴘɪᴇᴅʀᴀ, ᴘᴀᴘᴇʟ ᴏ ᴛɪᴊᴇʀᴀ*\n\n` +
            `> ¡Menciona a la persona que quieres desafiar!\n\n` +
            `*Ejemplo:*\n` +
            `> \`.ppt @628xxx\``
        )
    }
    
    if (target === m.sender) {
        return m.reply('❌ ¡No puedes desafiarte a ti mismo!')
    }
    
    const targetInGame = Object.values(global.suitGames).find(
        room => [room.p, room.p2].includes(target)
    )
    
    if (targetInGame) {
        return m.reply('❌ ¡Esa persona ya está jugando con alguien más!')
    }
    
    const roomId = 'suit_' + Date.now()
    
    global.suitGames[roomId] = {
        id: roomId,
        chat: m.chat,
        p: m.sender,
        p2: target,
        status: 'waiting',
        pilih: null,
        pilih2: null,
        createdAt: Date.now(),
        timeout: setTimeout(() => {
            if (global.suitGames[roomId]) {
                sock.sendMessage(m.chat, {
                    text: `⏱️ *¡TIEMPO AGOTADO!*\n\n@${target.split('@')[0]} no respondió.\nEl desafío ha sido cancelado.`,
                    mentions: [target]
                })
                delete global.suitGames[roomId]
            }
        }, TIMEOUT)
    }
    
    await m.react('✊')
    await m.reply(`Has desafiado a @${target.split('@')[0]} a una partida de Piedra, Papel o Tijera.\n\n` +
            `╭┈┈⬡「 💬 *ʀᴇsᴘᴜᴇsᴛᴀ* 」\n` +
            `┃ ✅ Escribe *aceptar* / *si* / *ok*\n` +
            `┃ ❌ Escribe *rechazar* / *no*\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `Tiempo: 90 segundos`, { mentions: [target]})
}

async function answerHandler(m, sock) {
    if (!m.body) return false
    
    const text = m.body.trim().toLowerCase()
    const db = getDatabase()
    
    let room = null
    let roomId = null
    
    for (const [id, r] of Object.entries(global.suitGames)) {
        if (r.chat === m.chat && [r.p, r.p2].includes(m.sender)) {
            room = r
            roomId = id
            break
        }
        if (!m.isGroup && [r.p, r.p2].includes(m.sender)) {
            room = r
            roomId = id
            break
        }
    }
    
    if (!room) return false
    
    if (room.status === 'waiting' && m.sender === room.p2 && m.chat === room.chat) {
        if (/^(acc(ept)?|terima|aceptar|acepto|si|gas|oke?|ok|iya|yoi)$/i.test(text)) {
            clearTimeout(room.timeout)
            room.status = 'playing'
            
            await m.react('🎮')
            
            await m.reply(`✊✌️✋ *¡ᴇᴍᴘɪᴇᴢᴀ ᴇʟ ᴊᴜᴇɢᴏ!*\n\n` +
                    `@${room.p.split('@')[0]} vs @${room.p2.split('@')[0]}\n\n` +
                    `> 📩 ¡Revisen su *Chat Privado* para elegir su jugada!\n` +
                    `> ⏱️ Tiempo límite: 90 segundos`, { mentions: [room.p, room.p2]})
            
            const pmMessage = `✊✌️✋ *ᴘᴘᴛ - ᴇʟɪɢᴇ ᴛᴜ ᴊᴜɢᴀᴅᴀ*\n\n` +
                `Escribe una de las siguientes opciones:\n\n` +
                `┃ ✊ *piedra*\n` +
                `┃ ✋ *papel*\n` +
                `┃ ✌️ *tijera*\n\n` +
                `*CONSEJO: ¡Responde a este mensaje con tu elección!*\n` +
                `Ejemplo: *piedra*`
            
            try {
                await sock.sendMessage(room.p, { text: pmMessage })
            } catch (e) {
                console.log('[Suit] Error al enviar mensaje privado al jugador 1:', e.message)
            }
            
            try {
                await sock.sendMessage(room.p2, { text: pmMessage })
            } catch (e) {
                console.log('[Suit] Error al enviar mensaje privado al jugador 2:', e.message)
            }
            
            room.timeout = setTimeout(async () => {
                if (global.suitGames[roomId]) {
                    if (!room.pilih && !room.pilih2) {
                        await sock.sendMessage(room.chat, { 
                            text: '⏱️ Ninguno de los jugadores eligió, ¡juego cancelado!' 
                        })
                    } else if (!room.pilih || !room.pilih2) {
                        const afk = !room.pilih ? room.p : room.p2
                        const winner = !room.pilih ? room.p2 : room.p
                        
                        db.updateKoin(winner, WIN_REWARD)
                        
                        await sock.sendMessage(room.chat, {
                            text: `⏱️ *¡TIEMPO AGOTADO!*\n\n` +
                                `@${afk.split('@')[0]} no eligió a tiempo.\n` +
                                `@${winner.split('@')[0]} gana! +$ ${WIN_REWARD.toLocaleString()}`,
                            mentions: [afk, winner]
                        })
                    }
                    delete global.suitGames[roomId]
                }
            }, TIMEOUT)
            
            return true
        }
        
        if (/^(tolak|gamau|nanti|rechazar|rechazo|no|ga(k.)?bisa|no|tidak)$/i.test(text)) {
            clearTimeout(room.timeout)
            
            await sock.sendMessage(room.chat, {
                text: `❌ @${room.p2.split('@')[0]} rechazó el desafío.\nEl juego ha sido cancelado.`,
                mentions: [room.p2]
            })
            
            delete global.suitGames[roomId]
            return true
        }
    }
    
    if (room.status === 'playing' && !m.isGroup) {
        const choices = /^(piedra|papel|tijera)$/i
        
        if (!choices.test(text)) return false
        
        const choice = text.toLowerCase()
        
        if (m.sender === room.p && !room.pilih) {
            room.pilih = choice
            await m.reply(`✅ Elegiste *${choice}* ${EMOJI[choice]}\n\n> Esperando al oponente...`)
            
            if (!room.pilih2) {
                await sock.sendMessage(room.chat, {
                    text: ` Hexagonal 🕕 ¡@${room.p.split('@')[0]} ya ha elegido!\n> Esperando a @${room.p2.split('@')[0]}...`,
                    mentions: [room.p, room.p2]
                })
            }
        }
        
        if (m.sender === room.p2 && !room.pilih2) {
            room.pilih2 = choice
            await m.reply(`✅ Elegiste *${choice}* ${EMOJI[choice]}\n\n> Esperando al oponente...`)
            
            if (!room.pilih) {
                await sock.sendMessage(room.chat, {
                    text: `🕕 ¡@${room.p2.split('@')[0]} ya ha elegido!\n> Esperando a @${room.p.split('@')[0]}...`,
                    mentions: [room.p, room.p2]
                })
            }
        }
        
        if (room.pilih && room.pilih2) {
            clearTimeout(room.timeout)
            
            let winner = null
            let tie = false
            
            if (room.pilih === room.pilih2) {
                tie = true
            } else if (
                (room.pilih === 'piedra' && room.pilih2 === 'tijera') ||
                (room.pilih === 'tijera' && room.pilih2 === 'papel') ||
                (room.pilih === 'papel' && room.pilih2 === 'piedra')
            ) {
                winner = room.p
            } else {
                winner = room.p2
            }
            
            let resultTxt = `✊✌️✋ *ʀᴇsᴜʟᴛᴀᴅᴏ ᴅᴇʟ ᴊᴜᴇɢᴏ*\n\n`
            resultTxt += `@${room.p.split('@')[0]} ${EMOJI[room.pilih]} (${room.pilih})\n`
            resultTxt += `@${room.p2.split('@')[0]} ${EMOJI[room.pilih2]} (${room.pilih2})\n\n`
            
            if (tie) {
                resultTxt += `🤝 *¡EMPATE!*`
            } else {
                db.updateKoin(winner, WIN_REWARD)
                
                resultTxt += `🏆 ¡@${winner.split('@')[0]} gana el juego!\n`
                resultTxt += `> +$ ${WIN_REWARD.toLocaleString()}`
            }
            
            await sock.sendMessage(room.chat, {
                text: resultTxt,
                mentions: [room.p, room.p2]
            }, { quoted: m })
            
            delete global.suitGames[roomId]
        }
        
        return true
    }
    
    return false
}

export { pluginConfig as config, handler, answerHandler }
