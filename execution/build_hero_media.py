#!/usr/bin/env python3
"""Generate poster frames for the hero background videos.

The hero plays full-quality master videos - this is a video production
company's showreel, so visible compression artifacts cost more than the extra
bytes. What makes the hero appear instantly is the poster, not a smaller video.

Each clip gets a poster cut from its own frame 0, so the handover from still
to video is seamless. Posters are written to:

    assets/images/hero/<name>.webp

The poster inherits opacity: 0.5 and .hero-gradient from the page, so it must
NOT be pre-darkened here - that would apply the effect twice.

Originals are never modified.

Usage:
    python3 execution/build_hero_media.py              # posters only (default)
    python3 execution/build_hero_media.py --with-video # also write <name>_720.webm

The --with-video path exists for experimentation. Those files are not what the
site loads: a 720p re-encode was tried and rejected for showing visible edge
artifacts on detailed, brighter footage.
"""
import pathlib
import subprocess
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
VIDEO_DIR = ROOT / "assets" / "video"
POSTER_DIR = ROOT / "assets" / "images" / "hero"

# (source stem, poster width, video width) - heights follow the source aspect.
# Posters are generous: they are the first thing a visitor sees and they stand
# in for a showreel, so crispness matters more than the handful of KB.
CLIPS = [
    ("Hero-bg_01", 1920, 1280), ("Hero-bg_02", 1920, 1280), ("Hero-bg_03", 1920, 1280),
    ("Hero-bg_9_16_01", 1080, 720), ("Hero-bg_9_16_02", 1080, 720),
    ("Hero-bg_9_16_03", 1080, 720),
]

# Constrained quality: CRF sets the quality floor, -b:v caps the peak.
# CRF 42 / ~450k was chosen by comparing SSIM and rendered frames against
# higher-quality encodes: at opacity 0.5 under .hero-gradient the difference
# is not visible, so the extra bitrate buys nothing a visitor can see.
VIDEO_BITRATE = {1280: "450k", 720: "400k"}
CRF = "42"
POSTER_QUALITY = "82"


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print("  FAILED: " + " ".join(cmd[:6]) + " ...", file=sys.stderr)
        print("  " + r.stderr.strip().splitlines()[-1] if r.stderr.strip() else "", file=sys.stderr)
        return False
    return True


def probe(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=width,height", "-show_entries", "format=size,bit_rate",
         "-of", "default=nw=1:nk=1", str(path)],
        capture_output=True, text=True).stdout.split()
    return out if len(out) == 4 else None


def mb(path):
    return path.stat().st_size / 1048576


def build_poster(src, stem, width):
    POSTER_DIR.mkdir(parents=True, exist_ok=True)
    out = POSTER_DIR / (stem + ".webp")
    ok = run(["ffmpeg", "-y", "-v", "error", "-i", str(src), "-frames:v", "1",
              "-vf", "scale=%d:-2" % width, "-c:v", "libwebp",
              "-quality", POSTER_QUALITY, "-compression_level", "6", str(out)])
    return out if ok and out.is_file() else None


def build_video(src, stem, width):
    out = VIDEO_DIR / (stem + "_720.webm")
    ok = run(["ffmpeg", "-y", "-v", "error", "-i", str(src),
              "-vf", "scale=%d:-2" % width,
              "-c:v", "libvpx-vp9", "-crf", CRF, "-b:v", VIDEO_BITRATE[width],
              "-row-mt", "1", "-cpu-used", "2", "-tile-columns", "2",
              "-an",                                  # sources carry no audio
              str(out)])
    return out if ok and out.is_file() else None


def main():
    posters_only = "--with-video" not in sys.argv
    before = after = 0.0
    print("%-22s %-12s %-12s %s" % ("CLIP", "BEFORE", "AFTER", "POSTER"))

    for stem, poster_w, video_w in CLIPS:
        src = VIDEO_DIR / (stem + ".webm")
        if not src.is_file():
            print("  missing source: %s" % src.name, file=sys.stderr)
            continue

        poster = build_poster(src, stem, poster_w)
        vid = None if posters_only else build_video(src, stem, video_w)

        before += mb(src)
        if vid:
            after += mb(vid)
        print("%-22s %-12s %-12s %s" % (
            stem,
            "%.1f MB" % mb(src),
            ("%.1f MB" % mb(vid)) if vid else "-",
            ("%.0f KB" % (poster.stat().st_size / 1024)) if poster else "FAILED"))

    if after:
        print("\nTotal video: %.1f MB -> %.1f MB  (-%.0f%%)"
              % (before, after, 100 * (before - after) / before))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
