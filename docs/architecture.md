# QuickNotes System Architecture
**Author:** George  

## 1. Requirements
- **Functional:** Users can register, authenticate, create, read, update, and delete notes, and organize them with tags.
- **Non-Functional:** High availability (99.9% uptime), low latency (< 200ms for API responses), secure data storage, and horizontal scalability.

## 2. Load Estimates (1 Million Registered Users)
Assuming 10% Daily Active Users (DAU) = 100,000 users/day.
- **Writes:** 1 note created per active user/day = 100,000 writes/day ≈ **1.2 writes/sec** (Peak ~6 writes/sec).
- **Reads:** 20 note views per active user/day = 2,000,000 reads/day ≈ **23 reads/sec** (Peak ~115 reads/sec).
- **Storage:** Avg note size = 10KB. 100,000 notes/day = 1GB/day ≈ **365 GB/year**.
*Conclusion:* The system is **read-heavy** (roughly 20:1 ratio), so we must optimize for fast reads.

## 3. Component Explanations (Problems Solved)
- **DNS & CDN:** Solves the problem of global latency and server load by caching static assets (HTML/CSS/JS) at edge locations physically close to the user.
- **Load Balancer:** Solves the problem of server overload by distributing incoming HTTP traffic evenly across multiple app servers.
- **App Servers:** Solve the problem of processing business logic and API requests. By being stateless, they allow the system to scale horizontally without losing user session data.
- **Cache (Redis):** Solves the problem of database starvation. It stores frequently accessed data (like a user's recent notes) in ultra-fast memory, preventing the database from being overwhelmed by the 20:1 read ratio.
- **Primary Database:** Solves the problem of data integrity by acting as the single source of truth that handles all `WRITE` operations (INSERT, UPDATE, DELETE).
- **Read Replica:** Solves the problem of slow read queries by offloading all `READ` operations from the primary database, ensuring write operations are never blocked by heavy read traffic.
- **Message Queue & Worker:** Solves the problem of slow user experience by decoupling heavy background tasks (like sending email notifications or generating analytics) from the main API request.

## 4. Step-by-Step Request Flows

### Flow 1: GET /notes (Reading Notes)
1. The client requests the user's notes.
2. The Load Balancer routes the request to an available App Server.
3. The App Server checks the Redis Cache for the user's note list.
4. **Cache Hit:** If found, the App Server instantly returns the data to the client.
5. **Cache Miss:** If not found, the App Server queries the Read Replica Database.
6. The App Server returns the data to the client and updates the Redis Cache for the next request.

### Flow 2: POST /notes (Creating Notes)
1. The client sends the new note data (title, body, tags).
2. The Load Balancer routes the request to an App Server.
3. The App Server validates the input (e.g., checking title length).
4. The App Server writes the new note to the **Primary Database**.
5. The App Server invalidates (clears) the user's note list in the Redis Cache so the next `GET` request fetches fresh data.
6. The App Server returns a `201 Created` status and the new note object to the client.

## 5. Trade-offs
1. **Cache Consistency vs. Performance (Eventual Consistency):** Keeping data in Redis is incredibly fast, but there is a risk of "stale" data if the database updates and the cache isn't cleared immediately. We accept this slight delay (eventual consistency) to guarantee sub-200ms read speeds for 99% of requests.
2. **Synchronous vs. Asynchronous Processing:** We could process everything (like sending a "note created" email) synchronously before replying to the user. The trade-off of using a Message Queue (asynchronous) is that it adds infrastructure complexity, but it guarantees the user gets a lightning-fast API response without waiting for background tasks to finish.

## 6. Avoiding Single Points of Failure (SPOF)
- **App Servers:** We avoid a SPOF here by running multiple stateless App Servers behind a Load Balancer. If one server crashes, the Load Balancer instantly routes traffic to the healthy ones.
- **Primary Database:** The database is a classic SPOF. We avoid this by using automated failover tools (like PostgreSQL Patroni). If the Primary DB crashes, a Read Replica is automatically promoted to become the new Primary, minimizing downtime.

## 7. Architecture Diagram
```text
[ Client (Web/Mobile) ]
         │
         ▼
[ DNS ] ──► [ CDN (Cloudflare) ] ──► (Caches static assets & public read endpoints)
                   │
                   ▼
            [ Load Balancer ] ──► (Distributes traffic, terminates SSL)
                   │
       ┌───────────┼───────────┐
       ▼           ▼           ▼
 [ App Server 1 ] [ App Server 2 ] [ App Server N ] (Stateless, horizontal scaling)
       │           │           │
       ├──────► [ Cache (Redis) ] ◄──────┤ (Stores frequent user note lists)
       │           │           │
       ▼           ▼           ▼
 [ Primary DB ] ───────► [ Read Replica DB ] (Handles the heavy read traffic)
       │
       ▼
 [ Message Queue (RabbitMQ) ] ──► [ Background Worker ] (e.g., for email notifications or analytics)

 