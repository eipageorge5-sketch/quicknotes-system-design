# QuickNotes System Design

**Author:** George

## Description
QuickNotes is a scalable, full-stack note-taking application designed to support 1 million+ users. This repository contains both a fully functional frontend API client (built with vanilla HTML, CSS, and JavaScript) and comprehensive system design documentation detailing how the backend API, database, and infrastructure are architected to handle high traffic securely and efficiently.

## How to Run the API Client Locally
You do not need any special backend setup to view the frontend client. It uses a public mock API.
1. Clone this repository to your local machine.
2. Open the folder in Visual Studio Code.
3. Install the "Live Server" extension (if you haven't already).
4. Right-click `index.html` and select **"Open with Live Server"**.
5. The app will open in your browser. Click "Load Notes" to fetch data from the mock API, or use the form to create and delete notes.

## System Design Documents
The core architectural decisions and backend blueprints are located in the `docs/` folder:

- 📘 [API Design Document](docs/api-design.md) - RESTful endpoints, JSON examples, and error handling.
- 🗄️ [Data Model](docs/data-model.md) - Relational database schema, SQL queries, and indexing strategy.
- 🏗️ [Architecture Document](docs/architecture.md) - Infrastructure diagram, load estimates, and scaling trade-offs.

## What I Learned
Building this project from the frontend to the system architecture level taught me several crucial engineering concepts:
1. **Asynchronous JavaScript & API Integration:** How to use `fetch`, `async/await`, and proper error handling (`try/catch`) to communicate with REST APIs while managing UI states (loading, success, error).
2. **Relational Database Design:** How to structure normalized SQL tables, handle many-to-many relationships using join tables, and optimize performance with strategic indexing.
3. **System Scalability & Trade-offs:** How to design a high-availability architecture for read-heavy workloads using Load Balancers, CDNs, Caching (Redis), and Database Read Replicas, while understanding the trade-offs between consistency and performance.