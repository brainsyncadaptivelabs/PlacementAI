import { Note } from "./notesData";

export const javaNotesData: Note[] = [
  // ─── BATCH 1: Basics & JVM Internals (IDs 34–43) ───────────────────────────
  {
    id: 34,
    title: "Introduction to Programming",
    domain: "Java — Foundations",
    time: "5 min read",
    category: "Java",
    sources: ["Oracle Docs", "GeeksforGeeks"],
    content: `
# Introduction to Programming

Programming is the process of writing a set of instructions (called **source code**) that a computer can execute to perform a specific task. A **program** is a logical sequence of statements that manipulates data to produce a result.

## Key Terminology

| Term | Meaning |
|---|---|
| **Algorithm** | Step-by-step procedure to solve a problem |
| **Source Code** | Human-readable instructions written in a programming language |
| **Compiler** | Translates source code to machine code in one shot |
| **Interpreter** | Executes source code line-by-line at runtime |
| **Syntax** | Rules governing the structure of valid statements |
| **Semantics** | The meaning/behavior of those statements |

## Programming Paradigms

### Procedural Programming
Code is organized as a sequence of procedures (functions). C is a classic example.

### Object-Oriented Programming (OOP)
Code is organized around **objects** — bundles of data (fields) and behavior (methods). Java is object-oriented.

### Functional Programming
Computation is treated as evaluation of mathematical functions. Java 8+ supports functional style via lambdas and streams.

## Why Learn Java First?

- Strongly typed → catches errors early
- OOP-first design → teaches good architecture habits
- Runs on JVM → platform independent
- Huge ecosystem → Android, enterprise, cloud

## Interview Questions
1. What is the difference between a compiler and an interpreter?
2. What is a strongly typed language? Give an example.
3. Name the four pillars of OOP.
`,
  },
  {
    id: 35,
    title: "History of Java",
    domain: "Java — Foundations",
    time: "5 min read",
    category: "Java",
    sources: ["Oracle Docs", "Wikipedia"],
    content: `
# History of Java

Java was created at **Sun Microsystems** in **1991** by a team led by **James Gosling**, originally as a language for embedded consumer electronics under the project name **"Oak"**. It was later renamed **Java** (after Java coffee) and publicly released in **1995**.

## Timeline

| Year | Milestone |
|---|---|
| 1991 | Project "Green" / "Oak" started at Sun Microsystems |
| 1995 | Java 1.0 released publicly — "Write Once, Run Anywhere" |
| 1997 | Java 1.1 — Inner classes, JDBC, RMI |
| 2004 | Java 5 (J2SE 5.0) — Generics, Annotations, Enums, for-each |
| 2006 | Java 6 — Performance improvements |
| 2009 | Oracle acquires Sun Microsystems |
| 2011 | Java 7 — try-with-resources, diamond operator |
| 2014 | Java 8 — Lambdas, Stream API, Optional, default methods |
| 2017 | Java 9 — Module system (Project Jigsaw) |
| 2018 | Java 11 (LTS) — var in lambdas, HTTP Client |
| 2021 | Java 17 (LTS) — Sealed classes, pattern matching |
| 2023 | Java 21 (LTS) — Virtual threads, sequenced collections |

## Key Principles (WORA)

> **Write Once, Run Anywhere** — Java source code compiles to **bytecode**, which runs on any machine with a JVM installed, regardless of the underlying OS or CPU.

## Ownership
- **1995–2009**: Sun Microsystems
- **2010–present**: Oracle Corporation

## Interview Questions
1. Who created Java and in what year?
2. What does WORA stand for?
3. What was Java originally called?
4. Which Java version introduced Generics?
`,
  },
  {
    id: 36,
    title: "Why Java?",
    domain: "Java — Foundations",
    time: "5 min read",
    category: "Java",
    sources: ["Oracle Docs", "GeeksforGeeks"],
    content: `
# Why Java?

Java has remained one of the most popular programming languages for 30+ years. Here's why it continues to dominate enterprise, Android, and placement interviews.

## Core Advantages

### 1. Platform Independence
Java compiles to **bytecode** (not native machine code). Any OS with a JVM can execute that bytecode — no recompilation needed.

\`\`\`
Source (.java) → javac → Bytecode (.class) → JVM → Native execution
\`\`\`

### 2. Object-Oriented
Everything in Java (except primitives) is an object. This promotes code reuse, modularity, and clean design.

### 3. Strongly Typed
The compiler enforces data types. You cannot assign a \`String\` to an \`int\` variable without an explicit cast.

### 4. Automatic Memory Management
Java's **Garbage Collector** automatically reclaims unused heap memory — no manual \`free()\` like C/C++.

### 5. Rich Standard Library
The Java Standard Library (JDK) includes:
- \`java.util\` — Collections, Date, Scanner
- \`java.io\` / \`java.nio\` — File I/O
- \`java.net\` — Networking
- \`java.util.concurrent\` — Threading utilities

### 6. Multithreading Support
Java provides built-in threading via \`Thread\`, \`Runnable\`, and the \`java.util.concurrent\` package.

### 7. Security
The JVM acts as a sandbox, and Java's type system prevents common vulnerabilities like buffer overflows.

## Where Java Is Used

| Domain | Usage |
|---|---|
| Enterprise Applications | Spring Boot, Microservices |
| Android Development | Primary language (before Kotlin) |
| Big Data | Hadoop, Spark (JVM-based) |
| Web Backends | REST APIs, Servlets |
| Financial Systems | Banking, trading platforms |

## Interview Questions
1. What makes Java platform-independent?
2. Is Java purely object-oriented? Why or why not?
3. How does Java handle memory management?
`,
  },
  {
    id: 37,
    title: "JVM Internals & Garbage Collection",
    domain: "Java — Internals",
    time: "15 min read",
    category: "Java",
    sources: ["Oracle JVM Spec", "GeeksforGeeks"],
    content: `
# JVM Internals & Garbage Collection

The **Java Virtual Machine (JVM)** is an abstract computing machine that enables Java's platform independence. It loads, verifies, and executes Java bytecode.

## JVM Architecture

\`\`\`
┌──────────────────────────────────────────────────────┐
│                  JVM                                  │
│  ┌─────────────────┐   ┌──────────────────────────┐  │
│  │  ClassLoader    │   │     Memory Areas          │  │
│  │  Subsystem      │   │  ┌─────────┐ ┌─────────┐ │  │
│  │  - Bootstrap    │   │  │  Heap   │ │  Stack  │ │  │
│  │  - Extension    │   │  └─────────┘ └─────────┘ │  │
│  │  - Application  │   │  ┌──────────────────────┐ │  │
│  └─────────────────┘   │  │  Metaspace (Method)  │ │  │
│                         │  └──────────────────────┘ │  │
│  ┌─────────────────────────────────────────────────┐ │
│  │          Execution Engine                        │ │
│  │   Interpreter | JIT Compiler | GC               │ │
│  └─────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
\`\`\`

## JVM Memory Areas

| Area | Stores | Thread Safe? |
|---|---|---|
| **Heap** | Objects, instance variables | No (shared) |
| **Stack** | Local variables, method frames | Yes (per-thread) |
| **Metaspace** | Class metadata, static variables | Shared |
| **PC Register** | Current instruction address | Per-thread |
| **Native Method Stack** | Native (C/C++) method frames | Per-thread |

## ClassLoader Hierarchy

\`\`\`
Bootstrap ClassLoader (loads rt.jar, core Java classes)
    └── Extension ClassLoader (loads ext/*.jar)
            └── Application ClassLoader (loads your classpath)
\`\`\`

**Delegation model**: A ClassLoader always asks its parent first before loading a class itself.

## Execution Engine

- **Interpreter**: Executes bytecode line-by-line (slow startup).
- **JIT Compiler (C1/C2)**: Detects "hot" methods and compiles them to native code at runtime (fast steady-state).
- **Garbage Collector**: Reclaims heap memory from unreachable objects.

## Garbage Collection Algorithms

| GC | Best For | Pause |
|---|---|---|
| **Serial GC** | Single-threaded apps | Stop-the-world |
| **Parallel GC** | Multi-core throughput | Stop-the-world |
| **G1 GC** | Large heaps, balanced | Short pauses |
| **ZGC** | Ultra-low latency | Sub-millisecond |
| **Shenandoah** | Concurrent compaction | Sub-millisecond |

## Heap Generations (G1 GC)

\`\`\`
Young Generation (Eden + Survivor S0/S1)
    → Objects start here (Minor GC)
Old Generation (Tenured)
    → Long-lived objects promoted here (Major/Full GC)
\`\`\`

## Code Example: Triggering GC awareness

\`\`\`java
public class GCDemo {
    public static void main(String[] args) {
        // Objects created on heap
        for (int i = 0; i < 1_000_000; i++) {
            String temp = new String("obj" + i); // short-lived
        }
        // Suggest GC (not guaranteed)
        System.gc();
        System.out.println("GC requested");
    }
}
\`\`\`

## Interview Questions
1. What is the difference between the JVM Stack and the Heap?
2. What is the role of the JIT compiler?
3. What is Stop-the-World in GC?
4. Which GC algorithm is best for low-latency apps?
5. What happens during a Minor GC vs Major GC?
`,
  },
  {
    id: 38,
    title: "JRE — Java Runtime Environment",
    domain: "Java — Internals",
    time: "5 min read",
    category: "Java",
    sources: ["Oracle Docs"],
    content: `
# JRE — Java Runtime Environment

The **Java Runtime Environment (JRE)** is what you need to **run** Java applications. It includes the JVM plus the core Java class libraries.

## JRE Components

\`\`\`
JRE
├── JVM (executes bytecode)
├── Java Class Libraries (java.lang, java.util, java.io, ...)
└── Deployment technologies (Java Web Start, etc.)
\`\`\`

## JRE vs JDK vs JVM

| Component | Purpose | Contains |
|---|---|---|
| **JVM** | Executes bytecode | Interpreter, JIT, GC |
| **JRE** | Runs Java programs | JVM + Class libraries |
| **JDK** | Develops Java programs | JRE + Compiler + Tools |

## When Do You Need Only the JRE?

End users who only **run** Java applications (e.g., a banking app) need only the JRE — they don't need the compiler or developer tools included in the JDK.

## Java Class Libraries Included in JRE

| Package | Purpose |
|---|---|
| \`java.lang\` | Core classes: String, Object, Math, Thread |
| \`java.util\` | Collections, Date, Random, Scanner |
| \`java.io\` | File and stream I/O |
| \`java.net\` | Networking (sockets, URLs) |
| \`java.sql\` | JDBC database access |

> **Note**: From Java 9+, the JRE is no longer distributed separately. Users install the full JDK, and tools like \`jlink\` can create custom minimal runtimes.

## Interview Questions
1. What is the difference between JRE and JDK?
2. Can you compile Java code with just the JRE installed?
3. Why was the separate JRE distribution discontinued in Java 9+?
`,
  },
  {
    id: 39,
    title: "JDK — Java Development Kit",
    domain: "Java — Internals",
    time: "5 min read",
    category: "Java",
    sources: ["Oracle Docs", "GeeksforGeeks"],
    content: `
# JDK — Java Development Kit

The **Java Development Kit (JDK)** is the full software development environment for building Java applications. It is a superset of the JRE.

## JDK Components

\`\`\`
JDK
├── JRE (JVM + Class Libraries)
├── javac         — Java Compiler
├── javap         — Bytecode Disassembler
├── jar           — Archive tool
├── javadoc       — Documentation generator
├── jdb           — Java Debugger
├── jconsole      — JVM monitoring tool
├── jmap          — Heap dump tool
├── jstack        — Thread dump tool
└── jlink         — Custom runtime image builder (Java 9+)
\`\`\`

## Key JDK Tools

### javac — Compiler
\`\`\`bash
javac HelloWorld.java        # Compiles to HelloWorld.class
javac -d out/ src/*.java     # Output .class to out/ directory
\`\`\`

### java — Runner
\`\`\`bash
java HelloWorld              # Run a class with main()
java -jar app.jar            # Run an executable JAR
java -Xmx512m HelloWorld     # Set max heap to 512 MB
\`\`\`

### jar — Archive
\`\`\`bash
jar cf app.jar *.class       # Create a JAR
jar xf app.jar               # Extract a JAR
\`\`\`

### javap — Disassembler
\`\`\`bash
javap -c HelloWorld.class    # View bytecode instructions
\`\`\`

## Popular JDK Distributions

| Distribution | Vendor | Notes |
|---|---|---|
| Oracle JDK | Oracle | Commercial license for production |
| OpenJDK | Community | Free, open-source reference impl |
| Amazon Corretto | Amazon | Free, long-term support |
| Eclipse Temurin | Adoptium | Free, widely used in CI/CD |
| GraalVM | Oracle | Supports native image compilation |

## Interview Questions
1. What is the difference between JDK, JRE, and JVM?
2. What does \`javap\` do?
3. What is the purpose of \`jlink\`?
`,
  },
  {
    id: 40,
    title: "Java Compilation Process",
    domain: "Java — Internals",
    time: "7 min read",
    category: "Java",
    sources: ["Oracle JLS", "GeeksforGeeks"],
    content: `
# Java Compilation Process

Understanding how Java source code becomes running instructions helps you write better code and debug more effectively.

## End-to-End Flow

\`\`\`
Developer writes:    HelloWorld.java
                         │
                    ┌────▼────┐
                    │  javac  │  (Frontend Compiler)
                    └────┬────┘
                         │  Lexical Analysis → Parsing → Semantic Analysis
                         ▼
              HelloWorld.class (Bytecode)
                         │
                    ┌────▼────┐
                    │   JVM   │  (Backend Execution)
                    └────┬────┘
                         │  ClassLoader → Bytecode Verifier → JIT
                         ▼
                  Native Machine Code
                         │
                         ▼
                   CPU Execution
\`\`\`

## Phase 1: javac (Frontend Compilation)

| Step | What Happens |
|---|---|
| **Lexical Analysis** | Source code → tokens (keywords, identifiers, literals) |
| **Parsing** | Tokens → Abstract Syntax Tree (AST) |
| **Semantic Analysis** | Type checking, scope resolution, overload resolution |
| **Code Generation** | AST → JVM bytecode (.class file) |

## Phase 2: JVM Execution (Backend)

| Step | What Happens |
|---|---|
| **ClassLoader** | Loads .class files into memory |
| **Bytecode Verifier** | Checks for illegal operations, type safety |
| **Interpreter** | Executes bytecode instruction by instruction |
| **JIT Compilation** | Hot code paths compiled to native machine code |

## Viewing Bytecode

\`\`\`java
// HelloWorld.java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello");
    }
}
\`\`\`

\`\`\`bash
javac HelloWorld.java
javap -c HelloWorld
\`\`\`

\`\`\`
public static void main(java.lang.String[]);
  Code:
     0: getstatic     #7  // Field java/lang/System.out
     3: ldc           #13 // String Hello
     5: invokevirtual #15 // Method println
     8: return
\`\`\`

## Key Flags

\`\`\`bash
javac -verbose HelloWorld.java   # Show loaded classes
javac -g HelloWorld.java         # Include debug info
java -verbose:gc HelloWorld      # Show GC events at runtime
java -server HelloWorld          # Use C2 JIT (aggressive optimization)
\`\`\`

## Interview Questions
1. What is bytecode? How is it different from machine code?
2. What does the bytecode verifier check?
3. What is the difference between interpreted mode and JIT-compiled mode?
`,
  },
  {
    id: 41,
    title: "Bytecode Mechanics",
    domain: "Java — Internals",
    time: "7 min read",
    category: "Java",
    sources: ["Oracle JVM Spec", "GeeksforGeeks"],
    content: `
# Bytecode Mechanics

**Bytecode** is the intermediate, platform-neutral binary format that \`javac\` generates. It is not machine code — it's instructions designed for the JVM's stack-based virtual machine.

## What is a .class File?

A \`.class\` file is a binary file with a specific structure:

\`\`\`
ClassFile {
  magic:              0xCAFEBABE   (always — identifies Java class)
  minor_version
  major_version       (e.g., 61 = Java 17)
  constant_pool       (literals, class names, method refs)
  access_flags        (public, abstract, etc.)
  this_class
  super_class
  interfaces[]
  fields[]
  methods[]
  attributes[]
}
\`\`\`

## Bytecode Instruction Set (Subset)

| Instruction | Meaning |
|---|---|
| \`iload_0\` | Push int local var #0 onto stack |
| \`istore_1\` | Store top of stack into local var #1 |
| \`iadd\` | Pop two ints, push their sum |
| \`invokevirtual\` | Call an instance method (dynamic dispatch) |
| \`invokestatic\` | Call a static method |
| \`invokespecial\` | Call constructor or super method |
| \`new\` | Allocate new object on heap |
| \`return\` | Return void from method |
| \`ireturn\` | Return int from method |

## Example: Simple Addition

\`\`\`java
int add(int a, int b) {
    return a + b;
}
\`\`\`

Bytecode:
\`\`\`
0: iload_1      // push a
1: iload_2      // push b
2: iadd         // pop a, b → push a+b
3: ireturn      // return result
\`\`\`

## Why Bytecode?

- **Portability**: The same \`.class\` runs on Windows, Linux, macOS — wherever a JVM exists.
- **Security**: The bytecode verifier validates all instructions before execution.
- **Optimization**: The JIT compiler can optimize bytecode to native code at runtime.

## disassembling bytecode

\`\`\`bash
javap -c -verbose MyClass.class
\`\`\`

## Interview Questions
1. What is the magic number at the start of every .class file?
2. What is the difference between \`invokevirtual\` and \`invokespecial\`?
3. Why is bytecode more portable than native compiled code?
`,
  },
  {
    id: 42,
    title: "ClassLoader Subsystem",
    domain: "Java — Internals",
    time: "8 min read",
    category: "Java",
    sources: ["Oracle JVM Spec", "Baeldung"],
    content: `
# ClassLoader Subsystem

The **ClassLoader** is responsible for loading \`.class\` files into JVM memory. It follows a strict delegation model to ensure security and consistency.

## Three Phases of Class Loading

\`\`\`
Loading → Linking → Initialization
\`\`\`

| Phase | What Happens |
|---|---|
| **Loading** | Reads .class binary data, creates \`Class\` object in Metaspace |
| **Linking — Verification** | Bytecode verifier checks structural and type correctness |
| **Linking — Preparation** | Allocates memory for static variables with default values |
| **Linking — Resolution** | Resolves symbolic references to direct memory references |
| **Initialization** | Runs static initializer blocks and assigns static field values |

## ClassLoader Hierarchy

\`\`\`
Bootstrap ClassLoader (built into JVM — loads java.lang.*, rt.jar)
       │
       ▼
Extension ClassLoader (loads jre/lib/ext/*.jar)
       │
       ▼
Application ClassLoader (loads from -classpath / module path)
       │
       ▼
Custom ClassLoader (user-defined — for frameworks like Spring, Tomcat)
\`\`\`

## Parent Delegation Model

When a ClassLoader is asked to load a class:
1. It delegates to its **parent** first.
2. If parent cannot find it, **it tries itself**.
3. If not found anywhere → \`ClassNotFoundException\`.

This prevents user code from overriding core Java classes like \`java.lang.String\`.

## Custom ClassLoader Example

\`\`\`java
public class CustomLoader extends ClassLoader {
    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        byte[] bytes = loadClassBytes(name); // read from file/network/db
        return defineClass(name, bytes, 0, bytes.length);
    }

    private byte[] loadClassBytes(String name) {
        // implement: read from custom source
        return new byte[0];
    }
}
\`\`\`

## Loading a class dynamically

\`\`\`java
// Explicit class loading
Class<?> clazz = Class.forName("com.example.MyService");
Object instance = clazz.getDeclaredConstructor().newInstance();
\`\`\`

## Interview Questions
1. What is the parent delegation model in ClassLoader?
2. What is the difference between \`Class.forName()\` and \`ClassLoader.loadClass()\`?
3. When would you write a custom ClassLoader?
4. What happens if you violate the parent delegation model?
`,
  },
  {
    id: 43,
    title: "JVM Memory Architecture",
    domain: "Java — Internals",
    time: "10 min read",
    category: "Java",
    sources: ["Oracle JVM Spec", "Baeldung"],
    content: `
# JVM Memory Architecture

The JVM divides memory into distinct regions, each with a specific purpose. Understanding this is critical for debugging \`OutOfMemoryError\` and performance tuning.

## Memory Areas Overview

\`\`\`
┌─────────────────────────────────────────┐
│               JVM Process               │
│  ┌─────────────────────────────────┐    │
│  │   Heap (Shared across threads)  │    │
│  │  ┌──────────────┐ ┌──────────┐  │    │
│  │  │ Young Gen    │ │ Old Gen  │  │    │
│  │  │ Eden|S0|S1   │ │ Tenured  │  │    │
│  │  └──────────────┘ └──────────┘  │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │  Metaspace (native memory)      │    │
│  │  Class metadata, static fields  │    │
│  └─────────────────────────────────┘    │
│  ┌──────────┐  ┌──────────────────┐     │
│  │ Stack    │  │ PC Register      │     │
│  │ (Thread1)│  │ Native Stack     │     │
│  └──────────┘  └──────────────────┘     │
└─────────────────────────────────────────┘
\`\`\`

## Heap Memory

The heap is the largest JVM memory region and is **shared** across all threads.

| Region | Purpose |
|---|---|
| **Eden** | New objects are allocated here first |
| **Survivor S0/S1** | Objects surviving Minor GC move here |
| **Old/Tenured Gen** | Long-lived objects promoted from Young Gen |

## Stack Memory

Each thread has its own **JVM Stack**. It stores:
- **Stack Frames** (one per method call)
- Local variables
- Operand stack (for bytecode execution)
- Reference to the current method

\`\`\`java
void method1() {
    int x = 5;       // x lives on stack
    method2(x);
}
void method2(int a) {
    String s = new String("hi"); // s ref on stack, object on heap
}
\`\`\`

## Metaspace (Java 8+)

Replaced **PermGen** in Java 8. Stores class metadata in **native (off-heap) memory**. It auto-grows by default but can be capped:

\`\`\`bash
java -XX:MaxMetaspaceSize=256m MyApp
\`\`\`

## Common Memory Errors

| Error | Cause |
|---|---|
| \`OutOfMemoryError: Java heap space\` | Heap is full, GC cannot free enough memory |
| \`OutOfMemoryError: Metaspace\` | Too many classes loaded |
| \`StackOverflowError\` | Infinite recursion filled the stack |

## Heap Tuning Flags

\`\`\`bash
java -Xms256m -Xmx1g MyApp    # Initial/max heap
java -Xss512k MyApp            # Stack size per thread
java -XX:+UseG1GC MyApp        # Use G1 Garbage Collector
\`\`\`

## Interview Questions
1. What is the difference between Stack and Heap memory in Java?
2. What replaced PermGen in Java 8?
3. What causes a \`StackOverflowError\`?
4. How do you configure JVM heap size?
5. What happens when the Old Generation is full?
`,
  },
];

// This file is continued by javaNotesData_b2.ts and merged in index
