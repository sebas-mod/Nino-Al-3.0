import { execSync, spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

const pluginConfig = {
    name: 'nino-up',
    alias: ['ninoupdate', 'up', 'update'],
    category: 'owner',
    description: 'Actualizar Nino AI 3.0 desde GitHub usando git pull',
    usage: '.nino-up',
    example: '.nino-up',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true
}

const REPO_URL = 'https://github.com/sebas-mod/Nino-Al-3.0.git'
const BRANCH = 'main'

function execSafe(cmd, opts = {}) {
    try {
        return {
            success: true,
            output: execSync(cmd, {
                stdio: 'pipe',
                timeout: 120000,
                ...opts
            }).toString().trim()
        }
    } catch (e) {
        return {
            success: false,
            output: e.stderr?.toString().trim() || e.message
        }
    }
}

async function handler(m, { sock }) {
    const baseDir = process.cwd()

    try {
        await m.react('💗')

        const gitCheck = execSafe('git --version')

        if (!gitCheck.success) {
            return m.reply(
                `❌ *ERROR NINO UPDATE*\n\n` +
                `> Git no está instalado en el servidor\n` +
                `> Instala git con:\n` +
                `> \`apt install git\`\n` +
                `> o\n` +
                `> \`pkg install git\``
            )
        }

        const isGitRepo = fs.existsSync(path.join(baseDir, '.git'))

        if (!isGitRepo) {
            await m.reply(
                `🌸 *NINO AI 3.0 UPDATE*\n\n` +
                `> El proyecto todavía no está conectado a GitHub\n` +
                `> Inicializando repositorio y conectando con Nino-Al-3.0...`
            )

            execSafe('git init', { cwd: baseDir })
            execSafe(`git remote add origin ${REPO_URL}`, { cwd: baseDir })
            execSafe(`git fetch origin ${BRANCH}`, { cwd: baseDir })

            const resetResult = execSafe(
                `git reset --hard origin/${BRANCH}`,
                { cwd: baseDir }
            )

            if (!resetResult.success) {
                await m.react('❌')

                return m.reply(
                    `❌ *ERROR AL INICIALIZAR GIT*\n\n` +
                    `> ${resetResult.output?.slice(0, 300)}`
                )
            }

            await m.react('✅')

            return m.reply(
                `✅ *NINO AI 3.0 CONECTADO*\n\n` +
                `> Repositorio conectado correctamente\n` +
                `> Repo: \`sebas-mod/Nino-Al-3.0\`\n\n` +
                `> Ejecuta nuevamente \`.nino-up\` para actualizar`
            )
        }

        const remoteResult = execSafe(
            'git remote get-url origin',
            { cwd: baseDir }
        )

        if (
            !remoteResult.success ||
            !remoteResult.output.includes('sebas-mod/Nino-Al-3.0')
        ) {
            execSafe('git remote remove origin', { cwd: baseDir })
            execSafe(
                `git remote add origin ${REPO_URL}`,
                { cwd: baseDir }
            )
        }

        await m.reply(
            `🌸 *NINO AI 3.0 UPDATE*\n\n` +
            `╭┈┈⬡「 📦 REPOSITORIO 」\n` +
            `┃ 💗 Repo: \`sebas-mod/Nino-Al-3.0\`\n` +
            `┃ 🌿 Rama: \`${BRANCH}\`\n` +
            `╰┈┈⬡\n\n` +
            `📡 Paso 1/3 — Buscando actualizaciones...`
        )

        const fetchResult = execSafe(
            `git fetch origin ${BRANCH}`,
            { cwd: baseDir }
        )

        if (!fetchResult.success) {
            await m.react('❌')

            return m.reply(
                `❌ *ERROR AL CONECTAR CON GITHUB*\n\n` +
                `> ${fetchResult.output?.slice(0, 200)}\n\n` +
                `> Revisa tu conexión a internet`
            )
        }

        const localHash = execSafe(
            'git rev-parse HEAD',
            { cwd: baseDir }
        ).output

        const remoteHash = execSafe(
            `git rev-parse origin/${BRANCH}`,
            { cwd: baseDir }
        ).output

        if (localHash === remoteHash) {
            await m.react('✨')

            return m.reply(
                `✨ *NINO AI 3.0 YA ESTÁ ACTUALIZADO*\n\n` +
                `> No hay cambios nuevos disponibles\n` +
                `> Commit actual: \`${localHash.slice(0, 7)}\``
            )
        }

        const diffResult = execSafe(
            `git diff --name-status HEAD origin/${BRANCH}`,
            { cwd: baseDir }
        )

        let changedFiles = []
        let packageJsonChanged = false

        if (diffResult.success && diffResult.output) {
            changedFiles = diffResult.output
                .split('\n')
                .filter(line => line.trim())
                .map(line => {
                    const parts = line.split('\t')
                    const status = parts[0]
                    const file = parts[1] || parts[0]

                    const statusLabel =
                        status === 'M'
                            ? '✏️ Modificado'
                            : status === 'A'
                            ? '➕ Agregado'
                            : status === 'D'
                            ? '🗑️ Eliminado'
                            : status.startsWith('R')
                            ? '🔄 Renombrado'
                            : '📄 Cambiado'

                    if (file === 'package.json') {
                        packageJsonChanged = true
                    }

                    return `${statusLabel}: \`${file}\``
                })
        }

        const changedCount = changedFiles.length
        const preview = changedFiles.slice(0, 10).join('\n')
        const extra =
            changedCount > 10
                ? `\n_...y ${changedCount - 10} archivos más_`
                : ''

        await m.reply(
            `📋 *CAMBIOS DETECTADOS EN NINO AI 3.0*\n\n` +
            `> 📁 Archivos modificados: \`${changedCount}\`\n\n` +
            (preview
                ? `${preview}${extra}\n\n`
                : '') +
            `⬇️ Paso 2/3 — Aplicando actualización...`
        )

        execSafe('git stash', { cwd: baseDir })

        const pullResult = execSafe(
            `git pull origin ${BRANCH} --rebase`,
            { cwd: baseDir }
        )

        if (!pullResult.success) {
            execSafe('git stash pop', { cwd: baseDir })

            const forcePull = execSafe(
                `git reset --hard origin/${BRANCH}`,
                { cwd: baseDir }
            )

            if (!forcePull.success) {
                await m.react('❌')

                return m.reply(
                    `❌ *ERROR AL ACTUALIZAR NINO AI 3.0*\n\n` +
                    `> ${pullResult.output?.slice(0, 300)}`
                )
            }
        }

        if (packageJsonChanged) {
            await m.reply(
                `🔧 Paso 3/3 — Detectado cambio en \`package.json\`\n` +
                `> Instalando dependencias...`
            )

            const npmResult = execSafe(
                'npm install --production',
                {
                    cwd: baseDir,
                    timeout: 300000
                }
            )

            if (!npmResult.success) {
                await m.reply(
                    `⚠️ *ERROR EN NPM INSTALL*\n\n` +
                    `> ${npmResult.output?.slice(0, 200)}\n\n` +
                    `> Ejecuta manualmente:\n` +
                    `> \`npm install\``
                )
            }
        }

        const newHash = execSafe(
            'git rev-parse HEAD',
            { cwd: baseDir }
        ).output

        const commitMsg = execSafe(
            'git log -1 --pretty=%s',
            { cwd: baseDir }
        ).output

        const commitAuthor = execSafe(
            'git log -1 --pretty=%an',
            { cwd: baseDir }
        ).output

        const commitDate = execSafe(
            'git log -1 --pretty=%ar',
            { cwd: baseDir }
        ).output

        await m.react('✅')

        await sock.sendMessage(
            m.chat,
            {
                text:
                    `✅ *NINO AI 3.0 ACTUALIZADO CORRECTAMENTE*\n\n` +
                    `╭┈┈⬡「 🌸 RESUMEN 」\n` +
                    `┃ 📁 Archivos: \`${changedCount}\`\n` +
                    `┃ 🔖 Commit: \`${newHash.slice(0, 7)}\`\n` +
                    `┃ 💬 Mensaje: ${commitMsg || '-'}\n` +
                    `┃ 👤 Autor: ${commitAuthor || '-'}\n` +
                    `┃ 🕐 Fecha: ${commitDate || '-'}\n` +
                    `┃ 💗 Repo: \`sebas-mod/Nino-Al-3.0\`\n` +
                    `╰┈┈⬡\n\n` +
                    `> Reiniciando Nino AI 3.0 en 3 segundos...`
            },
            { quoted: m }
        )

        await sock.sendMessage(m.chat, {
            text:
                `🌸 *NINO AI 3.0 BOT*\n\n` +
                `> Listo mi creador 💗\n` +
                `> Ya está todo actualizado correctamente.\n\n` +
                `✨ Nino AI 3.0 se reiniciará ahora...`
        }, { quoted: m })

        setTimeout(() => {
            const isWindows = process.platform === 'win32'

            const command = isWindows
                ? 'cmd.exe'
                : 'node'

            const args = isWindows
                ? ['/c', 'start', '/b', 'node', 'index.js']
                : ['index.js']

            const child = spawn(command, args, {
                cwd: baseDir,
                detached: true,
                stdio: 'ignore',
                shell: isWindows,
                env: {
                    ...process.env,
                    RESTARTED: 'true'
                }
            })

            child.unref()
            process.exit(0)
        }, 3000)

    } catch (error) {
        await m.react('❌')

        return m.reply(
            `❌ *ERROR EN NINO UPDATE*\n\n` +
            `> ${error.message?.slice(0, 300)}`
        )
    }
}

export { pluginConfig as config, handler }
