

curl -X POST https://openai-tts-svenska.christopher-barkhuizen.workers.dev/ \
-H "Content-Type: application/json" \
-d "{\"text\":\"Hej! Hur mår du idag?\"}" \
--output test.mp3

curl -X POST https://openai-tts-svenska.christopher-barkhuizen.workers.dev/ \
  -H "Authorization: Bearer YOUR_WORKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "text":"Hej! Hur mår du idag?",
    "voice":"alloy",
    "speed":0.9,
    "instructions":"Speak in clear Swedish with a authentic Malmö accent."
  }' \
  --output test.mp3