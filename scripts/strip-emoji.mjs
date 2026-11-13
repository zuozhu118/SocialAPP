/**
 * 一次性脚本：清除项目内所有彩色 emoji（颜文字）
 * - 纯文本符号（→ ✓ ✕ › ‹ ⋯ ↗ ✎ ★ ☆ ⚠ ♂ ♀ ⚑）保留，它们是图标体系的一部分
 * - 特殊映射：✅→✓ ❌→✕ ❓→？ ⭐→★ ❤️/🤍→♥
 * - 其余彩色 emoji 一律删除，并清理残留空格
 * 用法：node scripts/strip-emoji.mjs
 */
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(process.cwd(), 'src')
const EXCLUDE = new Set([path.join(ROOT, 'styles', 'icons.scss')])
const EXTS = new Set(['.vue', '.js', '.json', '.scss'])

// 先做显式映射，再做通用删除
const explicit = [
    ['✅', '✓'],
    ['❌', '✕'],
    ['❓', '？'],
    ['⭐', '★'],
    ['❤️', '♥'],
    ['❤', '♥'],
    ['🤍', '♥'],
    ['⚠️', '⚠'],
    ['️', ''] // 兜底：孤立 FE0F 变体选择符
]

// 通用删除：SMP emoji、杂项符号区、TODO 除外（♀♂★☆⚠✓✕→ 等纯文本符号保留）
const stripRe = /[\u{1F000}-\u{1FAFF}]|[\u{2300}-\u{23FF}]|[\u{2139}]|[\u{2B00}-\u{2BFF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu
const keepRe = /[\u2640\u2642\u2605\u2606\u26A0\u2713\u2715]/u

function cleanSpaces(text) {
    return text
        .replace(/[ \t]+([，。！？；：、）」』”？！])/g, '$1') // 标点前空格
        .replace(/[ \t]{2,}/g, ' ')                          // 连续空格
}

let touched = []

function walk(dir) {
    for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name)
        const stat = fs.statSync(full)
        if (stat.isDirectory()) {
            walk(full)
            continue
        }
        if (!EXTS.has(path.extname(full)) || EXCLUDE.has(full)) continue

        const before = fs.readFileSync(full, 'utf8')
        let after = before
        for (const [from, to] of explicit) after = after.split(from).join(to)
        after = after.replace(stripRe, (ch) => (keepRe.test(ch) ? ch : ''))

        if (after !== before) {
            after = cleanSpaces(after)
            fs.writeFileSync(full, after, 'utf8')
            touched.push(path.relative(process.cwd(), full))
        }
    }
}

walk(ROOT)
console.log(`cleaned ${touched.length} files:`)
touched.forEach(f => console.log('  ' + f))
