// Extract frame 0 of a video Buffer as a JPEG Buffer using ffmpeg-static.
// Writes the input to a temp file because ffmpeg needs seek (mp4's moov
// atom is normally at the end, so streaming stdin doesn't work for the
// first-frame seek), then reads the JPEG output back into memory.

import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { tmpdir } from "node:os";
import ffmpegPath from "ffmpeg-static";

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolveP, rejectP) => {
    if (!ffmpegPath) {
      rejectP(new Error("ffmpeg-static did not provide a binary path"));
      return;
    }
    const p = spawn(ffmpegPath, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    p.stderr.on("data", (d) => {
      stderr += d.toString();
    });
    p.on("error", rejectP);
    p.on("exit", (code) =>
      code === 0
        ? resolveP()
        : rejectP(new Error(`ffmpeg exit ${code}: ${stderr.slice(-400)}`)),
    );
  });
}

export async function extractFirstFrameJpeg(
  videoBuffer: Buffer,
  opts: { targetWidth: number },
): Promise<Buffer> {
  const dir = await mkdtemp(resolve(tmpdir(), "nextwin-poster-"));
  const videoPath = resolve(dir, "in.mp4");
  const posterPath = resolve(dir, "out.jpg");
  try {
    await writeFile(videoPath, videoBuffer);
    await runFfmpeg([
      "-y",
      "-loglevel",
      "error",
      "-ss",
      "00:00:00",
      "-i",
      videoPath,
      "-frames:v",
      "1",
      "-vf",
      `scale=${opts.targetWidth}:-2`,
      "-q:v",
      "7",
      posterPath,
    ]);
    return await readFile(posterPath);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
