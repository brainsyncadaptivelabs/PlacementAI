# 📖 Java Glossary: Definitions & specifications

A glossary matching definitions defined in the Oracle Java Language Specification (JLS).

---

## Key Definitions

* **JLS (Java Language Specification)**: The official document describing the syntax and core rules of the Java programming language.
* **JVM (Java Virtual Machine)**: The abstract computing machine that enables Java bytecode execution on host operating systems.
* **Bytecode**: The machine language of the JVM. Java code is compiled to `.class` files containing platform-independent bytecode instructions.
* **Type Erasure**: The process where compile-time generic types are deleted by the compiler, replacing them with raw bounds or `Object`.
* **Metaspace**: The native runtime memory allocation area introduced in Java 8 to hold class metadata, static variables, and method tables.
* **Garbage Collection (GC)**: The automatic memory reclaim daemon that scans Heap memory to identify and delete unreferenced objects.
* **JIT (Just-In-Time) Compiler**: Part of the JVM execution engine that compiles hot spots of bytecode to native processor instructions at runtime.
* **Sealed Class (Java 17)**: A class that explicitly specifies which other classes are permitted to inherit from it.
* **Virtual Thread (Java 21)**: A lightweight thread managed by the JVM runtime that reduces thread allocation cost and overhead.
* **Happens-Before Relationship**: A conceptual memory visibility contract defining thread memory visibility boundaries under the Java Memory Model.
