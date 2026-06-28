# 💼 Java Technical Interview Guide

This guide compiles top Java core, concurrency, JVM, and memory questions frequently asked during FAANG and elite system interviews.

---

## 1. Top 5 System/JVM Architecture Questions

### Q1: How does JVM manage Metaspace? How is it different from PermGen?
* **Answer**: In Java 8, PermGen (Permanent Generation) was replaced by **Metaspace**. PermGen was located within the JVM heap memory and had a fixed maximum size (leading to the infamous `java.lang.OutOfMemoryError: PermGen space`). Metaspace is located in **native memory** (outside the JVM heap). It sizes dynamically based on system memory limit. It can be limited using `-XX:MaxMetaspaceSize`.

### Q2: What is the Difference between Virtual Threads and Platform Threads?
* **Answer**: Introduced as a production feature in **Java 21 (Project Loom)**:
  * **Platform Threads**: Managed as 1-to-1 mappings to Operating System (OS) kernel threads. They are expensive (each allocates ~1MB stack space).
  * **Virtual Threads**: Managed by the JVM runtime as $M$-to-$N$ mappings (many virtual threads mapped to a pool of platform threads). They are lightweight (allocating bytes to kilobytes on the heap). They enable high concurrency without blocking kernel threads during I/O operations.

### Q3: What is "Type Erasure" in Java Generics?
* **Answer**: Java Generics are implemented via **Type Erasure** to maintain backward compatibility with pre-generic Java versions. During compilation, the compiler replaces generic types (e.g. `<T>`) with their bound (e.g. `Object` or parent class) and inserts explicit typecasts. This means that type safety is checked only at compile-time; at runtime, generic type information is absent.

---

## 2. Advanced Coding Concurrency Challenge

### Challenge: Implement a Custom Thread-Safe Blocking Queue
```java
import java.util.LinkedList;
import java.util.Queue;

public class CustomBlockingQueue<T> {
    private final Queue<T> queue = new LinkedList<>();
    private final int limit;

    public CustomBlockingQueue(int limit) {
        this.limit = limit;
    }

    public synchronized void put(T item) throws InterruptedException {
        while (queue.size() == limit) {
            wait(); // Wait until space is available
        }
        queue.add(item);
        notifyAll(); // Notify threads waiting to take
    }

    public synchronized T take() throws InterruptedException {
        while (queue.isEmpty()) {
            wait(); // Wait until item is available
        }
        T item = queue.poll();
        notifyAll(); // Notify threads waiting to put
        return item;
    }
}
```
* **Follow-up question**: Why use `notifyAll()` instead of `notify()`?
* **Answer**: `notify()` only wakes up a single random thread. In a multi-producer/multi-consumer system, this can lead to deadlocks where a producer wakes up another producer instead of a consumer. `notifyAll()` wakes up all waiting threads, allowing them to re-evaluate their loop condition.
