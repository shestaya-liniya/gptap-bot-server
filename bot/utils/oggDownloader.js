import https from "https";
import path, { dirname } from "path";
import { createWriteStream, existsSync, mkdirSync } from "fs";
import { unlink } from "fs/promises";

export class OggDownloader {
  oggPath;
  directory = path.join(path.resolve(),'voices');

  constructor(url) {
    this.createDirectoryIfNotExists();
    this.url = url;
  }

  download(filename) {
    return new Promise(resolve => {
      this.oggPath = path.resolve(this.directory, `${filename}.ogg`);

      const stream$ = createWriteStream(this.oggPath);

      https.get(this.url, response => {
        response.pipe(stream$);

        stream$.on("finish", () => {
          resolve(this.oggPath);
        });
      });
    });
  }

  async delete() {
    await unlink(this.oggPath);
  }

  createDirectoryIfNotExists() {
    // if (!existsSync(this.directory)) {
    //   mkdirSync(this.directory, { recursive: true });
    // }
  }
}
