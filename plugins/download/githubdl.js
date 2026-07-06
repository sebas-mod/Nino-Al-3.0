import config from '../../config.js'
import path from 'path'
import fs from 'fs'
import te from '../../src/lib/ourin-error.js'

const pluginConfig = {
    name: 'githubdl',
    alias: ['gitdl', 'gitclone', 'repodownload', 'githubdescargar'],
    category: 'download',
    description: 'Descargar repositorio de GitHub en formato ZIP',
    usage: '.githubdl <usuario> <repositorio> <rama>',
    example: '.githubdl niceplugin NiceBot main',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 15,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const args = m.args || []
    let username, repo, branch
    
    if (args[0]?.includes('github.com')) {
        const urlMatch = args[0].match(/github\.com\/([^\/]+)\/([^\/]+)/i)
        if (urlMatch) {
            username = urlMatch[1]
            repo = urlMatch[2].replace(/\.git$/, '')
            branch = args[1] || 'main'
        }
    } else {
        username = args[0]
        repo = args[1]
        branch = args[2] || 'main'
    }
    
    if (!username) {
        return m.reply(
            `⚠️ *MODO DE USO*\n\n` +
            `> \`${m.prefix}githubdl <usuario> <repositorio> <rama>\`\n\n` +
            `> Ejemplos:\n` +
            `> \`${m.prefix}githubdl niceplugin NiceBot main\`\n` +
            `> \`${m.prefix}githubdl https://github.com/user/repo\``
        )
    }
    
    if (!repo) {
        return m.reply(`❌ *REPOSITORIO REQUERIDO*\n\n> Por favor, ingresa el nombre del repositorio.`)
    }
    
    await m.react('Campana')

    try {
        const repoInfo = await fetch(`https://api.github.com/repos/${username}/${repo}`)
        
        if (!repoInfo.ok) {
            await m.react('❌')
            return m.reply(`❌ *REPOSITORIO NO ENCONTRADO*\n\n> No existe el repositorio \`${username}/${repo}\``)
        }
        
        const repoData = await repoInfo.json()
        const defaultBranch = repoData.default_branch || 'main'
        branch = branch || defaultBranch
        
        const zipUrl = `https://github.com/${username}/${repo}/archive/refs/heads/${branch}.zip`
        
        const checkRes = await fetch(zipUrl, { method: 'HEAD' })
        if (!checkRes.ok) {
            await m.react('❌')
            return m.reply(`❌ *RAMA NO ENCONTRADA*\n\n> La rama \`${branch}\` no fue encontrada\n> Por defecto: \`${defaultBranch}\``)
        }
        
        await sock.sendMedia(m.chat, zipUrl, null, m, {
            type: 'document',
            fileName: `${repo} - Rama: ${branch}.zip`,
            mimetype: 'application/zip',
            contextInfo: {
                forwardingScore: 99,
                isForwarded: true
            }
        })
        
        await m.react('✅')
        
    } catch (e) {
        await m.react('☢')
        m.reply(te(m.prefix, m.command, m.pushName))
    }
}

export { pluginConfig as config, handler }
