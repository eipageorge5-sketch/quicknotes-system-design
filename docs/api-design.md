# QuickNotes API Design Document
**Author:** George  
**Version:** 1.0  

## 1. REST Endpoints
The QuickNotes API will expose the following RESTful endpoints for managing notes and tags.

| Method | Path | Description | Success Status |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notes` | Retrieve a paginated list of notes for the authenticated user. | `200 OK` |
| `GET` | `/api/notes/{id}` | Retrieve the details of a specific note by its ID. | `200 OK` |
| `POST` | `/api/notes` | Create a new note for the authenticated user. | `201 Created` |
| `PUT` | `/api/notes/{id}` | Update the title or body of an existing note. | `200 OK` |
| `DELETE` | `/api/notes/{id}` | Permanently delete a specific note. | `204 No Content` |
| `GET` | `/api/notes?tag={name}` | Retrieve a list of notes filtered by a specific tag. | `200 OK` |

## 2. JSON Examples

### Create a Note (POST /api/notes)
**Request Body:**
```json
{
  "title": "Meeting with George",
  "body": "Discuss Q4 project milestones and system design.",
  "tag_ids": [1, 3]
}


{
  "id": 101,
  "user_id": 1,
  "title": "Meeting with George",
  "body": "Discuss Q4 project milestones and system design.",
  "created_at": "2026-10-25T14:30:00Z",
  "tags": ["work", "urgent"]
}

{
  "data": [
    { "id": 101, "title": "Meeting with George", "created_at": "2026-10-25T14:30:00Z" },
    { "id": 100, "title": "Grocery List", "created_at": "2026-10-24T09:00:00Z" }
  ],
  "meta": { "total": 2, "page": 1, "limit": 10 }
}


{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The 'title' field is required and cannot be empty."
  }
}

## 4. Error Handling and Status Codes
The API will return consistent JSON error objects for all failures to help the frontend client handle them gracefully.

| Status Code | Name | Example Scenario |
| :--- | :--- | :--- |
| `400` | Bad Request | The client sent a POST request with a missing `title` field or a title exceeding 100 characters. |
| `401` | Unauthorized | The request is missing a valid JWT authentication token, or the token has expired. |
| `403` | Forbidden | An authenticated user attempts to DELETE or UPDATE a note that belongs to a different user. |
| `404` | Not Found | A GET request is made for `/api/notes/999` but no note with that ID exists in the database. |
| `500` | Internal Server Error | An unexpected failure occurs on the server, such as the database connection dropping during a write operation. |

**Example Error Response Body:**
Whenever an error occurs, the API will return a JSON object in this format:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The 'title' field is required and cannot be empty.",
    "status": 400
  }
}
