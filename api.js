// Constants
const API_URL = 'https://jsonplaceholder.typicode.com/posts';

// DOM Elements
const loadBtn = document.getElementById('load-btn');
const statusMsg = document.getElementById('status');
const noteForm = document.getElementById('note-form');
const titleInput = document.getElementById('title-input');
const bodyInput = document.getElementById('body-input');
const submitBtn = document.getElementById('submit-btn');
const notesList = document.getElementById('notes-list');

// State to hold notes locally
let localNotes = [];

// Reusable async request function
async function request(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response;
    } catch (error) {
        console.error("Request failed:", error);
        throw error;
    }
}

// Helper: Set status message and class
function setStatus(message, type) {
    statusMsg.textContent = message;
    statusMsg.className = ''; // Clear previous classes
    if (type) statusMsg.classList.add(`status-${type}`);
}

// Helper: Render the list
function renderNotes() {
    notesList.innerHTML = '';
    if (localNotes.length === 0) {
        const li = document.createElement('li');
        li.className = 'empty-state';
        li.textContent = 'No notes to display. Load notes or create a new one.';
        notesList.appendChild(li);
        return;
    }

    localNotes.forEach(note => {
        const li = document.createElement('li');
        li.className = 'note-item';
        
        const h3 = document.createElement('h3');
        h3.className = 'note-title';
        h3.textContent = note.title; // Secure: textContent prevents XSS
        
        const p = document.createElement('p');
        p.className = 'note-body';
        p.textContent = note.body || '(No body)';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteNote(note.id));
        
        li.appendChild(h3);
        li.appendChild(p);
        li.appendChild(deleteBtn);
        notesList.appendChild(li);
    });
}

// TASK 1: GET Notes
loadBtn.addEventListener('click', async () => {
    loadBtn.disabled = true;
    setStatus('Loading notes...', 'loading');
    notesList.innerHTML = '';

    try {
        const response = await request(`${API_URL}?_limit=10`);
        const data = await response.json();
        localNotes = data;
        renderNotes();
        setStatus(`Loaded ${localNotes.length} notes from the server.`, 'success');
    } catch (error) {
        setStatus('Failed to load notes. Please check your connection.', 'error');
    } finally {
        loadBtn.disabled = false;
    }
});

// TASK 2: POST Note
noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = titleInput.value.trim();
    const body = bodyInput.value.trim();

    // Validation
    if (!title) {
        setStatus('Error: Title is required.', 'error');
        return;
    }
    if (title.length > 100) {
        setStatus('Error: Title must be 100 characters or fewer.', 'error');
        return;
    }

    submitBtn.disabled = true;
    setStatus('Creating note...', 'loading');

    try {
        const response = await request(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, body, userId: 1 })
        });
        
        const newNote = await response.json();
        
        // Add to the TOP of our local array
        localNotes.unshift(newNote);
        renderNotes();
        setStatus(`Note created (status ${response.status}, id ${newNote.id}).`, 'success');
        noteForm.reset();
        
    } catch (error) {
        setStatus('Failed to create note.', 'error');
    } finally {
        submitBtn.disabled = false;
    }
});

// TASK 3: DELETE Note
async function deleteNote(id) {
    if (!confirm('Are you sure you want to delete this note?')) return;

    // Find the button and disable it during request
    const buttons = document.querySelectorAll('.delete-btn');
    // (Simplified for this exercise: we just disable the submit btn to show the pattern)
    submitBtn.disabled = true; 
    setStatus('Deleting note...', 'loading');

    try {
        const response = await request(`${API_URL}/${id}`, { method: 'DELETE' });
        
        /* 
         * but it does NOT actually persist the deletion on their server.
         * Therefore, I optimistically update the UI by removing it from 
         * our localNotes array, which reflects the "success" state to the user.
         */
        localNotes = localNotes.filter(note => note.id !== id);
        renderNotes();
        setStatus(`Note deleted successfully (status ${response.status}).`, 'success');
        
    } catch (error) {
        setStatus('Failed to delete note.', 'error');
    } finally {
        submitBtn.disabled = false;
    }
}

// Initial empty state
renderNotes();