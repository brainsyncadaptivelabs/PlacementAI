# 💻 Java Master Projects Guide

A directory of structured projects from absolute starter to enterprise-grade web systems.

---

## 🚀 1. Beginner Project: CLI-Based Banking Ledger
* **Goal**: Master Java variables, conditional checks, loop structures, and basic class designs.
* **Architecture**:
  ```
  BankLedger/
  ├── src/
  │   ├── Account.java
  │   └── LedgerSystem.java
  ```
* **Core Requirements**:
  * Store balance using primitives (`double` or `BigDecimal`).
  * Process withdrawals, deposits, and print transaction history.
  * Save/load balances to text files using basic File I/O (`BufferedReader`).

---

## 📈 2. Intermediate Project: Multi-Threaded Port Scanner
* **Goal**: Practice Thread pools, socket configurations, and thread concurrency boundaries.
* **Architecture**:
  ```
  PortScanner/
  ├── src/
  │   ├── ScannerTask.java
  │   └── ScanOrchestrator.java
  ```
* **Core Requirements**:
  * Take target host (IP/domain) and port range (e.g. 1 - 1024).
  * Use `ExecutorService` thread pools to execute scan tasks in parallel.
  * Try opening TCP socket connections (`java.net.Socket`).
  * Print list of open ports and execution latency performance statistics.

---

## 🎓 3. Advanced Enterprise Project: Distributed Event Pub-Sub Server
* **Goal**: Build a high-performance network application using NIO non-blocking selectors and MVCC transactions.
* **Architecture**:
  ```
  PubSubSystem/
  ├── server/
  │   ├── NioEventLoop.java
  │   ├── TopicRegistry.java
  │   └── ConnectionHandler.java
  ├── client/
  │   ├── Publisher.java
  │   └── Subscriber.java
  ```
* **Core Requirements**:
  * Use **Java NIO Selectors** to manage thousands of concurrent TCP sockets in a single-threaded Event Loop.
  * Support topics registration and routing tables.
  * Write transactions to append-only logs for partition resilience.
  * Implement client back-pressure mechanisms (handling slow subscribers).
