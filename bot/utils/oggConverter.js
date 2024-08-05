import path, { dirname } from "path";
import { unlink } from "fs/promises";
import installer from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";

export class OggConverter {
  directory;
  mp3Path;

  constructor(filepath) {
    ffmpeg.setFfmpegPath(installer.path);
    this.filepath = filepath;
    this.setDirectory();
  }

  toMp3(filename) {
    return new Promise(resolve => {
      this.mp3Path = path.resolve(this.directory, `${filename}.mp3`);

      ffmpeg(this.filepath)
        .inputOption("-t 30")
        .output(this.mp3Path)
        .on("end", () => resolve(this.mp3Path))
        .run();
    });
  }

  async delete() {
    await unlink(this.mp3Path);
  }

  setDirectory() {
    this.directory = path.resolve(dirname(this.filepath));
  }
}
