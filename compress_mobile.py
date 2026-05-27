import imageio_ffmpeg
import subprocess
import sys
import os

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
input_file = "public/mobile-video.mp4"
output_file = "public/mobile-video-compressed.mp4"

command = [
    ffmpeg_exe,
    "-y",
    "-i", input_file,
    "-an", # remove audio
    "-c:v", "libx264",
    "-crf", "32", # even higher CRF for more compression
    "-preset", "faster",
    "-vf", "scale=-2:480", # scale to 480p height
    "-r", "24", # lower framerate
    output_file
]

print("Running ffmpeg for mobile compression...")
result = subprocess.run(command, capture_output=True, text=True)

if result.returncode == 0:
    print("Successfully compressed for mobile!")
    print(f"Original size: {os.path.getsize(input_file) / (1024*1024):.2f} MB")
    print(f"New size: {os.path.getsize(output_file) / (1024*1024):.2f} MB")
else:
    print("Error during compression:")
    print(result.stderr)
    sys.exit(1)
