# Getting the *actual* mood of a song — suggestions & workflows

Spotify deprecated its `audio-features` and `audio-analysis` endpoints for new
apps (Nov 2024), so Moodify derives mood first-party. This doc explains what is
implemented today, what each signal can and can't tell you, and which upgrades
give the best return.

## What's implemented now

### 1. Preview-clip DSP analysis (backend `POST /analysis/track`)

The Moodify backend downloads the ~30s MP3 preview and computes, in under a
second, with zero external services:

| Signal | How | Reliability |
| --- | --- | --- |
| **Tempo (BPM)** | `music-tempo` (onset + beat tracking), autocorrelation fallback | High for rhythmic music; halves/doubles occasionally (70 vs 140) |
| **Energy** | Mean RMS mapped from dBFS | High |
| **Loudness (dBFS)** | `20·log10(rms)` | High |
| **Beat regularity** | Variance of inter-beat intervals | High |
| **Onset rate** | Spectral-flux peak picking | High |
| **Brightness** | Spectral centroid (Hz) | High |
| **Danceability** | Beat regularity + tempo sweet-spot (90–140) + onset density | Medium — good proxy |
| **Acousticness** | Inverse of brightness/energy/noisiness | Medium |
| **Valence** | Brightness + tempo + regularity heuristic | **Low–medium** — the hard one (see below) |

Even a 10-second clip is enough for tempo, energy, loudness, brightness and
onset rate; danceability and valence estimates get noticeably better with the
full 30s.

### 2. Mood mapping (backend `moodEngine`)

Features are projected onto the **Russell circumplex** (arousal × valence) and
bucketed into 9 moods: `euphoric, energetic, aggressive, groovy, confident,
brooding, serene, dreamy, melancholic`. Each result carries a confidence score
and a `secondaryMood` near bucket boundaries so the frontend can blend visual
themes. Taxonomy is served at `GET /analysis/moods`.

### 3. Artist genres (Spotify)

Tracks don't carry genres, but artists do, and the `/v1/artists` endpoint is
*not* deprecated. The frontend batches one artists call per search and attaches
the union of artist genres to every track. Genres drive the visual language;
mood drives its intensity and tone.

## Where valence (positivity) really comes from — upgrade paths

Acoustics alone can't reliably tell "sad banger" from "happy banger". In order
of effort:

1. **Lyrics sentiment (best lift for effort).** Fetch lyrics (Genius API /
   LRCLIB), run sentiment — either a small local model or one LLM call per
   track, cached forever in `audio_analysis`. Blend: `valence = 0.6·lyrics +
   0.4·acoustic`. Instrumentals fall back to acoustic-only.
2. **Crowd tags.** Last.fm `track.getTopTags` returns tags like "sad",
   "feel-good", "angry" for millions of tracks — free, one HTTP call, great as
   a tie-breaker. MusicBrainz/AcousticBrainz also expose community data.
3. **Key/mode detection.** Add a chroma (pitch-class) profile to the DSP
   pass and Krumhansl-Schmuckler key estimation — minor/major is a strong
   valence prior and also fills the `key`/`mode` columns.
4. **Pretrained music-tagging model (best quality).** Run MTG-Jamendo /
   Essentia models (`mood_happy`, `mood_sad`, `mood_aggressive`,
   `mood_relaxed`, genre tags) on the clip — e.g. `essentia.js` in a worker, or
   a tiny Python sidecar on the existing Modal account. This effectively
   replaces the heuristics with learned estimates.

## Recommended production workflow

```
search/select track
  ├─ palette       ← backend /palette (sharp decode: JPEG/PNG/WebP/AVIF…)
  ├─ genres        ← batched Spotify /v1/artists (cached 24h)
  ├─ previewUrl    ← spotify-preview-finder → iTunes Search fallback
  └─ POST /analysis/track { previewUrl, spotifyId }   (async, persisted)
        ├─ DSP features (tempo, energy, …)
        ├─ moodEngine → mood + confidence (+ secondaryMood)
        └─ stored in tracks: audio features + mood + audio_analysis JSONB
frontend
  └─ buildSceneConfig({genres, mood, tempo, energy, valence, palette, seed})
        → unique-per-visit 3D scene, blended across genre families
```

Operational tips:

- **Queue, don't block.** `audio_features_status` already models
  unprocessed → processing → processed; a small worker draining
  `getUnprocessedTracks()` keeps search latency unaffected.
- **Cache aggressively.** Analysis of a given preview never changes — keyed by
  `spotifyId`, it's write-once.
- **Store raw + derived.** The full analysis snapshot goes to
  `audio_analysis` JSONB, so mood-mapping improvements can be re-run without
  re-downloading audio.
- **Trust thresholds.** Below ~0.5 mood confidence, let genre dominate the
  visuals instead of the mood label.
