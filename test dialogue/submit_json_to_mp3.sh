#!/usr/bin/bash

# script to submit a input json file to openai-tts-svenska cloudflare worker and returns an mp3 file with the same name as the input
# expects secret file to be held in same directory 

# set -x

TTS_URL="https://openai-tts-svenska.christopher-barkhuizen.workers.dev/"

INPUT_DIR="~/Downloads"
INPUT_FILE=$1 

OUTPUT_DIR="~/svenska"
OUTPUT_FILE=$(echo $1 | sed 's%json%mp3%' )

WORKER_SECRET_FILE="worker_secret.txt"
WORKER_SECRET=$(cat $WORKER_SECRET_FILE)


curl -X POST $TTS_URL   -H "Authorization: Bearer $WORKER_SECRET"   -H "Content-Type: application/json"   --data "@$INPUT_DIR/$INPUT_FILE"   --output "$OUTPUT_DIR/$OUTPUT_FILE"
cp "$INPUT_DIR/$INPUT_FILE" "$OUTPUT_DIR/$OUTPUT_FILE"
