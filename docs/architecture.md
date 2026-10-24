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

## 3. Architecture Diagram
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