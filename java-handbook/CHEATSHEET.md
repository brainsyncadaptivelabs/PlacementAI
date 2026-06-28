# ⚡ Java Master Cheat Sheet

A condensed reference for Java syntax, APIs, Collections complexities, and GC selection flags.

---

## 1. Collections Complexity Reference

| Collection Interface | Implementation | Element Access | Insertion (avg) | Deletion (avg) | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **List** | `ArrayList` | $O(1)$ | $O(1)$ amortized | $O(N)$ | Backed by a dynamic array |
| **List** | `LinkedList` | $O(N)$ | $O(1)$ | $O(1)$ | Double-linked list, high memory overhead |
| **Set** | `HashSet` | N/A | $O(1)$ | $O(1)$ | Backed by `HashMap` |
| **Set** | `TreeSet` | N/A | $O(\log N)$ | $O(\log N)$ | Red-Black Tree, sorted elements |
| **Map** | `HashMap` | $O(1)$ | $O(1)$ | $O(1)$ | Resizes at $0.75$ load factor |
| **Map** | `TreeMap` | $O(\log N)$ | $O(\log N)$ | $O(\log N)$ | Red-Black Tree, sorted keys |

---

## 2. Multi-Threading & Concurrency Syntax

### Creating a Thread (Java 8+ lambdas)
```java
Thread thread = new Thread(() -> {
    System.out.println("Executing thread: " + Thread.currentThread().getName());
});
thread.start();
```

### Thread Pool (Executor Service)
```java
ExecutorService executor = Executors.newFixedThreadPool(4);
Future<Integer> futureResult = executor.submit(() -> {
    // Perform complex calculations
    return 42;
});
// blocks until completed
int result = futureResult.get(); 
executor.shutdown();
```

---

## 3. Java 8+ Streams API Pipelines

```java
List<String> rawData = List.of("apple", "banana", "kiwi", "pear");

List<String> processed = rawData.stream()
    .filter(s -> s.length() > 4)         // Intermediate operation
    .map(String::toUpperCase)           // Intermediate operation
    .sorted()                           // Intermediate operation
    .collect(Collectors.toList());      // Terminal operation: returns ["BANANA"]
```

---

## 4. JVM Performance Tuning Command-Line Flags

* **Set Heap Limits**: `-Xms2g -Xmx4g` (starts at 2GB, maximum 4GB)
* **Select Garbage Collector**:
  * G1 GC: `-XX:+UseG1GC`
  * ZGC: `-XX:+UseZGC`
* **Dump Memory on Out-Of-Memory Error**: `-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/var/logs/dumps`
