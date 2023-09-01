import { Link } from "react-router-dom";
import MuxVideo from "@mux/mux-video-react";
import "@mux/mux-video";
import { useState } from "react";

const createPlayerId = () => {
  return crypto.randomUUID();
};

const createPlayerIds = (count = 20) => {
  return Array.from({ length: count }).map(() => createPlayerId());
};

const MVR = () => {
  return <MuxVideo
    playbackId="23s11nz72DsoN657h4314PjKKjsF2JG33eBQQt6B95I"
    streamType="on-demand"
    controls
    muted
  />;
};

const MV = () => {
  /** @ts-ignore */
  return <mux-video
    playback-id="23s11nz72DsoN657h4314PjKKjsF2JG33eBQQt6B95I"
    stream-type="on-demand"
    controls
    muted
    /** @ts-ignore */
  ></mux-video>;
};

function MuxVideoPage() {
  const [playerIds, setPlayerIds] = useState<string[]>([]);
  const [renderWC, setRenderWC] = useState(true);
  const VideoComponent = renderWC ? MV : MVR;
  console.log('playerIds', ...playerIds);
  return (
    <>
      <style>
        {`video {
          display: block;
          width: 100%;
          aspect-ratio: 16 / 9;
          margin: 1rem 0 2rem;
        }`}
      </style>
      <div>
      <button onClick={() => {
        setPlayerIds(prevPlayerIds => [...prevPlayerIds, ...createPlayerIds()]);
      }}>Add Players</button>
      <button onClick={() => {
        setPlayerIds([]);
      }}>Remove All Players</button>
      <input id="wc-cb" checked={renderWC} type="checkbox" onChange={({ target }) => setRenderWC(target.checked)}></input><label htmlFor="wc-cb">Render Web Component?</label>
      </div>
      {playerIds.map(key => (<VideoComponent key={key}/>))}
      <Link to="/">Browse Elements</Link>
    </>
  );
}

export default MuxVideoPage;
