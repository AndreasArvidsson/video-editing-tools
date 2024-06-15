# Video editing tools

Useful scripts based around [ffmpeg](https://ffmpeg.org) to cut and concatenate video files. Used for hands free video editing [YouTube](https://www.youtube.com/@andreas_arvidsson).

## Concatenate parts of multiple files

1. Edit [index.ts](./index.ts) with your file sources
2. Run `npm start`
3. In your working directory there is now a `video-editing-tools` dir with an `output` file

```ts
concatSubFiles(
    // Working directory
    path.join(os.homedir(), "Videos"),
    [
        // FILE_NAME                TS_FROM     TS_TO
        ["2024-06-15 14-39-37.mkv", "00:00:30", "00:02:03"],
        ["2024-06-15 15-45-10.mkv", "00:01:30", "00:02:03"],
        ["2024-06-15 14-39-37.mkv", "00:01:30", "00:02:03"],
    ]
);
```
