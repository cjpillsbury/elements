import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

const INITIAL_AUTOPLAY = false;
const INITIAL_MUTED = false;


export const toPlaybackIdParts = (playbackIdWithOptionalParams: string): [string, string?] => {
  const qIndex = playbackIdWithOptionalParams.indexOf('?');
  if (qIndex < 0) return [playbackIdWithOptionalParams];
  const idPart = playbackIdWithOptionalParams.slice(0, qIndex);
  const queryPart = playbackIdWithOptionalParams.slice(qIndex);
  return [idPart, queryPart];
};

export const toMuxVideoURL = (playbackId?: string) => {
  if (!playbackId) return undefined;
  const [idPart, queryPart = ''] = toPlaybackIdParts(playbackId);
  return `https://stream.mux.com/${idPart}.m3u8${queryPart}`;
};

function MuxVideoPage() {
  const mediaElRef = useRef(null);
  const [_hls, setHls] = useState<Hls>();
  const [playbackId, _setPlaybackId] = useState("qP5Eb2cj7MrNnoxBGz012pbZkMHqpIcrKMzd7ykGr01gM")
  const [autoplay, setAutoplay] = useState<"muted" | boolean>(INITIAL_AUTOPLAY);
  const [muted, setMuted] = useState(INITIAL_MUTED);
  const [paused, setPaused] = useState<boolean | undefined>(true);
  useEffect(() => {
    if (!(mediaElRef.current && playbackId)) return;
    const hls = new Hls();
    hls.loadSource(toMuxVideoURL(playbackId));
    hls.attachMedia(mediaElRef.current);
    setHls(hls);
  }, [playbackId])

  return (
    <div
      style={{
        display: "flex",
        flexFlow: "column",
        height: "100vh",
        width: "100vw",
      }}
    >
      <h1>MuxVideo Demo</h1>
      <div style={{ flexGrow: 1, flexShrink: 1, height: "400px" }}>
        <video
          ref={mediaElRef}
          style={{ height: "100%", maxWidth: "100%" }}
          // src={toMuxVideoURL("qP5Eb2cj7MrNnoxBGz012pbZkMHqpIcrKMzd7ykGr01gM")}
          // metadata={{
          //   video_id: "video-id-12345",
          //   video_title: "Mad Max: Fury Road Trailer",
          //   viewer_user_id: "user-id-6789",
          // }}
          // envKey="mux-data-env-key"
          controls
          // autoPlay={autoplay}
          muted={muted}
          onPlay={() => {
            setPaused(false);
          }}
          onPause={() => {
            setPaused(true);
          }}
        />
      </div>
      <div>
        <div>
          <label htmlFor="paused-control">Paused</label>
          <input
            id="paused-control"
            type="checkbox"
            onChange={() => setPaused(!paused)}
            checked={paused}
          />
        </div>
        <div>
          <label htmlFor="autoplay-control">Muted Autoplay</label>
          <input
            id="autoplay-control"
            type="checkbox"
            onChange={() => setAutoplay(!autoplay ? "muted" : false)}
            checked={!!autoplay}
          />
        </div>
        <div>
          <label htmlFor="muted-control">Muted</label>
          <input
            id="muted-control"
            type="checkbox"
            onChange={() => setMuted(!muted)}
            checked={muted}
          />
        </div>
      </div>
      <h3 className="title">
        <Link href="/">
          <a>Browse Elements</a>
        </Link>
      </h3>
    </div>
  );
}

export default MuxVideoPage;