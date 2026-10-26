import React, { useEffect, useState } from "react";
import { LuPlay } from "react-icons/lu";
import "./VideoReviews.css";
import { fetchVideoReviews } from "../../services/videoReviewService";
import { fallbackVideoReviews } from "../../data/videoReviews";

/**
 * "What Our Customers Are Saying" — real customer video testimonials.
 *  - Poster + play button first; the video file is only requested after the
 *    customer taps play (keeps the homepage light, and nothing autoplays).
 *  - Only one video plays at a time.
 *  - A name is shown only if one was supplied by the business.
 */
function VideoCard({ video, index, playing, onPlay, onStop }) {
  const who = video.customerName?.trim();
  const label = who ? `Customer review from ${who}` : `Customer review ${index + 1}`;

  return (
    <article className="vr-card">
      <div className="vr-frame">
        {playing ? (
          <video
            className="vr-video"
            src={video.videoUrl}
            poster={video.posterUrl || undefined}
            controls
            autoPlay
            playsInline
            preload="auto"
            aria-label={label}
            onEnded={onStop}
          />
        ) : (
          <button
            type="button"
            className="vr-poster"
            onClick={onPlay}
            aria-label={`Play ${label.toLowerCase()}`}
          >
            {video.posterUrl && (
              <img src={video.posterUrl} alt="" loading="lazy" decoding="async" />
            )}
            <span className="vr-play" aria-hidden="true"><LuPlay /></span>
          </button>
        )}
      </div>
      <div className="vr-meta">
        <strong>{who || "Customer review"}</strong>
        {video.caption && <span>{video.caption}</span>}
      </div>
    </article>
  );
}

function VideoReviews({ variant = "home" }) {
  const [videos, setVideos] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [playingId, setPlayingId] = useState(null);

  useEffect(() => {
    let alive = true;
    fetchVideoReviews()
      .then((v) => alive && setVideos(v))
      .catch(() => alive && setVideos(fallbackVideoReviews)) // API unreachable only
      .finally(() => alive && setLoaded(true));
    return () => { alive = false; };
  }, []);

  // Nothing approved to show — don't render an empty section.
  if (!loaded || videos.length === 0) return null;

  return (
    <section className={`vr vr-${variant}`} aria-labelledby={`vr-title-${variant}`}>
      <div className="vr-inner">
        <h2 id={`vr-title-${variant}`} className="vr-title">What Our Customers Are Saying</h2>
        <p className="vr-sub">Real moments, real feedback, and love for Mublat Bakes &amp; Blends.</p>
        <div className="vr-line" aria-hidden="true"></div>

        <div className="vr-track" role="list">
          {videos.map((v, i) => (
            <div role="listitem" className="vr-slide" key={v._id}>
              <VideoCard
                video={v}
                index={i}
                playing={playingId === v._id}
                onPlay={() => setPlayingId(v._id)}
                onStop={() => setPlayingId(null)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default VideoReviews;
