const express = require("express");
const { exec } = require("child_process");
const fs = require("fs");
const axios = require("axios");
const path = require("path");
const emoji = require('node-emoji');

const app = express();
app.use(express.json({ limit: "50mb" })); // suporte a base64 grandes

function replaceShortcodesWithEmojis(text) {
  const regex = /:[a-zA-Z0-9_+\-]+:/g;
  console.log(text)
  return text.replace(regex, match => emoji.get(match) || match);
}

app.post("/emoji", async (req, res) => {
  try {
    const {message} = req.body
    const msgComEmojis = await replaceShortcodesWithEmojis(message);

    console.log(msgComEmojis)
    res.send(msgComEmojis)
  } catch (e) {
    console.error("Erro geral:", e);
    res.status(500).send("Erro no processamento do áudio");
  }
})

app.post("/convert", async (req, res) => {
  try {
    const { audioUrl, audioBase64 } = req.body;
    const tempInputPath = `/tmp/input.ogg`;
    const tempOutputPath = `/tmp/output.mp3`;

    // Baixar ou salvar o áudio
    if (audioUrl) {
      const response = await axios.get(audioUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(tempInputPath, response.data);
    } else if (audioBase64) {
      const buffer = Buffer.from(audioBase64, "base64");
      fs.writeFileSync(tempInputPath, buffer);
    } else {
      return res.status(400).send("Envie audioUrl ou audioBase64");
    }

    // Converter com ffmpeg
    const cmd = `ffmpeg -y -i "${tempInputPath}" -acodec libmp3lame "${tempOutputPath}"`;
    exec(cmd, (err) => {
      if (err) {
        console.error("Erro na conversão:", err);
        return res.status(500).send("Erro ao converter o áudio");
      }

      res.download(tempOutputPath, "audio.mp3", () => {
        fs.unlinkSync(tempInputPath);
        fs.unlinkSync(tempOutputPath);
      });
    });
  } catch (e) {
    console.error("Erro geral:", e);
    res.status(500).send("Erro no processamento do áudio");
  }
});



app.listen(18500, () => console.log("🚀 API de conversão rodando na porta 18500"));
