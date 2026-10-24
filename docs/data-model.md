# QuickNotes Data Model
**Author:** George  

## 1. Entities and Relationships
- **users**: Stores user account information. (One-to-Many with notes)
- **notes**: Stores the actual note content. Belongs to one user. (Many-to-Many with tags)
- **tags**: Stores unique tag names (e.g., "work", "personal"). 
- **note_tags**: A join table that resolves the many-to-many relationship between notes and tags, allowing a note to have multiple tags and a tag to belong to multiple notes.

## 2. Database Schema (SQL)
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE note_tags (
    note_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);


SELECT n.title, n.body, n.created_at 
FROM notes n
JOIN users u ON n.user_id = u.id
WHERE u.username = 'George';

SELECT n.title, t.name AS tag_name
FROM notes n
JOIN note_tags nt ON n.id = nt.note_id
JOIN tags t ON nt.tag_id = t.id
WHERE t.name = 'work';

SELECT u.username, COUNT(n.id) AS note_count
FROM users u
LEFT JOIN notes n ON u.id = n.user_id
GROUP BY u.id, u.username;

