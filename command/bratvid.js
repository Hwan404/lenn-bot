require('../settings/config');

let handler = async (m, { client, text, reaction, reply, prefix, command }) => {
  if (!text) return reply(`\n*ex:* ${prefix + command} apanih cok\n`)
  const media = `https://apizell.web.id/tools/bratanimate?q=${text}`;
  await reaction(m.chat, "⚡")

  client.sendVideoAsSticker(m.chat, media, m, {
    packname: packname,
    author: author
  });
}

handler.help = ['sticker brat'];
handler.tags = ['sticker'];
handler.command = ["bratvid", "bratvideo"];

module.exports = handler;
