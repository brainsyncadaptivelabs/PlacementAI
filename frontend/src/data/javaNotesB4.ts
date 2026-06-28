import { Note } from "./notesData";

export const javaNotesB4: Note[] = [
  {
    id: 64,
    title: "Interfaces",
    domain: "Java — OOP",
    time: "10 min read",
    category: "Java",
    sources: ["Oracle JLS", "Baeldung"],
    content: `
# Interfaces

An **interface** is a fully abstract type that defines a contract — a set of method signatures that implementing classes must fulfill.

## Basic Interface

\`\`\`java
interface Flyable {
    int MAX_ALTITUDE = 50000;    // implicitly public static final
    void fly();                   // implicitly public abstract
    void land();
}

class Bird implements Flyable {
    @Override public void fly()  { System.out.println("Bird flying"); }
    @Override public void land() { System.out.println("Bird landing"); }
}

class Plane implements Flyable {
    @Override public void fly()  { System.out.println("Plane flying"); }
    @Override public void land() { System.out.println("Plane landing"); }
}
\`\`\`

## Multiple Interface Implementation

\`\`\`java
interface Swimmable { void swim(); }
interface Runnable   { void run(); }
interface Flyable    { void fly(); }

class Duck implements Swimmable, Runnable, Flyable {
    public void swim() { System.out.println("Duck swimming"); }
    public void run()  { System.out.println("Duck running"); }
    public void fly()  { System.out.println("Duck flying"); }
}
\`\`\`

## Default & Static Methods (Java 8+)

\`\`\`java
interface Vehicle {
    void start();
    void stop();

    // Default method — provides a body, can be overridden
    default void fuelCheck() {
        System.out.println("Checking fuel...");
    }

    // Static method — called on interface, not on implementing class
    static Vehicle createDefault() {
        return new Car();  // factory method pattern
    }
}
\`\`\`

## Private Methods in Interface (Java 9+)

\`\`\`java
interface Logger {
    default void log(String msg)  { logImpl("INFO", msg); }
    default void error(String msg){ logImpl("ERROR", msg); }

    private void logImpl(String level, String msg) {
        System.out.printf("[%s] %s%n", level, msg); // shared helper
    }
}
\`\`\`

## Functional Interface

An interface with exactly **one abstract method** — used with lambdas.

\`\`\`java
@FunctionalInterface
interface Transformer<T> {
    T transform(T input);
}

Transformer<String> upper = s -> s.toUpperCase();
System.out.println(upper.transform("hello")); // HELLO
\`\`\`

## Interface Segregation (SOLID)

Prefer small, focused interfaces over large, monolithic ones.

\`\`\`java
// BAD: forces classes to implement unneeded methods
interface Animal { void eat(); void fly(); void swim(); }

// GOOD: segregated
interface Eatable { void eat(); }
interface Flyable { void fly(); }
interface Swimmable { void swim(); }
\`\`\`

## Interview Questions
1. What is the difference between an interface and an abstract class?
2. What is a default method in an interface?
3. What is a functional interface?
4. Can an interface extend another interface?
5. What happens if two interfaces have the same default method?
`,
  },
  {
    id: 65,
    title: "Abstract Classes vs Interfaces",
    domain: "Java — OOP",
    time: "7 min read",
    category: "Java",
    sources: ["Oracle Docs", "Baeldung"],
    content: `
# Abstract Classes vs Interfaces

Both abstract classes and interfaces define contracts, but they serve different purposes.

## Side-by-Side Comparison

| Feature | Abstract Class | Interface |
|---|---|---|
| **Keyword** | \`abstract class\` | \`interface\` |
| **Instantiation** | ❌ Cannot be instantiated | ❌ Cannot be instantiated |
| **Fields** | All types (instance, static) | Only \`public static final\` |
| **Methods** | Abstract + concrete | Abstract + default + static + private |
| **Constructor** | ✅ Yes | ❌ No |
| **Inheritance** | Single (extends one) | Multiple (implements many) |
| **Access Modifiers** | All (private, protected, public) | \`public\` only |
| **\`extends\`/\`implements\`** | Class \`extends\` abstract class | Class \`implements\` interface |

## When to Use Which

**Use Abstract Class when:**
- Classes share common state (fields) or implementation
- You need constructors
- You have a IS-A relationship with shared base behavior

**Use Interface when:**
- You want to define a contract/capability without shared state
- A class needs to fulfill multiple contracts
- You're designing for polymorphism across unrelated class hierarchies

## Example: Template Method Pattern (Abstract Class)

\`\`\`java
abstract class DataProcessor {
    // Template method — defines algorithm skeleton
    final void process() {
        readData();
        processData();
        writeData();
    }

    abstract void readData();    // subclass fills in steps
    abstract void processData();
    void writeData() { System.out.println("Writing to default output"); }
}

class CSVProcessor extends DataProcessor {
    void readData()    { System.out.println("Reading CSV"); }
    void processData() { System.out.println("Parsing CSV rows"); }
}
\`\`\`

## Example: Strategy Pattern (Interface)

\`\`\`java
interface SortStrategy {
    void sort(int[] arr);
}

class BubbleSort implements SortStrategy {
    public void sort(int[] arr) { /* bubble sort logic */ }
}
class QuickSort implements SortStrategy {
    public void sort(int[] arr) { /* quicksort logic */ }
}

class Sorter {
    private SortStrategy strategy;
    Sorter(SortStrategy s) { this.strategy = s; }
    void sort(int[] arr) { strategy.sort(arr); }
}
\`\`\`

## Interview Questions
1. Can an abstract class implement an interface?
2. Can a class extend an abstract class AND implement an interface simultaneously?
3. What is the Template Method design pattern?
4. Why can't interfaces have instance fields?
`,
  },
  {
    id: 66,
    title: "Packages & Modules",
    domain: "Java — OOP",
    time: "7 min read",
    category: "Java",
    sources: ["Oracle Docs"],
    content: `
# Packages & Modules

## Packages

A **package** is a namespace that organizes related classes and interfaces, preventing naming conflicts.

\`\`\`java
// Declare package (must be the first statement)
package com.company.project.service;

// Import a specific class
import java.util.ArrayList;

// Import all classes in a package (avoid — pollutes namespace)
import java.util.*;

// Static import
import static java.lang.Math.PI;
import static java.lang.Math.sqrt;

double area = PI * sqrt(25); // no Math. prefix needed
\`\`\`

## Java Standard Packages

| Package | Purpose |
|---|---|
| \`java.lang\` | Auto-imported; String, Math, System, Thread |
| \`java.util\` | Collections, Date, Scanner, Random |
| \`java.io\` | File, InputStream, OutputStream |
| \`java.nio\` | Non-blocking I/O, Path, Files |
| \`java.net\` | Socket, URL, HttpURLConnection |
| \`java.sql\` | JDBC — Connection, Statement, ResultSet |
| \`java.util.concurrent\` | Executors, locks, atomic variables |
| \`java.util.stream\` | Stream API |

## Creating a Package Structure

\`\`\`
src/
├── com/
│   └── myapp/
│       ├── model/
│       │   └── Student.java          (package com.myapp.model)
│       ├── service/
│       │   └── StudentService.java  (package com.myapp.service)
│       └── Main.java                 (package com.myapp)
\`\`\`

\`\`\`bash
# Compile with package structure
javac -d out/ src/com/myapp/model/Student.java
java -cp out/ com.myapp.Main
\`\`\`

## Java Modules (Project Jigsaw — Java 9+)

A **module** is a higher-level grouping of packages with explicit dependency declarations.

\`\`\`java
// module-info.java (at root of module)
module com.myapp {
    requires java.base;          // explicit dependency
    requires java.sql;           // need JDBC
    exports com.myapp.model;     // expose this package to others
    opens com.myapp.model to java.base; // allow reflection
}
\`\`\`

## Benefits of Modules

- Strong encapsulation — internal packages not exported cannot be used outside
- Reliable configuration — missing modules are caught at startup
- Smaller JVM images with \`jlink\`

## Interview Questions
1. What is the purpose of packages in Java?
2. What is \`java.lang\` and why is it auto-imported?
3. What is the Java Module System (JPMS)?
4. What is the difference between a package and a module?
`,
  },
  {
    id: 67,
    title: "Access Modifiers",
    domain: "Java — OOP",
    time: "7 min read",
    category: "Java",
    sources: ["Oracle JLS", "GeeksforGeeks"],
    content: `
# Access Modifiers

Access modifiers control the **visibility** and **accessibility** of classes, methods, and fields.

## The 4 Access Levels

| Modifier | Same Class | Same Package | Subclass | Anywhere |
|---|---|---|---|---|
| \`private\` | ✅ | ❌ | ❌ | ❌ |
| *(default/package)* | ✅ | ✅ | ❌ | ❌ |
| \`protected\` | ✅ | ✅ | ✅ | ❌ |
| \`public\` | ✅ | ✅ | ✅ | ✅ |

## Code Examples

\`\`\`java
package com.example;

public class Employee {
    public    String name;       // accessible everywhere
    protected double salary;     // accessible in same package + subclasses
              int    empId;      // package-private (default)
    private   String ssn;        // only within this class

    private void validateSSN(String ssn) {
        // only accessible here
    }

    protected void applyRaise(double pct) {
        salary += salary * pct;  // accessible to subclasses
    }
}
\`\`\`

\`\`\`java
package com.example.hr;
import com.example.Employee;

public class Manager extends Employee {
    void giveRaise() {
        applyRaise(0.10);   // ✅ protected — accessible in subclass
        // ssn = "...";    // ❌ private — NOT accessible
    }
}
\`\`\`

## Access Modifier Rules for Overriding

When overriding a method, you can **widen** (but NOT narrow) the access:

\`\`\`java
class Parent {
    protected void method() {}
}
class Child extends Parent {
    @Override public void method() {}    // ✅ widened to public
    // @Override private void method() {} ❌ narrowed — compile error
}
\`\`\`

## Top-Level Class Access

Only \`public\` or package-private (default) are allowed for top-level classes.

\`\`\`java
public class PublicClass {}   // visible everywhere
class PackageClass {}          // visible only in same package
// private class X {}         // ❌ illegal for top-level
\`\`\`

## Best Practice

Follow the **principle of least privilege**:
- Make fields \`private\`
- Make methods \`public\` only if they are part of the API
- Use \`protected\` for methods intended for subclass use

## Interview Questions
1. What is the difference between \`private\` and package-private?
2. Can a subclass access \`private\` members of its parent?
3. Can you override a \`private\` method?
4. Why should fields be \`private\`?
`,
  },
  {
    id: 68,
    title: "Exception Handling",
    domain: "Java — Intermediate",
    time: "12 min read",
    category: "Java",
    sources: ["Oracle JLS", "Baeldung"],
    content: `
# Exception Handling

An **exception** is an event that disrupts normal program flow. Java provides a robust mechanism to handle exceptions gracefully.

## Exception Hierarchy

\`\`\`
Throwable
├── Error (JVM-level, usually unrecoverable)
│   ├── OutOfMemoryError
│   ├── StackOverflowError
│   └── VirtualMachineError
└── Exception
    ├── Checked Exceptions (must handle or declare)
    │   ├── IOException
    │   ├── SQLException
    │   └── ClassNotFoundException
    └── RuntimeException (Unchecked — optional to handle)
        ├── NullPointerException
        ├── ArrayIndexOutOfBoundsException
        ├── ClassCastException
        ├── NumberFormatException
        └── IllegalArgumentException
\`\`\`

## try-catch-finally

\`\`\`java
try {
    int[] arr = new int[5];
    arr[10] = 1;                  // throws ArrayIndexOutOfBoundsException
} catch (ArrayIndexOutOfBoundsException e) {
    System.out.println("Caught: " + e.getMessage());
} catch (Exception e) {           // broader catch — must come AFTER specific
    System.out.println("Generic: " + e);
} finally {
    System.out.println("Always runs — close resources here");
}
\`\`\`

## try-with-resources (Java 7+)

Automatically closes resources implementing \`AutoCloseable\`.

\`\`\`java
try (FileReader fr = new FileReader("file.txt");
     BufferedReader br = new BufferedReader(fr)) {
    String line;
    while ((line = br.readLine()) != null) {
        System.out.println(line);
    }
}  // fr and br closed automatically, even if exception occurs
\`\`\`

## throw & throws

\`\`\`java
// throws — declares a checked exception
public void readFile(String path) throws IOException {
    FileReader fr = new FileReader(path);
}

// throw — manually throw an exception
public void setAge(int age) {
    if (age < 0 || age > 150) {
        throw new IllegalArgumentException("Invalid age: " + age);
    }
    this.age = age;
}
\`\`\`

## Custom Exception

\`\`\`java
public class InsufficientFundsException extends Exception {
    private double amount;

    public InsufficientFundsException(double amount) {
        super("Insufficient funds. Need: " + amount);
        this.amount = amount;
    }

    public double getAmount() { return amount; }
}

// Usage
public void withdraw(double amount) throws InsufficientFundsException {
    if (amount > balance) {
        throw new InsufficientFundsException(amount - balance);
    }
    balance -= amount;
}
\`\`\`

## Multi-catch (Java 7+)

\`\`\`java
try {
    // risky code
} catch (IOException | SQLException e) {
    // handle both the same way
    System.err.println("Data error: " + e.getMessage());
}
\`\`\`

## Checked vs Unchecked

| | Checked | Unchecked (RuntimeException) |
|---|---|---|
| Must handle? | ✅ Yes — catch or declare \`throws\` | ❌ Optional |
| Compile error if not handled? | ✅ Yes | ❌ No |
| Examples | IOException, SQLException | NPE, AIOOBE |

## Interview Questions
1. What is the difference between checked and unchecked exceptions?
2. What is the purpose of \`finally\`?
3. What is try-with-resources?
4. Can we catch \`Error\` in Java?
5. What happens if both \`catch\` and \`finally\` throw exceptions?
`,
  },
  {
    id: 69,
    title: "File Handling & NIO.2",
    domain: "Java — Intermediate",
    time: "10 min read",
    category: "Java",
    sources: ["Oracle Docs", "Baeldung"],
    content: `
# File Handling & NIO.2

Java provides two APIs for file I/O: the classic \`java.io\` package and the modern \`java.nio.file\` (NIO.2, Java 7+).

## NIO.2 — Path & Files (Preferred)

\`\`\`java
import java.nio.file.*;
import java.io.IOException;

// Path — represents a file/directory location
Path path = Path.of("data", "notes.txt"); // or Paths.get(...)

// Files utility class — common operations
Files.exists(path)
Files.isDirectory(path)
Files.size(path)
Files.createFile(path)
Files.createDirectories(path)
Files.delete(path)
Files.move(source, target, StandardCopyOption.REPLACE_EXISTING)
Files.copy(source, target)
\`\`\`

## Read & Write Files

\`\`\`java
// Write all text (creates/overwrites file)
Files.writeString(Path.of("output.txt"), "Hello Java NIO!");

// Write lines
List<String> lines = List.of("Line 1", "Line 2", "Line 3");
Files.write(Path.of("output.txt"), lines);

// Read all text
String content = Files.readString(Path.of("output.txt"));

// Read all lines
List<String> allLines = Files.readAllLines(Path.of("output.txt"));

// Read as stream (efficient for large files)
try (Stream<String> stream = Files.lines(Path.of("big.txt"))) {
    stream.filter(l -> l.contains("Java"))
          .forEach(System.out::println);
}
\`\`\`

## Classic java.io — Readers & Writers

\`\`\`java
// Write with BufferedWriter
try (BufferedWriter writer = new BufferedWriter(new FileWriter("log.txt", true))) {
    writer.write("Log entry: " + LocalDateTime.now());
    writer.newLine();
}

// Read with BufferedReader
try (BufferedReader reader = new BufferedReader(new FileReader("log.txt"))) {
    String line;
    while ((line = reader.readLine()) != null) {
        System.out.println(line);
    }
}
\`\`\`

## Binary I/O

\`\`\`java
// Write bytes
try (FileOutputStream fos = new FileOutputStream("data.bin")) {
    fos.write(new byte[]{72, 101, 108, 108, 111}); // "Hello"
}

// Read bytes
try (FileInputStream fis = new FileInputStream("data.bin")) {
    byte[] buffer = new byte[1024];
    int bytesRead = fis.read(buffer);
    System.out.println(new String(buffer, 0, bytesRead));
}
\`\`\`

## Walking Directory Tree

\`\`\`java
// List all .java files recursively
try (Stream<Path> walk = Files.walk(Path.of("src"))) {
    walk.filter(p -> p.toString().endsWith(".java"))
        .forEach(System.out::println);
}
\`\`\`

## Interview Questions
1. What is the difference between \`java.io\` and \`java.nio\`?
2. What is try-with-resources and why is it important for file handling?
3. How do you append to a file in Java?
4. What is the difference between \`FileWriter\` and \`BufferedWriter\`?
`,
  },
  {
    id: 70,
    title: "Collections Framework",
    domain: "Java — Intermediate",
    time: "15 min read",
    category: "Java",
    sources: ["Oracle Docs", "Baeldung"],
    content: `
# Java Collections Framework

The **Collections Framework** provides a unified architecture for storing and manipulating groups of objects. It is defined in \`java.util\`.

## Hierarchy Overview

\`\`\`
Collection (interface)
├── List (ordered, allows duplicates)
│   ├── ArrayList       — resizable array, fast random access O(1)
│   ├── LinkedList      — doubly linked, fast insert/delete O(1)
│   └── Vector          — synchronized ArrayList (legacy)
├── Set (unordered, no duplicates)
│   ├── HashSet         — hash table, O(1) ops
│   ├── LinkedHashSet   — insertion-ordered HashSet
│   └── TreeSet         — sorted, O(log n) ops (Red-Black Tree)
└── Queue / Deque
    ├── PriorityQueue   — min-heap by default
    ├── ArrayDeque      — resizable array deque (faster than Stack)
    └── LinkedList      — also implements Deque

Map (key-value pairs — NOT Collection)
├── HashMap             — hash table, O(1) average, no order
├── LinkedHashMap       — insertion-ordered HashMap
├── TreeMap             — sorted by key, O(log n) (Red-Black Tree)
└── Hashtable           — legacy synchronized HashMap
\`\`\`

## List Examples

\`\`\`java
// ArrayList
List<String> list = new ArrayList<>(List.of("A", "B", "C"));
list.add("D");
list.add(1, "X");              // insert at index 1
list.remove("B");
System.out.println(list.get(0)); // A
list.sort(Comparator.naturalOrder());

// LinkedList as Deque
Deque<Integer> dq = new LinkedList<>();
dq.addFirst(1);
dq.addLast(2);
dq.peekFirst();   // 1
dq.pollLast();    // 2
\`\`\`

## Set Examples

\`\`\`java
Set<String> hs = new HashSet<>(Arrays.asList("Apple","Banana","Apple"));
System.out.println(hs.size()); // 2 — duplicates removed

Set<String> ts = new TreeSet<>(hs);  // sorted: [Apple, Banana]
\`\`\`

## Map Examples

\`\`\`java
Map<String, Integer> scores = new HashMap<>();
scores.put("Alice", 90);
scores.put("Bob", 85);
scores.getOrDefault("Charlie", 0);  // 0 — key not present

scores.forEach((name, score) -> System.out.println(name + ": " + score));

// Merge / compute
scores.merge("Alice", 10, Integer::sum);  // Alice: 100

// TreeMap — sorted by key
Map<String, Integer> sorted = new TreeMap<>(scores);
\`\`\`

## Queue & PriorityQueue

\`\`\`java
Queue<Integer> pq = new PriorityQueue<>();  // min-heap
pq.offer(5); pq.offer(1); pq.offer(3);
while (!pq.isEmpty()) System.out.print(pq.poll() + " "); // 1 3 5

// Max-heap
PriorityQueue<Integer> maxPQ = new PriorityQueue<>(Comparator.reverseOrder());
\`\`\`

## Collections Utility Class

\`\`\`java
List<Integer> nums = new ArrayList<>(Arrays.asList(3,1,4,1,5));
Collections.sort(nums);                  // [1,1,3,4,5]
Collections.reverse(nums);              // [5,4,3,1,1]
Collections.shuffle(nums);             // random order
Collections.min(nums) / Collections.max(nums);
Collections.frequency(nums, 1);        // 2
Collections.unmodifiableList(nums);    // read-only view
\`\`\`

## Choosing the Right Collection

| Need | Best Choice |
|---|---|
| Fast indexed access | ArrayList |
| Fast insertions/deletions | LinkedList |
| Unique elements | HashSet |
| Sorted unique elements | TreeSet |
| Key-value pairs, fast lookup | HashMap |
| Sorted key-value pairs | TreeMap |
| Min/Max priority | PriorityQueue |

## Interview Questions
1. What is the difference between ArrayList and LinkedList?
2. What is the difference between HashMap and TreeMap?
3. How does HashSet handle duplicate elements?
4. What is the difference between \`fail-fast\` and \`fail-safe\` iterators?
5. How does HashMap work internally (bucket + linked list + tree)?
`,
  },
  {
    id: 71,
    title: "Generics & Type Erasure",
    domain: "Java — Intermediate",
    time: "10 min read",
    category: "Java",
    sources: ["Oracle JLS", "Baeldung"],
    content: `
# Generics & Type Erasure

**Generics** enable type-safe, reusable code without casting. They provide compile-time type checking and eliminate the need for explicit downcasts.

## Generic Class

\`\`\`java
public class Box<T> {
    private T value;

    public Box(T value) { this.value = value; }
    public T get() { return value; }
    public void set(T value) { this.value = value; }
}

Box<String>  strBox = new Box<>("Hello");
Box<Integer> intBox = new Box<>(42);

String s = strBox.get();    // no cast needed!
int    n = intBox.get();
\`\`\`

## Generic Method

\`\`\`java
public static <T extends Comparable<T>> T max(T a, T b) {
    return a.compareTo(b) >= 0 ? a : b;
}

System.out.println(max(3, 7));         // 7
System.out.println(max("Apple", "Mango")); // Mango
\`\`\`

## Bounded Type Parameters

\`\`\`java
// Upper bound — T must extend Number
<T extends Number>
// lower bound — T must be Number or a supertype
<? super Integer>
// upper bound wildcard
<? extends Number>
\`\`\`

## Wildcards

\`\`\`java
// ? extends T — read-only (producer)
void printAll(List<? extends Number> list) {
    for (Number n : list) System.out.println(n);
}
printAll(new ArrayList<Integer>());   // ✅
printAll(new ArrayList<Double>());    // ✅

// ? super T — write-allowed (consumer)
void addNumbers(List<? super Integer> list) {
    list.add(1);
    list.add(2);
}
\`\`\`

**PECS Rule**: **P**roducer **E**xtends, **C**onsumer **S**uper.

## Type Erasure

Java generics are a compile-time feature. At runtime, type parameters are **erased** to their bounds (or \`Object\`).

\`\`\`java
Box<String> strBox = new Box<>("Hi");
Box<Integer> intBox = new Box<>(42);

// At runtime, both are just Box (not Box<String> or Box<Integer>)
System.out.println(strBox.getClass() == intBox.getClass()); // true

// Cannot do:
// if (strBox instanceof Box<String>) {} ❌ — cannot check generic type at runtime
// new T[10] ❌ — cannot create generic array
\`\`\`

## Generic Interface

\`\`\`java
interface Pair<K, V> {
    K getKey();
    V getValue();
}

class Entry<K, V> implements Pair<K, V> {
    private K key;
    private V value;
    public Entry(K key, V value) { this.key = key; this.value = value; }
    public K getKey()   { return key; }
    public V getValue() { return value; }
}
\`\`\`

## Interview Questions
1. What are generics and why were they introduced in Java 5?
2. What is type erasure?
3. What is the PECS rule?
4. What is the difference between \`List<Object>\` and \`List<?>\`?
5. Why can't you create a generic array in Java?
`,
  },
  {
    id: 72,
    title: "Lambda Expressions",
    domain: "Java — Intermediate",
    time: "10 min read",
    category: "Java",
    sources: ["Oracle Docs", "Baeldung"],
    content: `
# Lambda Expressions

Introduced in **Java 8**, lambda expressions provide a concise way to represent a **functional interface** (an interface with a single abstract method).

## Syntax

\`\`\`java
// (parameters) -> expression
// (parameters) -> { statements; return value; }

// No parameters
Runnable r = () -> System.out.println("Running!");

// One parameter (parentheses optional)
Consumer<String> print = s -> System.out.println(s);

// Multiple parameters
Comparator<String> byLength = (a, b) -> a.length() - b.length();

// Block body
Function<Integer, String> classify = n -> {
    if (n < 0) return "negative";
    if (n == 0) return "zero";
    return "positive";
};
\`\`\`

## Common Use Cases

### Sorting

\`\`\`java
List<String> names = new ArrayList<>(List.of("Charlie","Alice","Bob"));

// Before Java 8 (anonymous class)
Collections.sort(names, new Comparator<String>() {
    public int compare(String a, String b) { return a.compareTo(b); }
});

// Java 8+ lambda
names.sort((a, b) -> a.compareTo(b));
names.sort(Comparator.naturalOrder());

// Sort by length
names.sort(Comparator.comparingInt(String::length));
\`\`\`

### Filtering & Iteration

\`\`\`java
List<Integer> nums = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
nums.stream()
    .filter(n -> n % 2 == 0)
    .forEach(System.out::println);  // 2 4 6 8 10
\`\`\`

### Threading

\`\`\`java
// Before Java 8
Thread t = new Thread(new Runnable() {
    public void run() { System.out.println("Running"); }
});

// Lambda
Thread t = new Thread(() -> System.out.println("Running"));
t.start();
\`\`\`

## Method References

A shorthand for lambdas that call an existing method.

\`\`\`java
// Static method reference
Function<String, Integer> parse = Integer::parseInt;

// Instance method reference (unbound)
Function<String, String> upper = String::toUpperCase;

// Instance method reference (bound)
String greeting = "Hello";
Supplier<Integer> len = greeting::length;

// Constructor reference
Supplier<ArrayList<String>> listFactory = ArrayList::new;
\`\`\`

## Effectively Final Variables

Lambdas can access local variables from the enclosing scope, but those variables must be **effectively final** (not modified after assignment).

\`\`\`java
String prefix = "LOG: ";
// prefix = "OTHER"; ❌ would break lambda if uncommented
Consumer<String> logger = msg -> System.out.println(prefix + msg);
logger.accept("Error occurred"); // LOG: Error occurred
\`\`\`

## Interview Questions
1. What is a lambda expression?
2. What is a functional interface?
3. What is a method reference?
4. What does "effectively final" mean?
5. Can lambdas throw checked exceptions?
`,
  },
];
