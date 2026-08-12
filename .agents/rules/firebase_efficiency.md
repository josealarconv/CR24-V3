# Rule: Firebase Spark Free Plan Quota & Real-Time Sync Efficiency

## Goal
Guarantee ultra-fast real-time synchronization between Web (PC) and Mobile devices while consuming less than 5% of Firebase Cloud Firestore Spark Plan daily free limits (50,000 reads/day, 20,000 writes/day).

---

## Architectural Principles

### 1. Document Denormalization (Nested Licitaciones)
- Items, provider quotes (`consultas`), allocation ratios (`asignaciones`), notes, and AI research results MUST be embedded within the parent `Licitación` document.
- Opening a tender MUST consume EXACTLY 1 Firestore Read instead of querying N child sub-collections.

### 2. Event-Driven Real-time Sync (Smart Notification Listeners)
- Devices MUST NOT poll Firestore periodically for updates.
- Real-time listeners (`onSnapshot`) MUST listen to high-level document collection events and fetch document deltas only when an active change notification is fired.
- Sync delay between PC and Mobile MUST remain under 1000ms.

### 3. Debounced Batch Writing (Keyboard Input Protection)
- User typing events in form fields (notes, descriptions, margins) MUST update React state and local storage immediately (0ms latency), but delay and batch writes to Firebase using a 600ms - 1000ms debounce.
- Keystroke-by-keystroke Firestore writes are strictly forbidden.

### 4. Cache-First Local Storage Layer (L1 Storage)
- Instant application boot MUST load from `localStorage` immediately.
- Background sync updates local storage without blocking the UI rendering engine.
