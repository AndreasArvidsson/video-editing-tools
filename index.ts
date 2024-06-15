import * as os from "node:os";
import * as path from "node:path";
import { concatSubFiles } from "./lib";

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
