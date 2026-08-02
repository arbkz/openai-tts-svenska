# TODO

## High Priority

### Per-segment pauses

Support:

```json
{
  "pause_after_ms": 4000
}
```

The worker should insert silence between generated speech segments.

---

### Repeat-after-me lessons

Support lesson-level pauses:

```json
{
  "repeat_pause_ms": 4000,
  "closing_pause_ms": 5000
}
```

This enables shadowing exercises.

---

### Per-segment voices

Support:

```json
{
  "segments":[
    {
      "voice":"male",
      "text":"Hej!"
    },
    {
      "voice":"female",
      "text":"Hej!"
    }
  ]
}
```

---

### Voice mapping

Rather than exposing OpenAI voice names directly, support:

```
male
female
narrator
teacher
student
```

and map them internally.

---

### Health endpoint

Support:

```
GET /
```

Response:

```json
{
  "status":"ok",
  "version":"1.0.0"
}
```

---

### Logging

Improve diagnostics by logging:

- request id
- elapsed time
- character count
- response size

without logging lesson text.

---

## Medium Priority

### Configurable output filename

Allow

```json
{
    "filename":"lesson01.mp3"
}
```

---

### Response metadata

Return useful headers:

- synthesis duration
- generated characters
- request id

---

### Input validation

Validate:

- maximum text length
- maximum segment count
- empty segments
- invalid speed
- unsupported voices

---

### Rate limiting

Prevent abuse of the worker.

---

### Caching

Cache identical requests to reduce API usage.

---

## Future Lesson Format

The long-term JSON format should become:

```json
{
  "voice":"alloy",
  "speed":0.9,
  "instructions":"Speak in clear Swedish with a light Malmö accent suitable for an intermediate learner.",

  "repeat_pause_ms":4000,
  "closing_pause_ms":5000,

  "segments":[
    {
      "voice":"male",
      "text":"Hej!",
      "pause_after_ms":4000
    },
    {
      "voice":"female",
      "text":"Hej själv!",
      "pause_after_ms":3000
    }
  ]
}
```

---

## Long-term Goals

- Multiple speakers
- Automatic pause generation
- Repeat-after-me lessons
- Android client
- ZIP output (MP3 + lesson text + Anki deck)
- Optional SSML support (if supported by the API)
- Multiple output formats (mp3, wav, opus)