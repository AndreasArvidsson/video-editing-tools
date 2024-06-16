import * as cp from "child_process";
import * as path from "node:path";
import * as fs from "node:fs";

// AAC
const codecAudio = "aac";

// Copy audio without encoding
// const codecAudio = "copy";

// H.265/HEVC with hardware encoding for AMD GPUs
const codecVideo = "hevc_amf";

// H.265/HEVC with hardware encoding for Nvidia GPUs
// const codecVideo = "hevc_nvenc";

// Copy video without encoding
// const codecVideo = "copy";

type Timestamp = `${number}:${number}:${number}`;

type FileArg = [string, Timestamp, Timestamp];

interface File {
    fileName: string;
    sourcePath: string;
    destinationPath: string;
    from: Timestamp;
    to: Timestamp;
}

function ffmpeg(args: string[]) {
    console.log(`ffmpeg ${args.join(" ")}`);

    const { status, signal, error } = cp.spawnSync("ffmpeg", args, {
        encoding: "utf-8",
        stdio: "inherit",
    });

    if (status !== 0) {
        console.log("status: ", status);
    }
    if (signal) {
        console.log("signal: ", signal);
    }
    if (error) {
        console.log("error: ", error);
    }
}

function trimFile(
    sourcePath: string,
    destinationPath: string,
    from: Timestamp,
    to: Timestamp
) {
    // $ ffmpeg -i input.mp4 -ss 00:05:10 -to 00:15:30 -c copy output2.mp4
    ffmpeg([
        "-i",
        sourcePath,
        "-ss",
        from,
        "-to",
        to,
        "-c:a",
        codecAudio,
        "-c:v",
        codecVideo,
        destinationPath,
    ]);
}

function concatFiles(dirPath: string, fileExt: string, files: string[]) {
    const textFilePath = path.join(dirPath, "files.txt");
    const outputFilePath = path.join(dirPath, `output${fileExt}`);
    fs.writeFileSync(textFilePath, files.map((f) => `file '${f}'`).join("\n"));

    // ffmpeg -f concat -safe 0 -i mylist.txt -c copy output.wav
    ffmpeg([
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        textFilePath,
        "-c:a",
        codecAudio,
        "-c:v",
        codecVideo,
        outputFilePath,
    ]);
}

function getDestinationFolderPath(sourceFolderPath: string) {
    const date = new Date()
        .toLocaleDateString("sv", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        })
        .replace(" ", "T")
        .replaceAll(":", "-");
    return path.join(sourceFolderPath, `video-editing-tools-${date}`);
}

function getFileExt(fileNames: string[]): string {
    const extensions = new Set(fileNames.map((f) => path.extname(f)));
    if (extensions.size === 0) {
        throw Error("Can't find file extension");
    }
    if (extensions.size > 1) {
        throw Error("All files must have the same file extension");
    }
    return extensions.values().next().value;
}

function getFullFiles(
    cwd: string,
    destinationDirPath: string,
    fileArgs: FileArg[]
): File[] {
    return fileArgs.map(([fileName, from, to], i): File => {
        const sourcePath = path.join(cwd, fileName);
        const destinationPath = path.join(
            destinationDirPath,
            `${i} - ${fileName}`
        );
        if (!fs.existsSync(sourcePath)) {
            throw Error(`file '${sourcePath}' doesn't exist`);
        }
        return {
            fileName,
            sourcePath,
            destinationPath,
            from,
            to,
        };
    });
}

export function concatSubFiles(cwd: string, fileArgs: FileArg[]) {
    if (!fs.existsSync(cwd)) {
        throw Error(`cwd '${cwd}' doesn't exist`);
    }

    const destinationDirPath = getDestinationFolderPath(cwd);
    const files = getFullFiles(cwd, destinationDirPath, fileArgs);
    const fileExt = getFileExt(files.map((f) => f.fileName));

    fs.mkdirSync(destinationDirPath, { recursive: true });

    for (const file of files) {
        trimFile(file.sourcePath, file.destinationPath, file.from, file.to);
    }

    concatFiles(
        destinationDirPath,
        fileExt,
        files.map((f) => f.destinationPath)
    );
}
