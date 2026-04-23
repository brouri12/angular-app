## POST `/api/review-todos` (create)

Request:
```json
{
  "userId": 101,
  "questionId": 9001,
  "chapterTitle": "Chapter 3 - Present Perfect",
  "questionTitle": "Choose the correct present perfect form",
  "reviewDate": "2026-04-10",
  "status": "TODO"
}
```

Response `201`:
```json
{
  "id": 1,
  "userId": 101,
  "questionId": 9001,
  "chapterTitle": "Chapter 3 - Present Perfect",
  "questionTitle": "Choose the correct present perfect form",
  "reviewDate": "2026-04-10",
  "status": "TODO",
  "createdAt": "2026-04-01T23:20:15.481"
}
```

## GET `/api/review-todos/user/{userId}`

Response `200`:
```json
[
  {
    "id": 1,
    "userId": 101,
    "questionId": 9001,
    "chapterTitle": "Chapter 3 - Present Perfect",
    "questionTitle": "Choose the correct present perfect form",
    "reviewDate": "2026-04-10",
    "status": "TODO",
    "createdAt": "2026-04-01T23:20:15.481"
  },
  {
    "id": 2,
    "userId": 101,
    "questionId": 9009,
    "chapterTitle": "Chapter 5 - Conditionals",
    "questionTitle": "Pick the right conditional type",
    "reviewDate": "2026-04-11",
    "status": "DONE",
    "createdAt": "2026-04-01T23:21:06.312"
  }
]
```

## PUT `/api/review-todos/{id}` (update)

Request:
```json
{
  "userId": 101,
  "questionId": 9001,
  "chapterTitle": "Chapter 3 - Present Perfect",
  "questionTitle": "Choose the correct present perfect form",
  "reviewDate": "2026-04-12",
  "status": "TODO"
}
```

Response `200`:
```json
{
  "id": 1,
  "userId": 101,
  "questionId": 9001,
  "chapterTitle": "Chapter 3 - Present Perfect",
  "questionTitle": "Choose the correct present perfect form",
  "reviewDate": "2026-04-12",
  "status": "TODO",
  "createdAt": "2026-04-01T23:20:15.481"
}
```

## PATCH `/api/review-todos/{id}/done`

Response `200`:
```json
{
  "id": 1,
  "userId": 101,
  "questionId": 9001,
  "chapterTitle": "Chapter 3 - Present Perfect",
  "questionTitle": "Choose the correct present perfect form",
  "reviewDate": "2026-04-12",
  "status": "DONE",
  "createdAt": "2026-04-01T23:20:15.481"
}
```

## DELETE `/api/review-todos/{id}`

Response `204` (no body)
