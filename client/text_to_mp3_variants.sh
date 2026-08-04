#!/usr/bin/env bash

# Dependencies:
#   ffmpeg
#   jq
#
# Windows:
#   winget install "FFmpeg (Essentials Build)"
#   winget install "jqlang.jq"

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

LESSON_NAME="${INPUT_FILE%.*}"
OUTPUT_PREFIX="${LESSON_NAME}_"

CONTINUOUS_LIST=".continuous.txt"
SHADOW_LIST=".shadow.txt"

PAUSE_SECONDS=$(awk "BEGIN {print $PAUSE_MS/1000}")
SILENCE_FILE="silence.mp3"

echo "Generating ${PAUSE_MS}ms silence..."

ffmpeg \
    -loglevel error \
    -f lavfi \
    -i anullsrc=r=24000:cl=mono \
    -t "$PAUSE_SECONDS" \
    -q:a 9 \
    "$SILENCE_FILE"

FIRST=true
i=1

grep -v '^[[:space:]]*$' "$INPUT_FILE" |
tr -d '\r' |
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
    curl \
        --silent \
        --show-error \
        -X POST "$TTS_URL" \
        -H "Authorization: Bearer $WORKER_SECRET" \
        -H "Content-Type: application/json" \
        --data @- \
        --output "$OUTPUT_FILE"

    #
    # Continuous lesson
    #
    echo "file '$OUTPUT_FILE'" >> "$CONTINUOUS_LIST"

    #
    # Shadow lesson
    #
    if ! $FIRST
    then
        echo "file '$SILENCE_FILE'" >> "$SHADOW_LIST"
    fi

    echo "file '$OUTPUT_FILE'" >> "$SHADOW_LIST"

    FIRST=false
    ((i++))

    sleep 1

done

echo
echo "Generating ${LESSON_NAME}_continuous.mp3..."

ffmpeg \
    -loglevel error \
    -f concat \
    -safe 0 \
    -i "$CONTINUOUS_LIST" \
    -c copy \
    "${LESSON_NAME}_continuous.mp3"

echo
echo "Generating ${LESSON_NAME}_shadow.mp3..."

ffmpeg \
    -loglevel error \
    -f concat \
    -safe 0 \
    -i "$SHADOW_LIST" \
    -c copy \
    "${LESSON_NAME}_shadow.mp3"

rm -f \
    "$CONTINUOUS_LIST" \
    "$SHADOW_LIST" \
    "$SILENCE_FILE"

echo

rm -f "$CONTINUOUS_LIST" "$SHADOW_LIST"

echo "Finished."