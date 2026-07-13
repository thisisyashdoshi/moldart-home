from pathlib import Path
import wave
import numpy as np

SR = 44100
DURATION = 15.0
OUT = Path(r"C:/Users/recoveryadmin/OneDrive - Deco Metal/WORK/OTHERS/MASTER - YASH/MARKETING/TECH/WEBSITE/existing-new/work/reels/moldart-remotion-reel-v2/public/music.wav")

N = int(SR * DURATION)
t = np.arange(N, dtype=np.float64) / SR
left = np.zeros(N, dtype=np.float64)
right = np.zeros(N, dtype=np.float64)

chords = [
    (0.0, 3.0, [220.00, 261.63, 329.63, 493.88]),
    (3.0, 6.0, [174.61, 220.00, 261.63, 329.63]),
    (6.0, 9.0, [196.00, 261.63, 329.63, 493.88]),
    (9.0, 12.0, [196.00, 246.94, 293.66, 329.63]),
    (12.0, 15.0, [220.00, 261.63, 329.63, 493.88]),
]

pulse_notes = np.array([220.00, 261.63, 293.66, 329.63, 392.00], dtype=np.float64)


def smoothstep(x):
    x = np.clip(x, 0.0, 1.0)
    return x * x * (3.0 - 2.0 * x)


for start, end, notes in chords:
    a = smoothstep((t - start) / 1.0)
    r = smoothstep((end - t) / 1.2)
    env = np.minimum(a, r)
    env[(t < start) | (t > end)] = 0.0
    for idx, f in enumerate(notes):
        detune = 1.0 + (((idx % 2) * 2) - 1) * 0.0018
        amp = 0.028 / (1 + idx * 0.22)
        mod = 0.86 + 0.14 * np.sin(2 * np.pi * (0.08 + idx * 0.011) * t + idx)
        left += amp * mod * (0.72 * np.sin(2 * np.pi * f * t) + 0.28 * np.sin(2 * np.pi * f * detune * t + 0.6)) * env
        right += amp * mod * (0.72 * np.sin(2 * np.pi * f * detune * t + 0.35) + 0.28 * np.sin(2 * np.pi * f * t + 0.18)) * env

pulse_idx = np.floor(t / 0.75).astype(int)
pulse_start = pulse_idx * 0.75
pulse_t = t - pulse_start
pulse_mask = (pulse_t >= 0) & (pulse_t <= 0.55)
pulse_env = np.exp(-5.6 * pulse_t) * smoothstep(np.minimum(1.0, pulse_t / 0.02))
pulse_freq = pulse_notes[pulse_idx % len(pulse_notes)]
triangle = (2 / np.pi) * np.arcsin(np.sin(2 * np.pi * pulse_freq * 2 * t))
pluck = 0.06 * pulse_env * (0.75 * triangle + 0.25 * np.sin(2 * np.pi * pulse_freq * 4 * t))
pluck *= pulse_mask
left += pluck * 0.85
right += pluck

bar_pos = np.mod(t, 3.0)
sub_env = np.exp(-3.8 * bar_pos) * smoothstep(np.minimum(1.0, bar_pos / 0.04))
sub_env *= (bar_pos < 0.8)
sub = 0.045 * sub_env * np.sin(2 * np.pi * 55.0 * t)
left += sub
right += sub

shimmer = 0.0055 * np.sin(2 * np.pi * 1200 * t + 0.2) * (0.55 + 0.45 * np.sin(2 * np.pi * 0.13 * t))
left += shimmer
right -= shimmer * 0.7

left = np.clip(left * 0.92, -0.92, 0.92)
right = np.clip(right * 0.92, -0.92, 0.92)

stereo = np.stack([left, right], axis=1)
pcm = np.int16(stereo * 32767)

OUT.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(OUT), 'wb') as wav:
    wav.setnchannels(2)
    wav.setsampwidth(2)
    wav.setframerate(SR)
    wav.writeframes(pcm.tobytes())

print(OUT)
