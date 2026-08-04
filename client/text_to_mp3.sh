#!/usr/bin/env bash

# dependencies ffmpeg and jq

# in windows install with
# $ winget install "FFmpeg (Essentials Build)"
# $ winget install "jq"


set -euo pipefail

source config.sh

if [[ $# -ne 1 ]]; then
    echo "Usage: $0 <lesson.txt>"
    exit 1
fi

INPUT_FILE="$1"

if [[ ! -f "$INPUT_FILE" ]]; then
    echo "Input file not found: $INPUT_FILE"
    exit 1
fi

OUTPUT_PREFIX="${INPUT_FILE%.*}_"

i=1

while IFS= read -r TEXT || [[ -n "$TEXT" ]]
do
    # Skip blank lines
    [[ -z "$TEXT" ]] && continue

    OUTPUT_FILE=$(printf "%s%03d.mp3" "$OUTPUT_PREFIX" "$i")

    echo "Generating $OUTPUT_FILE"

    jq -n \
        --arg text "$TEXT" \
        --arg voice "$VOICE" \
        --arg instructions "$INSTRUCTIONS" \
        --argjson speed "$SPEED" \
        '{
            text: $text,
            voice: $voice,
            speed: $speed,
            instructions: $instructions
        }' |
    curl --silent --show-error \
        -X POST "$TTS_URL" \
        -H "Authorization: Bearer $WORKER_SECRET" \
        -H "Content-Type: application/json" \
        --data @- \
        --output "$OUTPUT_FILE"

    ((i++))

done < "$INPUT_FILE"

echo "Done."