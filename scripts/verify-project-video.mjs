import assert from "node:assert/strict";
import { getPlayableVideo } from "../app/project-video.ts";

assert.equal(getPlayableVideo(undefined), undefined);
assert.equal(getPlayableVideo({ status: "preparing", playbackId: "processing" }), undefined);
assert.equal(getPlayableVideo({ status: "errored", playbackId: "failed" }), undefined);
assert.equal(getPlayableVideo({ status: "ready" }), undefined);
assert.equal(getPlayableVideo({ playbackId: "missing-status" }), undefined);

const ready = { status: "ready", playbackId: "public-playback-id", aspectRatio: 2.39 };
assert.equal(getPlayableVideo(ready), ready);

console.log("Project video states verified.");
