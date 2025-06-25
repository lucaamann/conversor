const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const fs = require("fs");

const app = express();
const upload = multer({ dest: "/tmp" });

app.post("/convert", upload.single("audio"), (req, res) => {
  const inputPath = req.file.path;
  const outputPath = `/tmp/${req.file.filename}.mp3`;
  console.log(outputPath)
  exec(`ffmpeg -i ${inputPath} -acodec libmp3lame ${outputPath}`, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Erro ao converter");
    }

    res.download(outputPath, "audio.mp3", () => {
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  });
});

app.listen(18500, () => console.log("🚀 FFmpeg API rodando na porta 3000"));
