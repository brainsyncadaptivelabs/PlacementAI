export interface Note {
  id: number;
  title: string;
  domain: string;
  time: string;
  category: string;
  sources: string[];
  content: string;
}

export const notesData: Note[] = [
  {
    id: 1,
    title: "Two Pointers Technique",
    domain: "Data Structures & Algorithms",
    time: "10 min read",
    category: "DSA",
    sources: ["GeeksforGeeks"],
    content: `
# Two Pointers Technique

The **Two Pointers Technique** is an algorithmic pattern frequently used to solve array or linked list problems efficiently. It involves initializing two index variables (pointers) that traverse the data structure in a coordinated manner.

## Why Use It?
Using two pointers allows us to reduce the time complexity of many search-based problems from $O(N^2)$ (using nested loops) to $O(N)$ (using a single pass).

## Types of Two Pointer Approaches

### 1. Opposite Ends (Converging Pointers)
Initialize one pointer at the start ($i = 0$) and another at the end ($j = N-1$). Move them towards each other based on a condition.
* **Example problem**: Find a pair in a sorted array that sums to a target value.

\`\`\`cpp
// C++ Example for Sorted Pair Sum
bool hasPairWithSum(int arr[], int n, int target) {
    int left = 0;
    int right = n - 1;
    while (left < right) {
        int current_sum = arr[left] + arr[right];
        if (current_sum == target) return true;
        else if (current_sum < target) left++; // Increase sum
        else right--; // Decrease sum
    }
    return false;
}
\`\`\`

### 2. Fast & Slow Pointers (Tortoise and Hare)
Initialize two pointers at the same position. Move one pointer faster than the other (e.g., fast moves 2 steps, slow moves 1 step).
* **Example problem**: Detect a cycle in a Linked List.

\`\`\`java
// Java Example for Linked List Cycle Detection
public boolean hasCycle(ListNode head) {
    if (head == null) return false;
    ListNode slow = head;
    ListNode fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) {
            return true; // Cycle detected
        }
    }
    return false;
}
\`\`\`

### 3. Sliding Window Boundary
Pointers represent the boundaries of a dynamic window. Move the right pointer to expand the window, and the left pointer to shrink it.
* **Example problem**: Longest substring without repeating characters.
`
  },
  {
    id: 2,
    title: "Normalization in DBMS",
    domain: "Database Management System",
    time: "8 min read",
    category: "DBMS",
    sources: ["GeeksforGeeks", "W3Schools"],
    content: `
# Normalization in Database Management Systems (DBMS)

**Normalization** is a systematic process of organizing data in a database to reduce data redundancy (duplicate data) and eliminate undesirable anomalies like Insertion, Update, and Deletion anomalies.

## Database Anomalies
* **Insertion Anomaly**: Inability to insert data because other required data is missing.
* **Update Anomaly**: Redundant instances of data require multiple updates, risking inconsistency.
* **Deletion Anomaly**: Deleting a record unintentionally destroys other unrelated essential data.

## Normal Forms (NF)

### 1. First Normal Form (1NF)
A relation is in 1NF if:
* Every column contains atomic (indivisible) values.
* There are no repeating groups of columns.

### 2. Second Normal Form (2NF)
A relation is in 2NF if:
* It is in 1NF.
* There are **no partial dependencies** (i.e., no non-prime attribute is dependent on a proper subset of any candidate key).

### 3. Third Normal Form (3NF)
A relation is in 3NF if:
* It is in 2NF.
* There are **no transitive dependencies** (i.e., non-prime attributes do not determine other non-prime attributes).
* Formally, for $X \\rightarrow Y$, either $X$ is a super key or $Y$ is a prime attribute.

### 4. Boyce-Codd Normal Form (BCNF)
BCNF is a stronger version of 3NF. A relation is in BCNF if:
* For every non-trivial functional dependency $X \\rightarrow Y$, **$X$ is a super key**.
`
  },
  {
    id: 3,
    title: "Process vs Thread",
    domain: "Operating System",
    time: "12 min read",
    category: "OS",
    sources: ["GeeksforGeeks"],
    content: `
# Process vs Thread in Operating Systems

An operating system runs multiple programs simultaneously. Understanding the difference between a **Process** and a **Thread** is fundamental to concurrency, systems programming, and high-performance applications.

## Definition
* **Process**: An execution of a program. It is an independent entity with its own address space, memory, file descriptors, and security context.
* **Thread**: The smallest unit of execution within a process. A single process can contain multiple threads that execute concurrently.

## Detailed Comparison

| Feature | Process | Thread |
|---|---|---|
| **Memory Address Space** | Independent memory space (virtual memory). | Shares memory (Code, Data, Heap) with the parent process. Has its own Stack and Registers. |
| **Creation & Termination** | Expensive (heavyweight). Requires system calls to allocate memory structures. | Cheap (lightweight). Minimal overhead. |
| **Context Switching** | Slow. Requires reloading CPU page tables, registers, and TLB caches. | Fast. Shares page tables, so TLB misses are minimal. |
| **Communication** | Requires Inter-Process Communication (IPC) mechanisms (Pipes, Sockets, Shared Memory). | Easy. Can communicate directly by reading/writing shared variables. |
| **Crash/Failure Impact** | Isolated. A crash in one process does not affect other processes. | Shared risk. A crash or segmentation fault in one thread crashes the whole process. |

## Code Example: Threading in Python

\`\`\`python
import threading
import time

def worker(thread_id):
    print(f"Thread {thread_id} started")
    time.sleep(1)
    print(f"Thread {thread_id} finished")

# Creating threads
t1 = threading.Thread(target=worker, args=(1,))
t2 = threading.Thread(target=worker, args=(2,))

# Starting execution
t1.start()
t2.start()

# Waiting for completion
t1.join()
t2.join()
print("All threads finished.")
\`\`\`
`
  },
  {
    id: 4,
    title: "Array vs Linked List",
    domain: "Data Structures & Algorithms",
    time: "9 min read",
    category: "DSA",
    sources: ["GeeksforGeeks", "W3Schools"],
    content: `
# Array vs Linked List

Both **Arrays** and **Linked Lists** are linear data structures used to store collections of elements, but they organize and manage memory very differently.

## Conceptual Differences

* **Array**: A contiguous block of memory where elements are stored in sequential adjacent locations. The size of an array is fixed at compile-time (or allocation-time in dynamic arrays).
* **Linked List**: A collection of nodes scattered dynamically in memory. Each node contains a data element and a pointer (reference) to the next node in the sequence.

## Complexity Comparison

| Operation | Array | Linked List |
|---|---|---|
| **Random Access** | $O(1)$ (using index formula) | $O(N)$ (must traverse from head) |
| **Insertion/Deletion at Start** | $O(N)$ (requires shifting elements) | $O(1)$ (just update pointers) |
| **Insertion/Deletion at End** | $O(1)$ (if size < capacity) | $O(N)$ (to find tail, or $O(1)$ if tail pointer maintained) |
| **Insertion/Deletion in Middle** | $O(N)$ (shifting elements) | $O(N)$ (to locate position, then $O(1)$ updates) |
| **Memory Allocation** | Static or contiguous dynamic allocation | Dynamic allocation for each node individually |
| **Extra Memory Overhead** | None (only elements data) | Pointer overhead (each node stores at least one pointer) |

## Linked List Node Structure

\`\`\`javascript
// JavaScript representation of a Node
class Node {
    constructor(value) {
        this.value = value;
        this.next = null; // Reference to the next node
    }
}
\`\`\`
`
  },
  {
    id: 5,
    title: "React Lifecycle Methods & Hooks",
    domain: "Web Development",
    time: "15 min read",
    category: "Web Dev",
    sources: ["W3Schools"],
    content: `
# React Component Lifecycle & Hooks

In React, components go through a series of phases: **Mounting**, **Updating**, and **Unmounting**. In modern React, functional components handle these phases using **Hooks** instead of class-based lifecycle methods.

## Class Components vs Functional Hooks

Here is the direct mapping of React lifecycle methods to React Hooks:

### 1. Mounting Phase
* **Class Method**: \`componentDidMount()\`
  * Runs once after the component is rendered to the DOM. Ideal for API calls, timers, or subscribing to events.
* **React Hook**: \`useEffect\` with an empty dependency array \`[]\`

\`\`\`javascript
// Functional Component Hook
useEffect(() => {
    console.log("Component mounted!");
    // API call here
}, []);
\`\`\`

### 2. Updating Phase
* **Class Method**: \`componentDidUpdate(prevProps, prevState)\`
  * Runs after state changes or props update.
* **React Hook**: \`useEffect\` with specific variables in the dependency array.

\`\`\`javascript
// Runs whenever count changes
useEffect(() => {
    console.log(\`Count changed to: \${count}\`);
}, [count]);
\`\`\`

### 3. Unmounting Phase
* **Class Method**: \`componentWillUnmount()\`
  * Runs right before the component is destroyed. Useful for cleanup (clearing intervals, removing listeners).
* **React Hook**: \`useEffect\` with a return function.

\`\`\`javascript
useEffect(() => {
    const handleResize = () => console.log(window.innerWidth);
    window.addEventListener('resize', handleResize);

    // Cleanup function (componentWillUnmount)
    return () => {
        window.removeEventListener('resize', handleResize);
    };
}, []);
\`\`\`
`
  },
  {
    id: 6,
    title: "Profit and Loss Formulas",
    domain: "Aptitude",
    time: "5 min read",
    category: "Aptitude",
    sources: ["GeeksforGeeks"],
    content: `
# Profit and Loss Formulas

Quantitative aptitude sections in placement tests heavily feature questions on **Profit & Loss**. Below is a summary of the fundamental formulas and concepts you must memorize.

## Important Terms
* **Cost Price (CP)**: The price at which an item is purchased.
* **Selling Price (SP)**: The price at which an item is sold.
* **Marked Price (MP)**: The price listed on the label (retail price).

## Core Formulas

### 1. Profit and Loss
* **Profit (Gain)** occurs when $SP > CP$.
  $$\\text{Profit} = SP - CP$$
* **Loss** occurs when $CP > SP$.
  $$\\text{Loss} = CP - SP$$

### 2. Percentage Formulas
* **Profit Percentage**:
  $$\\text{Profit } \\% = \\left( \\frac{\\text{Profit}}{CP} \\right) \\times 100$$
* **Loss Percentage**:
  $$\\text{Loss } \\% = \\left( \\frac{\\text{Loss}}{CP} \\right) \\times 100$$

*(Note: Profit and Loss percentages are always calculated relative to the Cost Price (CP) unless specified otherwise).*

### 3. Advanced Relations
* If an item is sold at a gain of $g \\%$:
  $$SP = \\left( \\frac{100 + g}{100} \\right) \\times CP$$
* If an item is sold at a loss of $l \\%$:
  $$SP = \\left( \\frac{100 - l}{100} \\right) \\times CP$$
`
  },
  {
    id: 7,
    title: "Python Cheat Sheet & Core Concepts",
    domain: "Programming Languages",
    time: "10 min read",
    category: "Python",
    sources: ["W3Schools", "GeeksforGeeks"],
    content: `
# Python Interview Guide & Cheat Sheet

Python is a high-level, interpreted, dynamically-typed language known for its readability. It is heavily used in automation, web backend, data science, and scripting.

## Core Language Features

### 1. Dynamic Typing vs Static Typing
Python does not require declaring variable types. Types are checked at runtime.
\`\`\`python
x = 10      # Dynamically bound as int
x = "Hello" # Dynamically re-bound as str
\`\`\`

### 2. Mutable vs Immutable Objects
* **Immutable**: Values cannot be altered after creation. Examples: \`int\`, \`float\`, \`str\`, \`tuple\`, \`frozenset\`.
* **Mutable**: Values can be changed in-place. Examples: \`list\`, \`dict\`, \`set\`.

\`\`\`python
# Tuple is immutable
t = (1, 2)
# t[0] = 3 -> TypeError!

# List is mutable
lst = [1, 2]
lst[0] = 3 # OK!
\`\`\`

### 3. List and Dictionary Comprehensions
Comprehensions provide a concise way to create lists or dictionaries.
\`\`\`python
# List comprehension
squares = [x**2 for x in range(10) if x % 2 == 0]
# Result: [0, 4, 16, 36, 64]

# Dictionary comprehension
char_map = {char: idx for idx, char in enumerate("ABC")}
# Result: {'A': 0, 'B': 1, 'C': 2}
\`\`\`

### 4. Object-Oriented Programming (OOP) in Python
Python supports inheritance, encapsulation, and polymorphism.

\`\`\`python
class Animal:
    def __init__(self, name):
        self.name = name  # Instance variable

    def speak(self):
        raise NotImplementedError("Subclass must implement this")

class Dog(Animal):
    def speak(self):
        return f"{self.name} says Woof!"

dog = Dog("Buddy")
print(dog.speak())  # Output: Buddy says Woof!
\`\`\`

### 5. Decorators
Decorators are design patterns that allow extending the behavior of functions or classes without modifying them.
\`\`\`python
def my_decorator(func):
    def wrapper():
        print("Something before the function.")
        func()
        print("Something after the function.")
    return wrapper

@my_decorator
def greet():
    print("Hello!")

greet()
\`\`\`
`
  },
  {
    id: 8,
    title: "Java Core Concepts & Collections",
    domain: "Programming Languages",
    time: "12 min read",
    category: "Java",
    sources: ["GeeksforGeeks", "W3Schools"],
    content: `
# Java Interview Guide & OOP Reference

Java is a class-based, object-oriented, concurrent, statically-typed, and compiled programming language designed to have minimal implementation dependencies ("Write Once, Run Anywhere").

## 1. Object-Oriented Principles (OOPs)
Java stands on four primary pillars:
* **Abstraction**: Hiding implementation details using \`abstract\` classes or \`interface\`s.
* **Encapsulation**: Bundling data (variables) and behavior (methods) together, using access modifiers (\`private\`, \`protected\`, \`public\`) to restrict access.
* **Inheritance**: Creating hierarchical links using \`extends\`.
* **Polymorphism**:
  * *Method Overloading* (Compile-time): Same method name, different parameters in the same class.
  * *Method Overriding* (Runtime): Same method in subclass replacing superclass implementation.

\`\`\`java
class Parent {
    void show() { System.out.println("Parent's show()"); }
}
class Child extends Parent {
    @Override
    void show() { System.out.println("Child's show()"); } // Overriding
}
\`\`\`

## 2. Java Collections Framework
The Collections framework provides an architecture to store and manipulate a group of objects.

### Core Interfaces & Implementations:
1. **List** (Ordered, duplicates allowed):
   * \`ArrayList\`: Resizable-array implementation. Fast search ($O(1)$), slow deletion/insertion in middle ($O(N)$).
   * \`LinkedList\`: Doubly-linked list implementation. Fast insertion/deletion ($O(1)$ once pointer is found), slow lookup ($O(N)$).
2. **Set** (Unordered, no duplicates):
   * \`HashSet\`: Backed by a Hash Table. $O(1)$ operations on average.
   * \`TreeSet\`: Backed by a Red-Black Tree. Elements sorted in natural order. $O(\\log N)$ operations.
3. **Map** (Key-Value pairs, unique keys):
   * \`HashMap\`: Unordered key-value storage. $O(1)$ lookup/insert.
   * \`TreeMap\`: Key-value storage sorted by keys. $O(\\log N)$.

\`\`\`java
import java.util.HashMap;
import java.util.Map;

public class CollectionsExample {
    public static void main(String[] args) {
        Map<String, Integer> scores = new HashMap<>();
        scores.put("Alice", 95);
        scores.put("Bob", 88);
        
        System.out.println("Alice's score: " + scores.get("Alice"));
    }
}
\`\`\`

## 3. String Pool and Immutability
* Strings in Java are **immutable** for security, caching, and synchronization reasons.
* Literal strings are stored in the **String Constant Pool (SCP)** inside the heap memory to optimize memory usage.
\`\`\`java
String s1 = "hello"; // Stored in Pool
String s2 = "hello"; // Points to the same object in Pool
String s3 = new String("hello"); // Forces creation of new Object in Heap

System.out.println(s1 == s2); // true
System.out.println(s1 == s3); // false
System.out.println(s1.equals(s3)); // true (value comparison)
\`\`\`
`
  },
  {
    id: 9,
    title: "C Pointers & Memory Management",
    domain: "Programming Languages",
    time: "10 min read",
    category: "C",
    sources: ["W3Schools", "GeeksforGeeks"],
    content: `
# C Programming: Pointers & Dynamic Memory

The C language is a procedural, low-level language that allows direct hardware control. Pointers and manual memory management are the most critical topics for technical interviews.

## 1. Pointers Basics
A **pointer** is a variable that stores the memory address of another variable.

* \`&\` (Address-of operator): Retrieves the memory address.
* \`*\` (Dereference operator): Retrieves the value stored at the address.

\`\`\`c
#include <stdio.h>

int main() {
    int val = 42;
    int *ptr = &val; // ptr stores address of val
    
    printf("Value: %d\\n", *ptr); // Dereferencing: Prints 42
    printf("Address: %p\\n", (void*)ptr); // Prints memory address
    return 0;
}
\`\`\`

## 2. Pointer Arithmetic
Pointers can be incremented or decremented. The memory address shifts by the size of the data type it points to.
* If \`ptr\` is an \`int*\` (4 bytes) pointing to \`1000\`, \`ptr + 1\` yields \`1004\`.

## 3. Dynamic Memory Allocation
Memory in C is divided into **Stack** (managed automatically) and **Heap** (managed manually). The \`<stdlib.h>\` library provides functions to interact with the Heap:

### Allocation Functions:
* \`malloc(size_t size)\`: Allocates uninitialized memory. Returns \`NULL\` if allocation fails.
* \`calloc(size_t num, size_t size)\`: Allocates memory and initializes all bytes to zero.
* \`realloc(void *ptr, size_t new_size)\`: Resizes previously allocated memory.
* \`free(void *ptr)\`: Releases allocated memory back to the Heap.

\`\`\`c
#include <stdio.h>
#include <stdlib.h>

int main() {
    int n = 5;
    // Allocates memory for 5 integers
    int *arr = (int*)malloc(n * sizeof(int));
    
    if (arr == NULL) {
        printf("Memory allocation failed!\\n");
        return 1;
    }
    
    for (int i = 0; i < n; i++) {
        arr[i] = i * 10;
    }
    
    // Always free the allocated memory!
    free(arr);
    return 0;
}
\`\`\`

### Common Pitfalls
* **Memory Leak**: Forgetting to \`free\` dynamic memory.
* **Dangling Pointer**: A pointer pointing to a memory location that has already been deallocated.
* **Segmentation Fault**: Attempting to read/write to restricted or NULL memory addresses.
`
  },
  {
    id: 10,
    title: "C++ OOP & STL Reference",
    domain: "Programming Languages",
    time: "11 min read",
    category: "C++",
    sources: ["GeeksforGeeks", "W3Schools"],
    content: `
# C++ OOP Concepts & Standard Template Library (STL)

C++ extends the C programming language with support for Object-Oriented Programming (OOP) and generic classes (templates).

## 1. Key Object-Oriented Features in C++
* **Constructor Overloading**: Creating multiple constructors with different parameters.
* **Destructors**: Methods called automatically when an object goes out of scope. Prefixed with \`~\`.
* **Virtual Functions**: Allows subclasses to implement polymorphism. If a base class function is declared \`virtual\`, C++ resolves overridden calls at runtime using a VTABLE.

\`\`\`cpp
#include <iostream>
using namespace std;

class Base {
public:
    virtual void print() { // Virtual function for runtime polymorphism
        cout << "Base class" << endl;
    }
    virtual ~Base() {} // Always declare virtual destructor in base classes!
};

class Derived : public Base {
public:
    void print() override {
        cout << "Derived class" << endl;
    }
};

int main() {
    Base* b = new Derived();
    b->print(); // Prints: "Derived class" (Runtime dispatch)
    delete b;
    return 0;
}
\`\`\`

## 2. Standard Template Library (STL)
STL provides a set of template classes representing containers, iterators, and algorithms.

### Key Containers:
1. **vector**: Dynamic contiguous array. Resizes automatically.
   * Time Complexity: Random access $O(1)$, back insertion $O(1)$ amortized.
2. **list**: Bidirectional non-contiguous list.
   * Time Complexity: Insertion/deletion $O(1)$, indexing $O(N)$.
3. **map** / **unordered_map**: Key-value pairs.
   * \`std::map\` is sorted (Red-Black Tree, $O(\\log N)$ lookup).
   * \`std::unordered_map\` is unsorted (Hash Table, $O(1)$ average lookup).
4. **set** / **unordered_set**: Collections of unique elements.

\`\`\`cpp
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::vector<int> nums = {4, 1, 8, 3};
    nums.push_back(5); // Appends element
    
    // STL Algorithm
    std::sort(nums.begin(), nums.end()); // Sorts vector
    
    for (int num : nums) {
        std::cout << num << " "; // Output: 1 3 4 5 8
    }
    return 0;
}
\`\`\`

## 3. References vs Pointers
* **Pointers** can be null, re-assigned, and require dereferencing (\`*\`).
* **References** are aliases of existing variables. They cannot be null and must be initialized when declared.
\`\`\`cpp
int a = 10;
int& ref = a; // ref is an alias of a. ref shares memory address with a.
ref = 20; // Modifies value of a
\`\`\`
`
  },
  {
    id: 11,
    title: "JavaScript Advanced Concurrency & OOP",
    domain: "Programming Languages",
    time: "12 min read",
    category: "JavaScript",
    sources: ["W3Schools", "GeeksforGeeks"],
    content: `
# JavaScript Core Features & Concurrency Model

JavaScript is a single-threaded, non-blocking, asynchronous, concurrent programming language using a prototype-based model for object-oriented programming.

## 1. The Event Loop (Asynchronous JS)
Although JS is single-threaded, it handles async tasks (like API fetches, timers) using Web APIs, the **Callback Queue**, the **Microtask Queue**, and the **Event Loop**.

* **Call Stack**: Synchronous code is executed line by line.
* **Microtask Queue**: High priority callbacks (e.g. Promises, \`queueMicrotask\`).
* **Callback Queue** (Macrotasks): Standard callbacks (e.g. \`setTimeout\`, DOM events).
* **Event Loop**: Monitors the Call Stack. If the Stack is empty, it pushes tasks from the Microtask Queue first, then the Callback Queue.

\`\`\`javascript
console.log("Start");

setTimeout(() => console.log("Timeout (Macrotask)"), 0);

Promise.resolve().then(() => console.log("Promise (Microtask)"));

console.log("End");

// Output:
// Start
// End
// Promise (Microtask)
// Timeout (Macrotask)
\`\`\`

## 2. Closures
A **Closure** is the combination of a function bundled together with references to its surrounding state (the **lexical environment**). It allows an inner function to access the scope of an outer function even after the outer function has returned.

\`\`\`javascript
function outerFunction(outerVariable) {
    return function innerFunction(innerVariable) {
        console.log(\`Outer: \${outerVariable}, Inner: \${innerVariable}\`);
    };
}

const newFunction = outerFunction("outside");
newFunction("inside"); // Output: Outer: outside, Inner: inside
\`\`\`

## 3. ES6+ Features
* **Destructuring**: Conveniently unpacking objects/arrays:
  \`\`\`javascript
  const person = { name: "John", age: 30 };
  const { name, age } = person;
  \`\`\`
* **Spread and Rest Operators** (\`...\`):
  \`\`\`javascript
  const arr1 = [1, 2];
  const arr2 = [...arr1, 3, 4]; // Spread: [1, 2, 3, 4]
  
  function sum(...args) { // Rest operator gathers parameters
      return args.reduce((a, b) => a + b, 0);
  }
  \`\`\`
* **Template Literals**: Multi-line strings and interpolation: \` \`Hello ${name}\` \`.

## 4. Promises & Async/Await
An elegant abstraction over callbacks to handle asynchronous operations.
\`\`\`javascript
// Fetch Example with Async/Await
async function fetchData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Fetch failed", error);
    }
}
\`\`\`
`
  },
  {
    id: 12,
    title: "Java & C++ Memory Models",
    domain: "Programming Languages",
    time: "15 min read",
    category: "Java",
    sources: ["DeepMind Handbook"],
    content: `
# Programming Language Memory Models: Java vs. C++

This module explores runtime visibility, hardware cache coherence, volatile semantics, and raw assembly instructions across Java and C++.

## 1. Quick Revision & Memory Tricks
* **JMM (Java Memory Model)**: Dictates visibility guarantees via *Happens-Before* edges (volatile writes, monitor locks).
* **C++ Memory Model**: Multi-copy atomicity and explicit memory orders (\`std::memory_order_seq_cst\`, \`std::memory_order_acquire\`, etc.).
* **Memory Trick (Acquire-Release)**: 
  * *Release* = "Push my writes down to memory." (Store-Store barrier)
  * *Acquire* = "Pull latest writes from memory." (Load-Load barrier)

## 2. Intuition & Real-World Application
Modern CPUs do out-of-order execution and use multi-layered cache hierachies (L1, L2, L3). Without a memory model, writes made by Thread A on Core 0 may remain in write-buffers and never become visible to Thread B on Core 1.
* **Real-world Context**: Building lock-free queues (Disruptor pattern) or atomic reference counters.

## 3. Java Happens-Before Rules
The Java Memory Model is defined by a set of partial orderings called *Happens-Before* rules:
1. **Program Order Rule**: Each action in a thread happens-before any action in that thread that comes later in program order.
2. **Volatile Variable Rule**: A write to a volatile field happens-before every subsequent read of that same field.
3. **Monitor Lock Rule**: An unlock on a monitor happens-before every subsequent lock on that same monitor.

## 4. Code Implementation & Walkthrough

### Java Memory Model: Double-Checked Locking (Thread-Safe)
\`\`\`java
public class SafeLazySingleton {
    private static volatile SafeLazySingleton instance;

    public static SafeLazySingleton getInstance() {
        SafeLazySingleton result = instance;
        if (result == null) {
            synchronized (SafeLazySingleton.class) {
                result = instance;
                if (result == null) {
                    instance = result = new SafeLazySingleton();
                }
            }
        }
        return result;
    }
}
\`\`\`

### C++ Memory Model: Acquire-Release Semantics
\`\`\`cpp
#include <atomic>
#include <thread>
#include <cassert>

std::atomic<int> data{0};
std::atomic<bool> ready{false};

void producer() {
    data.store(42, std::memory_order_relaxed);
    ready.store(true, std::memory_order_release); 
}

void consumer() {
    while (!ready.load(std::memory_order_acquire));
    assert(data.load(std::memory_order_relaxed) == 42);
}
\`\`\`

## 5. Comparison: Java vs. C++ Memory Operations

| Concept / Behavior | Java Memory Model | C++ Memory Model |
| :--- | :--- | :--- |
| **Default Variable Access** | Data races lead to undefined behavior or dirty reads | Data races cause full Undefined Behavior (UB) |
| **Sequential Consistency** | Default behavior for volatile variables | Default for std::atomic (\`memory_order_seq_cst\`) |
| **Fine-grained Control** | Limited (Unsafe/VarHandle) | Rich (\`memory_order_relaxed\`, \`memory_order_acquire\`, etc.) |

## 6. Edge Cases & Common Mistakes
* **Mistake**: Missing volatile in Double-Checked Locking. Without volatile, the compiler or CPU can reorder the constructor execution and the write to the reference pointer, exposing a partially-constructed object.
`
  },
  {
    id: 13,
    title: "The Master Theorem for Recurrences",
    domain: "Data Structures & Algorithms",
    time: "10 min read",
    category: "DSA",
    sources: ["DeepMind Handbook"],
    content: `
# The Master Theorem for Recurrences

This module covers the mathematical framework and proof structures for solving divide-and-conquer recurrence relations.

## 1. Quick Revision & Memory Tricks
* **Standard Form**: $T(n) = aT(n/b) + f(n)$ where $a \\ge 1$ and $b > 1$.
* **Critical Value**: $c_{crit} = \\log_b(a)$.
* **Comparison Rule**:
  * If $f(n) = O(n^c)$ where $c < c_{crit}$: $T(n) = \\Theta(n^{\\log_b a})$ (Case 1: Leaves dominate)
  * If $f(n) = \\Theta(n^{c_{crit}} \\log^k n)$: $T(n) = \\Theta(n^{\\log_b a} \\log^{k+1} n)$ (Case 2: Balanced cost)
  * If $f(n) = \\Omega(n^c)$ where $c > c_{crit}$ and regularity holds: $T(n) = \\Theta(f(n))$ (Case 3: Root dominates)

## 2. Intuition
When solving divide-and-conquer algorithms, we split a problem into $a$ subproblems of size $n/b$, doing $f(n)$ non-recursive work. The total runtime depends on the tension between the recursive branching cost (base cases/leaves) and the root-level partition cost.

## 3. Summary of Standard Cases

| Recurrence Relation | $a$ | $b$ | $f(n)$ | $\\log_b a$ | Case | Big-O Complexity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Binary Search** | 1 | 2 | $1$ | 0 | Case 2 ($k=0$) | $O(\\log n)$ |
| **Merge Sort** | 2 | 2 | $n$ | 1 | Case 2 ($k=0$) | $O(n \\log n)$ |
| **Matrix Mult (Strassen)** | 7 | 2 | $n^2$ | 2.81 | Case 1 | $O(n^{2.81})$ |

## 4. Multi-Language Complexity Simulations

### Java: Simulation of Merge Sort Complexities
\`\`\`java
public class MergeSortRecurrenceSim {
    public static void mergeSortSim(int n) {
        if (n <= 1) return;
        mergeSortSim(n / 2);
        mergeSortSim(n / 2);
        for (int i = 0; i < n; i++) {
            // linear scanning work
        }
    }
}
\`\`\`

### C++: Simulation of Binary Search Complexities
\`\`\`cpp
void binarySearchSim(int n) {
    if (n <= 1) return;
    binarySearchSim(n / 2);
    int pivotWork = 0 + 1; 
}
\`\`\`

## 5. Edge Cases & Advanced Generalizations
* **Fractional Subproblem Sizes**: The Master Theorem does not directly handle recurrences like $T(n) = T(n/3) + T(2n/3) + n$. Use the **Akra-Bazzi method** or recursion trees.
* **Failure of Regularity Condition**: For Case 3, we must verify $a \\cdot f(n/b) \\le c \\cdot f(n)$ for some $c < 1$.
`
  },
  {
    id: 14,
    title: "The CAP Theorem & PACELC",
    domain: "Database Management System",
    time: "12 min read",
    category: "DBMS",
    sources: ["DeepMind Handbook"],
    content: `
# Distributed Systems: The CAP Theorem & PACELC

This module covers consistency-availability tradeoffs, network partitioning events, and PACELC refinements in distributed data store design.

## 1. Quick Revision & Memory Tricks
* **CAP Theorem**: A distributed system can guarantee at most two of: **Consistency (C)**, **Availability (A)**, and **Partition Tolerance (P)** during a network partition.
* **The Reality**: Network partitions ($P$) are inevitable on the internet. Therefore, we only choose between **CP** (Consistency on partition) and **AP** (Availability on partition).
* **PACELC Extension**: **P**artition $\\rightarrow$ choose **A**vailability or **C**onsistency; **E**lse (no partition) $\\rightarrow$ choose **L**atency or **C**onsistency.
* **Memory Trick**: 
  * *CP Databases* (e.g. Spanner/HBase): "Errors are better than wrong data."
  * *AP Databases* (e.g. Cassandra/Dynamo): "Stale data is better than errors."

## 2. Intuition & Real-World Application
Imagine a banking system spanning New York and London. If the transatlantic fiber optic line is severed (a network partition), London cannot sync account balances with New York.
* **If CP is chosen**: A London client trying to withdraw money is blocked or receives a \`500 Server Error\` to prevent double-spending.
* **If AP is chosen**: The client gets their cash immediately, but the system balance becomes out-of-sync. When the network heals, the balances are reconciled asynchronously.

## 3. PACELC Classification Table

| System / Database | CAP Choice | Else Trade-off (Normal operation) | PACELC Classification |
| :--- | :--- | :--- | :--- |
| **DynamoDB / Cassandra** | AP | Latency (L) over Consistency | **PA / EL** |
| **MongoDB** | CP | Consistency (C) over Latency | **PC / EC** |
| **Spanner (Google)** | CP | Consistency (C) over Latency | **PC / EC** |

## 4. Mock Implementations of CP vs AP Reads

### CP Mock Implementation (Java)
\`\`\`java
public class CPNode {
    private String data;
    private boolean isPartitioned;

    public synchronized String readData() throws Exception {
        if (isPartitioned) {
            throw new Exception("Error 500: Database Partitioned. Cannot reach consensus.");
        }
        return this.data;
    }
}
\`\`\`

### AP Mock Implementation (Python)
\`\`\`python
class APNode:
    def __init__(self):
        self.data = "Initial Value"
        self.is_partitioned = False
        self.version = 1

    def read_data(self):
        return {
            "status": "200 OK",
            "data": self.data,
            "version": self.version,
            "warning": "May contain stale read due to partition" if self.is_partitioned else None
        }
\`\`\`
`
  },
  {
    id: 15,
    title: "JVM Internals & Garbage Collection",
    domain: "Programming Languages",
    time: "20 min read",
    category: "Java",
    sources: ["Java Master Handbook"],
    content: `
# Chapter 04: JVM Internals & Garbage Collection

This chapter explores class loading subsystems, memory allocations (Stack, Heap, Metaspace), execution engines, and automated Garbage Collection (GC) algorithms.

## 1. Concept Definition & Intuition

* **JLS/JVMS Specification**: The Java Virtual Machine (JVM) is an abstract computing machine that features an instruction set, uses memory regions, and compiles bytecode to native hardware code dynamically using JIT compilers.
* **Why it exists**: To guarantee the "Write Once, Run Anywhere" (WORA) capability by abstracting physical CPU architectures and OS details.
* **Real-world Analogy**: A universal translator at an international assembly. No matter what native language (OS) the host speaks, the translator (JVM) translates the standard code (Bytecode) to the local instructions in real time.

## 2. Internals & Architecture

### Stack vs. Heap Allocation Flow
* **Stack**: Holds thread-specific execution frames containing local variables and reference pointers. It grows and shrinks in a Last-In-First-Out (LIFO) order as methods are invoked.
* **Heap**: A shared memory region holding all objects and instance fields. It is scanned by the GC when space runs low.

\`\`\`
+--------------------------------------+     +-----------------------------------------+
|           JVM STACK FRAME            |     |                JVM HEAP                 |
|                                      |     |                                         |
|  [main() Frame]                      |     |  [Object Instance]                      |
|  localValRef ----------------------------->|  { val: 42, label: "Demo" }             |
|                                      |     |                                         |
+--------------------------------------+     +-----------------------------------------+
\`\`\`

## 3. Code Implementation Examples

### Basic Example: Class Loading Lifecycle Trigger
\`\`\`java
public class ClassLoadingDemo {
    static {
        System.out.println("Static initializer executed: Class is initialized.");
    }

    public static void main(String[] args) throws ClassNotFoundException {
        System.out.println("Main method started.");
        Class.forName("java.sql.Driver");
    }
}
\`\`\`

### Intermediate Example: Heap Object Generation & GC Request
\`\`\`java
public class MemoryAllocationDemo {
    public static void main(String[] args) {
        System.out.println("Allocating short-lived objects on the Heap...");
        for (int i = 0; i < 1_000_000; i++) {
            String temp = new String("Allocation " + i);
        }
        System.out.println("Requesting JVM System GC check (Explicit Suggestion)...");
        System.gc(); 
    }
}
\`\`\`

### Advanced Enterprise Example: Custom ClassLoader for Hot-Swapping Classes
\`\`\`java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

public class CustomClassReloader extends ClassLoader {
    private final String classDir;

    public CustomClassReloader(String classDir) {
        this.classDir = classDir;
    }

    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        String classPath = classDir + name.replace('.', '/') + ".class";
        try {
            byte[] rawBytes = Files.readAllBytes(Paths.get(classPath));
            return defineClass(name, rawBytes, 0, rawBytes.length);
        } catch (IOException e) {
            throw new ClassNotFoundException("Failed to load class " + name, e);
        }
    }
}
\`\`\`

## 4. Complexity, Trade-offs & GC selection

| Category | Time Complexity (Operation) | Space Complexity (Overhead) | Notes |
| :--- | :--- | :--- | :--- |
| **Interpreter execution** | $O(1)$ per bytecode instruction | $O(1)$ stack frame | Slower initialization speed, low compilation latency |
| **JIT Compile (C2)** | $O(N)$ compiler runtime | $O(N)$ code cache size | Highly optimized, fast execution once compiled |
| **G1 GC Sweep** | $O(\\text{Live Objects})$ | ~10-15% heap auxiliary data | Great for medium-to-large heaps with predictable latency |
| **ZGC Sweep** | $O(1)$ concurrent pause time | ~2% virtual space overhead | Scale up to terabytes with pause times under 1ms |

## 5. Mini Project: Custom Memory Tracker Simulator

Create a Java console tool simulating JVM Garbage collection sweeps based on reference counting:

\`\`\`java
import java.util.HashMap;
import java.util.Map;

public class MiniGCSimulator {
    private final Map<String, Integer> refCounts = new HashMap<>();

    public void allocate(String objId) {
        refCounts.put(objId, 1);
        System.out.println("Allocated object: " + objId);
    }

    public void addReference(String objId) {
        refCounts.put(objId, refCounts.getOrDefault(objId, 0) + 1);
    }

    public void removeReference(String objId) {
        if (refCounts.containsKey(objId)) {
            int counts = refCounts.get(objId) - 1;
            if (counts <= 0) {
                refCounts.remove(objId);
                System.out.println("Garbage Collector: Reclaimed object due to 0 reference count: " + objId);
            } else {
                refCounts.put(objId, counts);
            }
        }
    }
}
\`\`\`
`
  },
  {
    id: 16,
    title: "Java Collections Framework",
    domain: "Programming Languages",
    time: "15 min read",
    category: "Java",
    sources: ["Java Master Handbook"],
    content: `
# Java Collections Framework Deep-Dive

The Java Collections Framework provides an architecture to store and manipulate a group of objects. It includes interfaces, implementations, and algorithms.

## 1. Quick Revision & Hierarchy
* **Collection Interface**: Extends \`Iterable\`. Inherited by \`List\`, \`Set\`, and \`Queue\`.
* **Map Interface**: Standalone key-value mapping interface.
* **Red-Black Trees**: Used by \`TreeMap\` and \`TreeSet\` to maintain sorting order.

## 2. HashMap Internals
* **Resizing threshold**: HashMap doubles capacity when size reaches \`Capacity * Load Factor\` (default load factor is 0.75).
* **Collision Resolution**: Resolves collisions using linked list chaining. In Java 8+, if a bucket exceeds \`TREEIFY_THRESHOLD = 8\`, the linked list converts to a balanced Red-Black Tree to optimize worst-case search latency from $O(N)$ to $O(\\log N)$.

## 3. Code Implementation: Custom Sort with Comparator
\`\`\`java
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

class Student {
    String name;
    int score;

    public Student(String name, int score) {
        this.name = name;
        this.score = score;
    }
}

public class CollectionsDemo {
    public static void main(String[] args) {
        List<Student> students = new ArrayList<>();
        students.add(new Student("Alice", 85));
        students.add(new Student("Bob", 95));

        // Sorting dynamically based on score descending
        Collections.sort(students, (s1, s2) -> Integer.compare(s2.score, s1.score));
        
        for (Student s : students) {
            System.out.println(s.name + ": " + s.score);
        }
    }
}
\`\`\`
`
  },
  {
    id: 17,
    title: "Java Multithreading & Concurrency",
    domain: "Programming Languages",
    time: "18 min read",
    category: "Java",
    sources: ["Java Master Handbook"],
    content: `
# Java Multithreading & Concurrency

A comprehensive guide to managing concurrent executions, thread pools, and lock-free coordination.

## 1. Thread Lifecycle
Threads transition between 6 states managed by JVM & OS Scheduler:
1. **New**: Created but not yet started.
2. **Runnable**: Ready to run or executing.
3. **Blocked**: Waiting for monitor lock acquisition.
4. **Waiting**: Waiting indefinitely due to \`wait()\` or \`join()\`.
5. **Timed_Waiting**: Waiting with timeout limit.
6. **Terminated**: Run method execution completed.

## 2. Lock Synchronization with ReentrantLock
Unlike \`synchronized\` blocks, \`ReentrantLock\` allows polling lock states and fair scheduling configurations.

\`\`\`java
import java.util.concurrent.locks.ReentrantLock;

public class LockCounter {
    private final ReentrantLock lock = new ReentrantLock();
    private int count = 0;

    public void increment() {
        lock.lock(); // Blocks until lock is acquired
        try {
            count++;
        } finally {
            lock.unlock(); // Ensure unlock runs in finally block
        }
    }
}
\`\`\`

## 3. Producer-Consumer with ArrayBlockingQueue
\`\`\`java
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

public class ProducerConsumerDemo {
    public static void main(String[] args) throws InterruptedException {
        BlockingQueue<Integer> queue = new ArrayBlockingQueue<>(5);

        // Thread-safe Producer
        Thread producer = new Thread(() -> {
            try {
                queue.put(1); // blocks if queue is full
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        // Thread-safe Consumer
        Thread consumer = new Thread(() -> {
            try {
                int val = queue.take(); // blocks if queue is empty
                System.out.println("Consumed: " + val);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        producer.start();
        consumer.start();
    }
}
\`\`\`
`
  },
  {
    id: 18,
    title: "SOLID Design Principles in Java",
    domain: "Software Engineering",
    time: "12 min read",
    category: "Java",
    sources: ["Java Master Handbook"],
    content: `
# SOLID Design Principles in Java

Guidelines for writing robust, extensible, and clean object-oriented systems.

## 1. The Principles
* **Single Responsibility (SRP)**: A class should have only one reason to change.
* **Open/Closed (OCP)**: Classes should be open for extension but closed for modification.
* **Liskov Substitution (LSP)**: Derived classes must be fully substitutable for their base classes.
* **Interface Segregation (ISP)**: Clients should not be forced to depend on interfaces they do not use.
* **Dependency Inversion (DIP)**: Depend on abstractions, not concretions.

## 2. Dependency Inversion in Action
By designing interfaces, high-level policies do not depend on low-level drivers.

\`\`\`java
// Abstraction contract
interface Database {
    void save(String data);
}

// Low-level implementation
class MySqlDatabase implements Database {
    public void save(String data) {
        System.out.println("Saved to MySQL: " + data);
    }
}

// High-level policy depends on interface abstraction
class DataOrchestrator {
    private final Database db;

    public DataOrchestrator(Database db) {
        this.db = db;
    }

    public void process(String payload) {
        db.save(payload);
    }
}
\`\`\`
`
  },
  {
    id: 19,
    title: "Modern Java: Virtual Threads (Project Loom)",
    domain: "Programming Languages",
    time: "10 min read",
    category: "Java",
    sources: ["Java Master Handbook"],
    content: `
# Modern Java: Virtual Threads (Project Loom)

Virtual threads are lightweight threads introduced in Java 21 to improve application scalability and reduce thread overhead.

## 1. Platform Threads vs. Virtual Threads
* **Platform Threads**: Maps directly to OS thread resources. Blocking a platform thread locks physical memory stack frames.
* **Virtual Threads**: Managed by the JVM runtime scheduler. When a virtual thread is blocked during I/O operations, the JVM schedules other virtual threads over the host carrier thread, maximizing processor utilization.

## 2. Implementation Syntax
\`\`\`java
import java.util.concurrent.Executors;

public class VirtualThreadDemo {
    public static void main(String[] args) throws InterruptedException {
        // Starts a single virtual thread
        Thread vt = Thread.startVirtualThread(() -> {
            System.out.println("Virtual thread: " + Thread.currentThread());
        });
        vt.join();

        // Virtual Thread Executor Pool
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < 100; i++) {
                executor.submit(() -> {
                    // Do task
                });
            }
        } // Executor auto-closes, blocking until all tasks complete
    }
}
\`\`\`
`
  },
  {
    id: 20,
    title: "Java Stream API & Lambda Expressions",
    domain: "Programming Languages",
    time: "12 min read",
    category: "Java",
    sources: ["Java Master Handbook"],
    content: `
# Java Stream API & Lambda Expressions

Java 8 introduced functional programming paradigms to support declarations-based collection mutations.

## 1. Stream Pipelines
A stream pipeline consists of:
1. **Source**: An array or collection (\`list.stream()\`).
2. **Intermediate Operations**: Evaluated lazily (\`filter\`, \`map\`, \`sorted\`), returning a new stream.
3. **Terminal Operations**: Evaluated eagerly (\`collect\`, \`forEach\`, \`reduce\`), closing the pipeline.

## 2. Advanced Collectors (Grouping)
\`\`\`java
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

class Employee {
    String department;
    int salary;

    public Employee(String department, int salary) {
        this.department = department;
        this.salary = salary;
    }
}

public class StreamDemo {
    public static void main(String[] args) {
        List<Employee> staff = List.of(
            new Employee("HR", 50000),
            new Employee("IT", 80000),
            new Employee("IT", 95000)
        );

        // Grouping employees by department
        Map<String, List<Employee>> deptMap = staff.stream()
            .collect(Collectors.groupingBy(e -> e.department));

        // Summing salaries per department
        Map<String, Integer> salaryMap = staff.stream()
            .collect(Collectors.groupingBy(
                e -> e.department,
                Collectors.summingInt(e -> e.salary)
            ));

        System.out.println(salaryMap); // Output: {HR=50000, IT=175000}
    }
}
\`\`\`
`
  },
  {
    id: 21,
    title: "OS Memory Management: Paging & TLB",
    domain: "Operating System",
    time: "12 min read",
    category: "OS",
    sources: ["CS Handbook"],
    content: `
# OS Memory Management: Paging & TLB

Operating Systems use Virtual Memory to abstract physical memory layout, providing isolation and larger address spaces.

## 1. Paging Mechanics
* **Pages**: Fixed-size blocks of virtual memory.
* **Page Frames**: Fixed-size blocks of physical memory.
* **Page Table**: A data structure mapping virtual pages to physical frames.
* **Page Fault**: Occurs when a program accesses a page that is not currently mapped in physical RAM. The OS must load the page from disk swap space.

## 2. TLB (Translation Lookaside Buffer)
The **TLB** is a high-speed hardware cache in the CPU Memory Management Unit (MMU). It caches recent virtual-to-physical address translations, preventing the need to scan the page table in RAM for every memory access.

\`\`\`
Virtual Address ---> [ MMU / TLB Cache ] --(Hit)--> Physical RAM Frame
                           |
                        (Miss)
                           v
                    [ Page Table in RAM ]
\`\`\`

## 3. Code Simulation: Page Table Lookup
\`\`\`python
class PageTableSim:
    def __init__(self, page_size=4096):
        self.page_size = page_size
        self.table = {0: 5, 1: 12, 2: 8} # virtual page -> physical frame

    def translate(self, virtual_address):
        page_num = virtual_address // self.page_size
        offset = virtual_address % self.page_size

        if page_num in self.table:
            frame_num = self.table[page_num]
            physical_address = (frame_num * self.page_size) + offset
            return f"Virtual: {virtual_address} -> Physical: {physical_address}"
        else:
            return "Page Fault! Triggering OS disk fetch."
\`\`\`
`
  },
  {
    id: 22,
    title: "Computer Networks: TCP/IP & TLS",
    domain: "Computer Networks",
    time: "15 min read",
    category: "Web Dev",
    sources: ["CS Handbook"],
    content: `
# Computer Networks: TCP/IP Stack & TLS Handshake

Modern web systems communicate using layered protocols that guarantee reliable transmission and secure encryption.

## 1. TCP/IP Layer Model
* **Application**: HTTP/3, DNS, gRPC
* **Transport**: TCP (Reliable, connection-oriented) / UDP (Unreliable, connectionless)
* **Internet**: IP (Packet routing)
* **Link**: Ethernet, Wi-Fi

## 2. TCP 3-Way Handshake
Establishes a reliable connection between Client and Server:
1. **SYN**: Client sends synchronization packet with random seq number.
2. **SYN-ACK**: Server acknowledges and sends its synchronization packet.
3. **ACK**: Client acknowledges. Connection established.

\`\`\`
Client                   Server
  | ------- SYN --------> |
  | <----- SYN-ACK ------ |
  | ------- ACK --------> |
\`\`\`

## 3. TLS 1.3 Cryptographic Handshake
TLS 1.3 encrypts communication in a single round-trip (1-RTT):
1. **Client Hello**: Sends cipher suites and key share values.
2. **Server Hello**: Server selects cipher suite, sends certificate, signature, and its key share. Both compute master key.
3. **Finished**: Encrypted transmission begins.

## 4. Code Example: Java Socket TCP Server
\`\`\`java
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.ServerSocket;
import java.net.Socket;

public class TcpServerDemo {
    public static void main(String[] args) throws Exception {
        try (ServerSocket server = new ServerSocket(8081)) {
            System.out.println("TCP Server listening on port 8081...");
            while (true) {
                try (Socket socket = server.accept();
                     BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {
                    String line = reader.readLine();
                    System.out.println("Received client packet payload: " + line);
                }
            }
        }
    }
}
\`\`\`
`
  },
  {
    id: 23,
    title: "Advanced C++: Templates & Smart Pointers",
    domain: "Programming Languages",
    time: "14 min read",
    category: "C++",
    sources: ["CS Handbook"],
    content: `
# Advanced C++: Templates & Smart Pointers

Modern C++ (C++11 and beyond) uses Resource Acquisition Is Initialization (RAII) and generic templates to write memory-safe code.

## 1. C++ Templates
Allows writing generic code that is compiled into specific types at compile-time (Zero-overhead abstraction).

\`\`\`cpp
#include <iostream>

template <typename T>
T findMax(T a, T b) {
    return (a > b) ? a : b;
}

int main() {
    std::cout << findMax<int>(5, 10) << std::endl;      // Compiles int version
    std::cout << findMax<double>(5.5, 2.3) << std::endl; // Compiles double version
    return 0;
}
\`\`\`

## 2. RAII & Smart Pointers
* **\`std::unique_ptr\`**: Exclusive ownership of heap resource. Automatically deleted when pointer goes out of scope.
* **\`std::shared_ptr\`**: Shared ownership via reference counting. Deleted when ref count reaches 0.
* **\`std::weak_ptr\`**: Non-owning reference. Prevents cyclic dependency memory leaks.

\`\`\`cpp
#include <memory>
#include <iostream>

class Resource {
public:
    Resource() { std::cout << "Resource Allocated\\n"; }
    ~Resource() { std::cout << "Resource Automatically Released\\n"; }
};

int main() {
    {
        // Scope limit
        std::unique_ptr<Resource> ptr = std::make_unique<Resource>();
    } // destructor runs, releasing memory immediately
    return 0;
}
\`\`\`
`
  },
  {
    id: 24,
    title: "Database Indexing: B+ Trees vs LSM Trees",
    domain: "Database Management System",
    time: "12 min read",
    category: "DBMS",
    sources: ["CS Handbook"],
    content: `
# Database Indexing: B+ Trees vs LSM Trees

Indexes accelerate data lookup times in databases. The chosen indexing structure determines read vs write performance.

## 1. B+ Trees
* **Design**: Balanced search tree optimized for disk I/O. All data is stored in leaf nodes; internal nodes store routing keys.
* **Pros**: $O(\\log N)$ point lookups, efficient range queries.
* **Cons**: Random disk writes during updates can cause page splits and high write amplification.
* **Workloads**: Read-heavy relational databases (e.g. MySQL, PostgreSQL).

## 2. LSM Trees (Log-Structured Merge Trees)
* **Design**: Consists of an in-memory sorted buffer (**MemTable**), an append-only commit log, and layered on-disk immutable files (**SSTables**).
* **Pros**: Writes are converted to sequential append operations, maximizing write throughput.
* **Cons**: Reading can require searching multiple SSTables, leading to higher read latency.
* **Workloads**: Write-heavy NoSQL databases (e.g. Cassandra, RocksDB).

## 3. Structural Comparison

| Feature | B+ Tree | LSM Tree |
| :--- | :--- | :--- |
| **Write Cost** | High (Random disk updates) | Low (Sequential appends) |
| **Read Cost** | Low (Predictable leaf lookup) | Medium-High (May query multiple SSTables) |
| **Storage Structure** | Mutates pages in-place | Append-only immutable SSTable pages |
`
  },
  {
    id: 25,
    title: "Python GIL & Memory Management",
    domain: "Programming Languages",
    time: "10 min read",
    category: "Python",
    sources: ["CS Handbook"],
    content: `
# Python GIL & Memory Management

Understanding how CPython handles thread concurrency and garbage collection internals.

## 1. CPython GIL (Global Interpreter Lock)
* **Definition**: A mutex lock that prevents multiple native threads from executing Python bytecodes at once.
* **Why it exists**: Simplifies memory management by making CPython's internal state (especially reference counts) thread-safe.
* **Consequence**: Python multithreading does not yield true parallel execution on multi-core systems for CPU-bound tasks. Use \`multiprocessing\` or asynchronous runtimes (\`asyncio\`) instead.

## 2. Memory Collection (Reference Counting)
* Python objects store a reference count. When a reference goes out of scope or is deleted, the count decrements.
* When the reference count reaches 0, the object is immediately reclaimed.

## 3. Cyclic Garbage Collector
Reference counting alone cannot detect cyclic reference dependencies (e.g., Node A points to Node B, and Node B points back to Node A, both detached from root).
* **The Solution**: CPython runs a generational cyclic garbage collector that periodically inspects container objects to find and break isolated reference cycles.
`
  },
  {
    id: 26,
    title: "Java OOP: Inheritance, Polymorphism & SOLID Principles",
    domain: "Programming Languages",
    time: "18 min read",
    category: "Java",
    sources: ["Oracle JLS", "Java Handbook"],
    content: `
# Java OOP: Inheritance, Polymorphism & SOLID Principles

Object-Oriented Programming (OOP) in Java is built on four pillars: **Abstraction**, **Encapsulation**, **Inheritance**, and **Polymorphism**.

---

## 1. Inheritance Deep Dive

Inheritance creates an **IS-A** relationship. Java uses single-class inheritance (one parent class) but supports multiple interface inheritance.

### Inheritance Hierarchy:
\`\`\`
         Object (java.lang.Object)
             |
         Animal (abstract)
          /      \\
       Dog       Cat
        |
    GoldenRetriever
\`\`\`

\`\`\`java
// Abstract parent — defines contract
abstract class Animal {
    private String name;

    public Animal(String name) { this.name = name; }

    public String getName() { return name; }

    // Abstract method — subclasses MUST implement
    public abstract String makeSound();

    // Concrete method — inherited as-is
    public String describe() {
        return getName() + " says: " + makeSound();
    }
}

class Dog extends Animal {
    private String breed;

    public Dog(String name, String breed) {
        super(name); // Call parent constructor FIRST
        this.breed = breed;
    }

    @Override
    public String makeSound() { return "Woof!"; }

    public String getBreed() { return breed; }
}

class Cat extends Animal {
    @Override
    public String makeSound() { return "Meow!"; }

    public Cat(String name) { super(name); }
}

// Usage
Animal dog = new Dog("Rex", "Labrador"); // Upcasting
System.out.println(dog.describe());     // "Rex says: Woof!"
// dog.getBreed();  // COMPILE ERROR — Animal ref doesn't know getBreed()
Dog realDog = (Dog) dog;                // Downcasting
System.out.println(realDog.getBreed()); // "Labrador"
\`\`\`

---

## 2. Polymorphism: Compile-time vs Runtime

| Type | Mechanism | Resolved At | Example |
| :--- | :--- | :--- | :--- |
| **Compile-time** | Method Overloading | Compile time | Same name, different params |
| **Runtime** | Method Overriding | JVM dispatch | @Override with dynamic dispatch |

\`\`\`java
class Calculator {
    // OVERLOADING (compile-time polymorphism)
    public int add(int a, int b) { return a + b; }
    public double add(double a, double b) { return a + b; }
    public String add(String a, String b) { return a + b; } // String concat

    public static void main(String[] args) {
        Calculator calc = new Calculator();
        System.out.println(calc.add(1, 2));       // → 3 (int version)
        System.out.println(calc.add(1.5, 2.5));   // → 4.0 (double version)
        System.out.println(calc.add("Hi ", "!")); // → "Hi !" (String version)
    }
}
\`\`\`

### Dynamic Method Dispatch (Runtime Polymorphism)
\`\`\`java
class Shape {
    public double area() { return 0; }
}
class Circle extends Shape {
    double radius;
    Circle(double r) { this.radius = r; }
    @Override public double area() { return Math.PI * radius * radius; }
}
class Rectangle extends Shape {
    double w, h;
    Rectangle(double w, double h) { this.w = w; this.h = h; }
    @Override public double area() { return w * h; }
}

// Polymorphic collection
Shape[] shapes = { new Circle(5), new Rectangle(4, 6) };
for (Shape s : shapes) {
    System.out.println(s.area()); // JVM picks correct implementation at runtime
}
// Output: 78.53... and 24.0
\`\`\`

---

## 3. Interfaces vs Abstract Classes

| Feature | Interface | Abstract Class |
| :--- | :--- | :--- |
| Fields | Only \`public static final\` | Any modifier |
| Methods | \`default\`, \`static\`, or abstract | Any type |
| Constructor | ❌ Not allowed | ✅ Allowed |
| Multiple Inheritance | ✅ Multiple interfaces | ❌ Single class only |
| When to use | Define a **capability/role** | Share **common code** |

\`\`\`java
interface Flyable {
    int MAX_ALTITUDE = 40000; // implicitly public static final

    void fly(); // implicitly public abstract

    default String landingProtocol() {
        return "Standard landing sequence initiated";
    }
}

interface Swimmable {
    void swim();
}

class Duck extends Animal implements Flyable, Swimmable {
    Duck(String name) { super(name); }

    @Override public String makeSound() { return "Quack!"; }
    @Override public void fly() { System.out.println("Duck flying low"); }
    @Override public void swim() { System.out.println("Duck paddling"); }
}
\`\`\`

---

## 4. SOLID Principles

| Principle | Full Name | Rule |
| :--- | :--- | :--- |
| **S** | Single Responsibility | A class should have one, and only one, reason to change |
| **O** | Open/Closed | Open for extension, closed for modification |
| **L** | Liskov Substitution | Subtypes must be substitutable for base types |
| **I** | Interface Segregation | Prefer small, focused interfaces over fat ones |
| **D** | Dependency Inversion | Depend on abstractions, not concretions |

\`\`\`java
// D — Dependency Inversion Principle
// BAD: High-level module directly depends on low-level detail
class EmailService { public void sendEmail(String msg) { /*...*/ } }
class OrderService {
    private EmailService emailService = new EmailService(); // tight coupling ❌
    public void placeOrder() { emailService.sendEmail("Order placed"); }
}

// GOOD: Depend on abstraction
interface NotificationService { void notify(String msg); }
class EmailNotification implements NotificationService {
    @Override public void notify(String msg) { System.out.println("Email: " + msg); }
}
class SMSNotification implements NotificationService {
    @Override public void notify(String msg) { System.out.println("SMS: " + msg); }
}
class OrderServiceFixed {
    private final NotificationService notifier; // depend on interface ✅
    public OrderServiceFixed(NotificationService notifier) {
        this.notifier = notifier;
    }
    public void placeOrder() { notifier.notify("Order placed!"); }
}
// Now we can inject Email, SMS, or any future notifier
\`\`\`

---

## Interview Questions
1. What is the difference between method overloading and method overriding?
2. Can a class extend multiple abstract classes? Can it implement multiple interfaces?
3. What is the **diamond problem** in Java and how does Java solve it?
4. When should you use an abstract class instead of an interface?
5. What does \`super()\` do and why must it be the first statement in a constructor?
`
  },
  {
    id: 27,
    title: "Java Exception Handling: Checked, Unchecked & Best Practices",
    domain: "Programming Languages",
    time: "14 min read",
    category: "Java",
    sources: ["Oracle Docs", "Java Handbook"],
    content: `
# Java Exception Handling: Checked, Unchecked & Best Practices

Exception handling in Java is a mechanism to handle runtime errors gracefully without crashing the program.

---

## 1. The Exception Hierarchy

\`\`\`
                 Throwable
                /          \\
           Error           Exception
            |             /         \\
      OutOfMemoryError  IOException  RuntimeException
      StackOverflowError             /      |       \\
                          NullPointerException  ArrayIndexOutOfBoundsException  ClassCastException
\`\`\`

| Type | Examples | Must Catch? | When Thrown |
| :--- | :--- | :--- | :--- |
| **Checked Exception** | \`IOException\`, \`SQLException\` | ✅ Yes | Anticipated, recoverable conditions |
| **Unchecked Exception** | \`NullPointerException\`, \`ArithmeticException\` | ❌ No | Programming errors, logic bugs |
| **Error** | \`OutOfMemoryError\`, \`StackOverflowError\` | ❌ No | JVM-level failures, not recoverable |

---

## 2. try-catch-finally-try-with-resources

\`\`\`java
import java.io.*;

public class ExceptionDemo {

    // 1. Basic try-catch-finally
    public static void basicHandling() {
        try {
            int result = 10 / 0; // ArithmeticException thrown here
        } catch (ArithmeticException e) {
            System.out.println("Caught: " + e.getMessage()); // "/ by zero"
        } finally {
            System.out.println("Finally ALWAYS executes (cleanup here)");
        }
    }

    // 2. Multi-catch block (Java 7+)
    public static void multiCatch(String input) {
        try {
            int[] arr = new int[5];
            arr[10] = Integer.parseInt(input); // Could throw NumberFormat or AIOOB
        } catch (NumberFormatException | ArrayIndexOutOfBoundsException e) {
            System.out.println("Caught multi: " + e.getClass().getSimpleName());
        }
    }

    // 3. Try-with-resources (AutoCloseable — Java 7+)
    public static void readFile(String path) {
        try (BufferedReader reader = new BufferedReader(new FileReader(path))) {
            String line;
            while ((line = reader.readLine()) != null) {
                System.out.println(line);
            }
        } catch (IOException e) {
            System.err.println("File error: " + e.getMessage());
        }
        // reader is automatically closed — no finally block needed!
    }
}
\`\`\`

---

## 3. Custom Exceptions

\`\`\`java
// Custom Checked Exception
class InsufficientFundsException extends Exception {
    private double amount;

    public InsufficientFundsException(double amount) {
        super("Insufficient funds. Shortfall: $" + amount);
        this.amount = amount;
    }

    public double getAmount() { return amount; }
}

// Custom Unchecked Exception
class InvalidUserException extends RuntimeException {
    public InvalidUserException(String userId) {
        super("User not found: " + userId);
    }
}

// Usage in a service
class BankAccount {
    private double balance;

    public BankAccount(double balance) { this.balance = balance; }

    public void withdraw(double amount) throws InsufficientFundsException {
        if (amount > balance) {
            throw new InsufficientFundsException(amount - balance);
        }
        balance -= amount;
        System.out.println("Withdrew $" + amount + ". Remaining: $" + balance);
    }
}

// Caller must handle checked exception
BankAccount account = new BankAccount(100.0);
try {
    account.withdraw(150.0); // Throws InsufficientFundsException
} catch (InsufficientFundsException e) {
    System.out.println(e.getMessage()); // "Insufficient funds. Shortfall: $50.0"
    System.out.println("Shortfall: $" + e.getAmount());
}
\`\`\`

---

## 4. Best Practices

| Practice | Do This | Avoid This |
| :--- | :--- | :--- |
| **Be Specific** | Catch specific exception types | \`catch (Exception e)\` swallows all |
| **Don't Swallow** | Log or rethrow | Empty catch blocks \`{}\` |
| **Use try-with-resources** | \`try (Stream s = ...)\` | Manual \`finally { s.close(); }\` |
| **Don't use for flow** | Use conditionals | Throwing exceptions for control flow |
| **Wrap lower-level** | Throw domain exceptions | Expose \`SQLException\` to callers |

\`\`\`java
// BAD — Swallowing exception
try { riskyOperation(); } catch (Exception e) { } // ❌ Silent failure!

// BAD — Exception as control flow
try {
    int result = Integer.parseInt(userInput);
} catch (NumberFormatException e) {
    result = 0; // ❌ Use conditional check instead
}

// GOOD — Proper handling with logging
try {
    riskyOperation();
} catch (SpecificException e) {
    logger.error("Operation failed: {}", e.getMessage(), e); // ✅
    throw new ServiceException("Failed to process request", e); // ✅ Wrap & rethrow
}

// GOOD — Validate before parsing
if (isNumeric(userInput)) {
    int result = Integer.parseInt(userInput); // ✅
}
\`\`\`

---

## 5. Exception Chaining

\`\`\`java
public void processOrder(int orderId) throws OrderException {
    try {
        dbService.fetchOrder(orderId); // Throws SQLException
    } catch (SQLException e) {
        // Chain the cause — preserves original stack trace
        throw new OrderException("Failed to process order " + orderId, e);
    }
}

// Caller can access original cause:
try {
    processOrder(42);
} catch (OrderException e) {
    System.out.println("Cause: " + e.getCause()); // Original SQLException
}
\`\`\`

---

## Interview Questions
1. What is the difference between \`throw\` and \`throws\`?
2. Can we have a \`try\` block without a \`catch\` block?
3. What happens if an exception is thrown inside a \`finally\` block?
4. What is the difference between \`Throwable\`, \`Exception\`, and \`Error\`?
5. When does a \`finally\` block NOT execute?
`
  },
  {
    id: 28,
    title: "Java Collections Framework: Deep Dive & Internals",
    domain: "Programming Languages",
    time: "20 min read",
    category: "Java",
    sources: ["Oracle JDK Source", "Java Handbook"],
    content: `
# Java Collections Framework: Deep Dive & Internals

The Collections Framework provides a unified architecture for storing and manipulating groups of objects. Understanding internals is critical for writing performant Java code.

---

## 1. Framework Hierarchy

\`\`\`
                Iterable<E>
                    |
               Collection<E>
             /       |        \\
          List<E>  Set<E>   Queue<E>
            |        |          |
      ArrayList  HashSet    PriorityQueue
      LinkedList  TreeSet    ArrayDeque
      Vector    LinkedHashSet

              Map<K,V> (separate hierarchy)
                /    \\
          HashMap   TreeMap
          LinkedHashMap  ConcurrentHashMap
\`\`\`

---

## 2. List Implementations

### ArrayList Internal Mechanics
* Backed by a **dynamic array** (Object[])
* Default initial capacity: **10**
* Grows by **50%** when full: \`newCapacity = oldCapacity + (oldCapacity >> 1)\`
* Shrinking requires manual \`trimToSize()\`

\`\`\`java
import java.util.*;

// ArrayList — best for random access O(1), costly for mid-insertion O(n)
List<String> arrayList = new ArrayList<>(16); // Pre-size to avoid resizing
arrayList.add("Alice");
arrayList.add("Bob");
arrayList.add(0, "Zara");     // O(n) — shifts all elements right
System.out.println(arrayList.get(1)); // O(1) — direct index access

// LinkedList — best for O(1) head/tail add/remove
LinkedList<String> linkedList = new LinkedList<>();
linkedList.addFirst("Head");   // O(1)
linkedList.addLast("Tail");    // O(1)
linkedList.removeFirst();      // O(1)
// Use as Deque
Deque<Integer> deque = new LinkedList<>();
deque.push(1); deque.push(2);  // Stack behavior
deque.offer(3);                // Queue behavior
\`\`\`

---

## 3. Map Implementations & Internals

### HashMap Internal Architecture
* **Bucket array**: Array of \`Node<K,V>[]\` (default 16 buckets)
* **Hash function**: \`(key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16)\`
* **Collision resolution**: Chaining (linked list → **red-black tree** when bucket size ≥ 8)
* **Load factor**: 0.75 (resize when 75% full)
* **Resize**: Doubles capacity, rehashes all entries

\`\`\`java
// Performance comparison
Map<String, Integer> hashMap = new HashMap<>();    // O(1) avg, unordered
Map<String, Integer> treeMap = new TreeMap<>();    // O(log n), sorted by key
Map<String, Integer> linkedMap = new LinkedHashMap<>(); // O(1), insertion-ordered

hashMap.put("banana", 2);
hashMap.put("apple", 5);
hashMap.put("cherry", 1);

// HashMap — unpredictable order
hashMap.forEach((k, v) -> System.out.println(k + "=" + v));

// TreeMap — sorted alphabetically
treeMap.putAll(hashMap);
treeMap.forEach((k, v) -> System.out.println(k + "=" + v)); // apple, banana, cherry

// Common Map operations
hashMap.getOrDefault("mango", 0);         // Returns 0 if not found
hashMap.putIfAbsent("apple", 99);         // Only adds if key missing
hashMap.computeIfAbsent("grape", k -> k.length()); // Compute and store
hashMap.merge("banana", 3, Integer::sum); // banana=2+3=5
\`\`\`

---

## 4. Set Implementations

\`\`\`java
// HashSet — backed by HashMap, O(1) ops, unordered
Set<String> hashSet = new HashSet<>(Arrays.asList("A", "B", "C", "A")); // duplicate removed
System.out.println(hashSet.size()); // 3

// TreeSet — backed by TreeMap, O(log n), sorted
Set<Integer> treeSet = new TreeSet<>(Arrays.asList(5, 2, 8, 1, 9));
System.out.println(treeSet.first()); // 1
System.out.println(treeSet.last());  // 9
System.out.println(treeSet.headSet(5)); // [1, 2]

// LinkedHashSet — insertion-ordered
Set<String> linkedSet = new LinkedHashSet<>(Arrays.asList("C", "A", "B"));
System.out.println(linkedSet); // [C, A, B]
\`\`\`

---

## 5. Queue & Stack

\`\`\`java
// PriorityQueue — min-heap by default O(log n) insertion, O(1) peek
PriorityQueue<Integer> minHeap = new PriorityQueue<>();
minHeap.offer(5); minHeap.offer(1); minHeap.offer(3);
System.out.println(minHeap.poll()); // 1 (minimum)

// Max-heap
PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Collections.reverseOrder());
maxHeap.offer(5); maxHeap.offer(1); maxHeap.offer(3);
System.out.println(maxHeap.poll()); // 5 (maximum)

// ArrayDeque — preferred stack/queue (faster than Stack/LinkedList)
Deque<String> stack = new ArrayDeque<>();
stack.push("First"); stack.push("Second"); // Stack: LIFO
System.out.println(stack.pop()); // "Second"

Queue<String> queue = new ArrayDeque<>();
queue.offer("First"); queue.offer("Second"); // Queue: FIFO
System.out.println(queue.poll()); // "First"
\`\`\`

---

## 6. Complexity Reference Table

| Collection | Access | Search | Insert (Best) | Insert (Worst) | Delete |
| :--- | :--- | :--- | :--- | :--- | :--- |
| ArrayList | O(1) | O(n) | O(1) amortized | O(n) | O(n) |
| LinkedList | O(n) | O(n) | O(1) | O(1) | O(1) |
| HashMap | N/A | O(1) avg | O(1) avg | O(n) worst | O(1) avg |
| TreeMap | N/A | O(log n) | O(log n) | O(log n) | O(log n) |
| HashSet | N/A | O(1) avg | O(1) avg | O(n) worst | O(1) avg |
| TreeSet | N/A | O(log n) | O(log n) | O(log n) | O(log n) |
| PriorityQueue | O(1) peek | O(n) | O(log n) | O(log n) | O(log n) |

---

## 7. Collections Utility Methods

\`\`\`java
List<Integer> list = new ArrayList<>(Arrays.asList(3, 1, 4, 1, 5, 9, 2, 6));

Collections.sort(list);                             // [1, 1, 2, 3, 4, 5, 6, 9]
Collections.sort(list, Collections.reverseOrder()); // [9, 6, 5, 4, 3, 2, 1, 1]
Collections.shuffle(list);
System.out.println(Collections.max(list));          // 9
System.out.println(Collections.frequency(list, 1)); // 2

// Unmodifiable view
List<Integer> immutable = Collections.unmodifiableList(list);
// immutable.add(10); // Throws UnsupportedOperationException

// Thread-safe wrappers (prefer ConcurrentHashMap for concurrency)
List<Integer> syncList = Collections.synchronizedList(list);
\`\`\`

---

## Interview Questions
1. Explain the internal working of HashMap. What happens during a collision?
2. What is the difference between \`HashMap\` and \`ConcurrentHashMap\`?
3. Why is \`String\` a good HashMap key? What makes a good key?
4. When does a HashMap's bucket linked-list become a tree?
5. What is the difference between \`Comparable\` and \`Comparator\`?
`
  },
  {
    id: 29,
    title: "Java Multithreading & Concurrency: Complete Guide",
    domain: "Programming Languages",
    time: "22 min read",
    category: "Java",
    sources: ["Java Concurrency in Practice", "Oracle Docs", "Java Handbook"],
    content: `
# Java Multithreading & Concurrency: Complete Guide

Concurrency is the ability of a program to execute multiple tasks simultaneously, leveraging multi-core processors for performance.

---

## 1. Thread Creation

\`\`\`java
// Method 1: Extend Thread
class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("Thread: " + Thread.currentThread().getName());
    }
}

// Method 2: Implement Runnable (preferred — allows extending other classes)
class MyRunnable implements Runnable {
    @Override
    public void run() {
        System.out.println("Runnable: " + Thread.currentThread().getName());
    }
}

// Method 3: Lambda (Java 8+) — cleanest
Runnable task = () -> System.out.println("Lambda thread: " + Thread.currentThread().getName());

// Starting threads
new MyThread().start();
new Thread(new MyRunnable()).start();
new Thread(task).start();
new Thread(() -> System.out.println("Inline lambda")).start();
\`\`\`

---

## 2. Thread Lifecycle

\`\`\`
  NEW ──start()──▶ RUNNABLE ──scheduler──▶ RUNNING
                      ▲                        |
                      |──────────────────────▶ BLOCKED/WAITING/TIMED_WAITING
                                               |
                                               ▼
                                          TERMINATED
\`\`\`

| State | Description |
| :--- | :--- |
| **NEW** | Thread created but \`start()\` not called |
| **RUNNABLE** | Ready to run, waiting for CPU |
| **BLOCKED** | Waiting for a monitor lock |
| **WAITING** | Waiting indefinitely (\`wait()\`, \`join()\`) |
| **TIMED_WAITING** | Waiting for specified time (\`sleep(ms)\`, \`wait(ms)\`) |
| **TERMINATED** | \`run()\` completed or exception thrown |

---

## 3. Synchronization & Locks

\`\`\`java
// Race condition example (BROKEN)
class Counter {
    private int count = 0;
    public void increment() { count++; } // NOT atomic! Read-modify-write
    public int getCount() { return count; }
}

// Fix 1: synchronized method
class SynchronizedCounter {
    private int count = 0;
    public synchronized void increment() { count++; } // Only 1 thread at a time
    public synchronized int getCount() { return count; }
}

// Fix 2: synchronized block (finer granularity)
class BlockSyncCounter {
    private int count = 0;
    private final Object lock = new Object();

    public void increment() {
        synchronized (lock) { // Only this block is locked
            count++;
        }
    }
}

// Fix 3: Atomic classes (best for simple counters)
import java.util.concurrent.atomic.AtomicInteger;
class AtomicCounter {
    private AtomicInteger count = new AtomicInteger(0);
    public void increment() { count.incrementAndGet(); } // Lock-free, CAS operation
    public int getCount() { return count.get(); }
}
\`\`\`

---

## 4. wait(), notify(), notifyAll() — Inter-thread Communication

\`\`\`java
// Producer-Consumer Pattern
import java.util.LinkedList;
import java.util.Queue;

class ProducerConsumer {
    private Queue<Integer> queue = new LinkedList<>();
    private final int MAX_SIZE = 5;

    public synchronized void produce(int value) throws InterruptedException {
        while (queue.size() == MAX_SIZE) {
            wait(); // Release lock and wait for consumer
        }
        queue.offer(value);
        System.out.println("Produced: " + value + " | Queue: " + queue);
        notifyAll(); // Wake up waiting consumers
    }

    public synchronized int consume() throws InterruptedException {
        while (queue.isEmpty()) {
            wait(); // Release lock and wait for producer
        }
        int value = queue.poll();
        System.out.println("Consumed: " + value + " | Queue: " + queue);
        notifyAll(); // Wake up waiting producers
        return value;
    }
}
\`\`\`

---

## 5. ExecutorService & Thread Pools

\`\`\`java
import java.util.concurrent.*;

// Thread pools prevent thread creation overhead
ExecutorService fixedPool = Executors.newFixedThreadPool(4);    // 4 worker threads
ExecutorService cachedPool = Executors.newCachedThreadPool();   // Grows as needed
ExecutorService singleThread = Executors.newSingleThreadExecutor(); // Sequential

// Submit tasks
Future<Integer> future = fixedPool.submit(() -> {
    Thread.sleep(1000);
    return 42;
});

System.out.println("Doing other work...");
Integer result = future.get(); // Blocks until result ready
System.out.println("Result: " + result); // 42

// Shutdown gracefully
fixedPool.shutdown(); // Finish existing tasks
fixedPool.awaitTermination(30, TimeUnit.SECONDS); // Wait up to 30s

// ScheduledExecutorService — schedule tasks
ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);
scheduler.scheduleAtFixedRate(
    () -> System.out.println("Heartbeat at " + System.currentTimeMillis()),
    0, 5, TimeUnit.SECONDS // Initial delay=0, period=5s
);
\`\`\`

---

## 6. Volatile & Happens-Before Guarantee

\`\`\`java
class FlagExample {
    // Without volatile: JVM/CPU may cache 'running' in register
    // Thread B might never see Thread A's update!
    private volatile boolean running = true; // volatile ensures visibility

    public void stop() {
        running = false; // Guaranteed to be visible to all threads
    }

    public void run() {
        while (running) { // Always reads fresh value from main memory
            doWork();
        }
    }
}
\`\`\`

---

## 7. ReentrantLock & Conditions

\`\`\`java
import java.util.concurrent.locks.*;

class BoundedBuffer<T> {
    private final Object[] buffer;
    private int count = 0, in = 0, out = 0;
    private final Lock lock = new ReentrantLock();
    private final Condition notFull = lock.newCondition();
    private final Condition notEmpty = lock.newCondition();

    BoundedBuffer(int capacity) { buffer = new Object[capacity]; }

    public void put(T item) throws InterruptedException {
        lock.lock();
        try {
            while (count == buffer.length) notFull.await();
            buffer[in] = item;
            in = (in + 1) % buffer.length;
            ++count;
            notEmpty.signal();
        } finally { lock.unlock(); } // Always unlock in finally!
    }

    @SuppressWarnings("unchecked")
    public T take() throws InterruptedException {
        lock.lock();
        try {
            while (count == 0) notEmpty.await();
            T item = (T) buffer[out];
            out = (out + 1) % buffer.length;
            --count;
            notFull.signal();
            return item;
        } finally { lock.unlock(); }
    }
}
\`\`\`

---

## 8. Common Concurrency Pitfalls

| Problem | Description | Solution |
| :--- | :--- | :--- |
| **Race Condition** | Multiple threads modify shared state unsafely | \`synchronized\`, \`Atomic*\` classes |
| **Deadlock** | Thread A waits for B, B waits for A | Lock ordering, \`tryLock()\` with timeout |
| **Livelock** | Threads keep changing state in response to each other | Randomized backoff |
| **Starvation** | Low-priority thread never gets CPU | Fair locks \`new ReentrantLock(true)\` |
| **Memory Visibility** | Thread caches stale values | \`volatile\`, synchronization |

---

## Interview Questions
1. What is the difference between \`synchronized\` and \`ReentrantLock\`?
2. What is a deadlock and how do you prevent it?
3. Explain the differences between \`wait()\`, \`sleep()\`, and \`yield()\`.
4. What is the Java Memory Model and what does the happens-before relationship guarantee?
5. When would you use \`volatile\` vs \`AtomicInteger\`?
`
  },
  {
    id: 30,
    title: "Java Generics, Lambdas & Functional Interfaces",
    domain: "Programming Languages",
    time: "16 min read",
    category: "Java",
    sources: ["Oracle JLS", "Java Handbook"],
    content: `
# Java Generics, Lambdas & Functional Interfaces

Generics provide type safety at compile time. Lambdas enable functional-style programming in Java 8+.

---

## 1. Generics: Type-Safe Collections

\`\`\`java
// Without generics — unsafe, requires cast
List rawList = new ArrayList();
rawList.add("hello");
String s = (String) rawList.get(0); // Runtime ClassCastException risk!

// With generics — compile-time safety
List<String> typedList = new ArrayList<>();
typedList.add("hello");
String safe = typedList.get(0); // No cast needed!
\`\`\`

### Generic Classes & Methods

\`\`\`java
// Generic class — works with any type T
class Pair<A, B> {
    private final A first;
    private final B second;

    public Pair(A first, B second) {
        this.first = first;
        this.second = second;
    }

    public A getFirst() { return first; }
    public B getSecond() { return second; }

    @Override
    public String toString() { return "(" + first + ", " + second + ")"; }
}

Pair<String, Integer> entry = new Pair<>("age", 25);
System.out.println(entry); // (age, 25)

// Generic method
public static <T extends Comparable<T>> T findMax(T[] array) {
    T max = array[0];
    for (T item : array) {
        if (item.compareTo(max) > 0) max = item;
    }
    return max;
}

Integer[] nums = {3, 1, 7, 2, 9};
System.out.println(findMax(nums)); // 9
\`\`\`

### Bounded Type Parameters & Wildcards

\`\`\`java
// Upper bound: T must be Number or a subclass
public static <T extends Number> double sum(List<T> list) {
    return list.stream().mapToDouble(Number::doubleValue).sum();
}
sum(List.of(1, 2, 3));     // Works with Integer
sum(List.of(1.5, 2.5));    // Works with Double

// Wildcard — ? means "unknown type"
// Producer Extends (PE): read-only list
public void printNumbers(List<? extends Number> list) {
    list.forEach(System.out::println); // Can read, cannot add
}

// Consumer Super (CS): write-only list
public void addNumbers(List<? super Integer> list) {
    list.add(1); list.add(2); // Can add Integer or subtypes
}

// PECS: Producer Extends, Consumer Super
\`\`\`

---

## 2. Functional Interfaces (Java 8+)

A **functional interface** has exactly one abstract method (SAM — Single Abstract Method).

| Interface | Method | Signature | Purpose |
| :--- | :--- | :--- | :--- |
| \`Predicate<T>\` | \`test(T t)\` | \`T → boolean\` | Test/filter condition |
| \`Function<T,R>\` | \`apply(T t)\` | \`T → R\` | Transform/map |
| \`Consumer<T>\` | \`accept(T t)\` | \`T → void\` | Consume/act on value |
| \`Supplier<T>\` | \`get()\` | \`() → T\` | Produce/supply value |
| \`BiFunction<T,U,R>\` | \`apply(T,U)\` | \`(T,U) → R\` | Two inputs, one output |
| \`UnaryOperator<T>\` | \`apply(T t)\` | \`T → T\` | Transform same type |

\`\`\`java
import java.util.function.*;

// Predicate — test condition
Predicate<String> isLong = s -> s.length() > 5;
Predicate<String> startsWithJ = s -> s.startsWith("J");
Predicate<String> combined = isLong.and(startsWithJ); // Composition!
System.out.println(combined.test("JavaScript")); // true
System.out.println(combined.test("Java"));       // false

// Function — transform
Function<String, Integer> strLen = String::length;
Function<Integer, String> intToStr = i -> "Number: " + i;
Function<String, String> composed = strLen.andThen(intToStr); // chain!
System.out.println(composed.apply("Hello")); // "Number: 5"

// Consumer — act on value
Consumer<String> printer = System.out::println;
Consumer<String> upperPrinter = s -> System.out.println(s.toUpperCase());
Consumer<String> both = printer.andThen(upperPrinter);
both.accept("hello"); // prints "hello" then "HELLO"

// Supplier — produce value
Supplier<List<String>> listFactory = ArrayList::new;
List<String> newList = listFactory.get(); // Creates new ArrayList
\`\`\`

---

## 3. Lambda Expressions

\`\`\`java
// Lambda syntax: (parameters) -> expression OR (parameters) -> { body }
Runnable r1 = () -> System.out.println("No params");
Comparator<String> c1 = (a, b) -> a.compareTo(b);
Function<Integer, Integer> square = x -> x * x;
BiFunction<Integer, Integer, Integer> add = (a, b) -> {
    System.out.println("Adding " + a + " and " + b);
    return a + b;
};

// Method references — shorthand for simple lambdas
List<String> names = Arrays.asList("Charlie", "Alice", "Bob");
names.sort(String::compareTo);           // Instance method on first arg
names.forEach(System.out::println);      // Instance method on specific object
names.stream().map(String::toUpperCase); // Instance method on each element
names.stream().map(String::new);         // Constructor reference
\`\`\`

---

## 4. Custom Functional Interface

\`\`\`java
@FunctionalInterface
interface TriFunction<A, B, C, R> {
    R apply(A a, B b, C c);
    
    // Can have default methods — still functional
    default <V> TriFunction<A, B, C, V> andThen(Function<R, V> after) {
        return (a, b, c) -> after.apply(apply(a, b, c));
    }
}

TriFunction<Integer, Integer, Integer, Integer> sum3 = (a, b, c) -> a + b + c;
System.out.println(sum3.apply(1, 2, 3)); // 6

TriFunction<Integer, Integer, Integer, String> sumToStr = 
    sum3.andThen(n -> "Sum is: " + n);
System.out.println(sumToStr.apply(1, 2, 3)); // "Sum is: 6"
\`\`\`

---

## Interview Questions
1. What is a functional interface? Can it have more than one method?
2. What is the difference between \`Predicate\`, \`Function\`, \`Consumer\`, and \`Supplier\`?
3. What is the PECS rule in Java generics?
4. What is a method reference? Give examples of all four types.
5. Can generics work with primitive types? Why or why not?
`
  },
  {
    id: 31,
    title: "Java Stream API: Functional Data Processing",
    domain: "Programming Languages",
    time: "18 min read",
    category: "Java",
    sources: ["Oracle JDK Docs", "Java Handbook"],
    content: `
# Java Stream API: Functional Data Processing

Streams (Java 8+) enable declarative, functional-style processing of data collections. They support lazy evaluation and can be parallelized easily.

---

## 1. Stream Pipeline Structure

\`\`\`
Source → [Intermediate Operations] → Terminal Operation
\`\`\`

* **Source**: Collection, array, I/O channel, generator
* **Intermediate**: \`filter()\`, \`map()\`, \`sorted()\`, \`distinct()\` — **lazy** (not executed until terminal)
* **Terminal**: \`collect()\`, \`count()\`, \`forEach()\`, \`reduce()\` — **triggers** pipeline execution

---

## 2. Creating Streams

\`\`\`java
import java.util.stream.*;
import java.util.*;

// From Collection
List<String> list = Arrays.asList("a", "b", "c");
Stream<String> s1 = list.stream();

// From Array
Stream<String> s2 = Arrays.stream(new String[]{"x", "y"});

// From values
Stream<Integer> s3 = Stream.of(1, 2, 3, 4, 5);

// Infinite streams
Stream<Integer> infinite = Stream.iterate(0, n -> n + 2); // 0, 2, 4, 6...
Stream<Double> randoms = Stream.generate(Math::random);   // endless random numbers

// Primitive specialized streams (avoid boxing overhead)
IntStream range = IntStream.range(1, 11);       // 1 to 10
LongStream longs = LongStream.rangeClosed(1, 5); // 1 to 5 inclusive
\`\`\`

---

## 3. Intermediate Operations

\`\`\`java
List<Employee> employees = List.of(
    new Employee("Alice", "Engineering", 95000),
    new Employee("Bob", "Marketing", 72000),
    new Employee("Charlie", "Engineering", 110000),
    new Employee("Dave", "Marketing", 68000),
    new Employee("Eve", "Engineering", 88000)
);

// filter() — keep elements matching predicate
List<Employee> engineers = employees.stream()
    .filter(e -> e.getDepartment().equals("Engineering"))
    .collect(Collectors.toList());

// map() — transform elements
List<String> names = employees.stream()
    .map(Employee::getName)
    .collect(Collectors.toList()); // [Alice, Bob, Charlie, Dave, Eve]

// flatMap() — flatten nested collections
List<List<String>> nested = List.of(List.of("A", "B"), List.of("C", "D"));
List<String> flat = nested.stream()
    .flatMap(Collection::stream)
    .collect(Collectors.toList()); // [A, B, C, D]

// sorted() — natural or custom order
List<String> sortedNames = employees.stream()
    .map(Employee::getName)
    .sorted() // alphabetical
    .collect(Collectors.toList());

List<Employee> bySalary = employees.stream()
    .sorted(Comparator.comparingDouble(Employee::getSalary).reversed())
    .collect(Collectors.toList()); // highest salary first

// distinct() — remove duplicates
Stream.of(1, 2, 2, 3, 3, 3).distinct().forEach(System.out::print); // 123

// limit() and skip()
employees.stream().skip(2).limit(2).forEach(e -> System.out.println(e.getName()));

// peek() — for debugging (doesn't consume)
employees.stream()
    .peek(e -> System.out.println("Before filter: " + e.getName()))
    .filter(e -> e.getSalary() > 80000)
    .peek(e -> System.out.println("After filter: " + e.getName()))
    .collect(Collectors.toList());
\`\`\`

---

## 4. Terminal Operations

\`\`\`java
// count()
long count = employees.stream().filter(e -> e.getSalary() > 80000).count(); // 3

// findFirst() / findAny() — return Optional
Optional<Employee> first = employees.stream()
    .filter(e -> e.getDepartment().equals("Marketing"))
    .findFirst();
first.ifPresent(e -> System.out.println("Found: " + e.getName()));

// reduce() — combine all elements into one
int total = IntStream.rangeClosed(1, 10).reduce(0, Integer::sum); // 55
Optional<Integer> product = Stream.of(1,2,3,4,5).reduce((a,b) -> a * b); // 120

// anyMatch / allMatch / noneMatch
boolean anyHighEarner = employees.stream().anyMatch(e -> e.getSalary() > 100000); // true
boolean allEngineers = employees.stream().allMatch(e -> e.getDepartment().equals("Engineering")); // false
boolean noneNegative = employees.stream().noneMatch(e -> e.getSalary() < 0); // true

// min / max
Optional<Employee> topEarner = employees.stream()
    .max(Comparator.comparingDouble(Employee::getSalary));
topEarner.ifPresent(e -> System.out.println("Top: " + e.getName())); // Charlie
\`\`\`

---

## 5. Collectors

\`\`\`java
// toList, toSet, toMap
Map<String, Double> salaryMap = employees.stream()
    .collect(Collectors.toMap(Employee::getName, Employee::getSalary));

// groupingBy — group into Map<K, List<V>>
Map<String, List<Employee>> byDept = employees.stream()
    .collect(Collectors.groupingBy(Employee::getDepartment));
// {Engineering=[Alice, Charlie, Eve], Marketing=[Bob, Dave]}

// groupingBy with downstream collector
Map<String, Double> avgSalaryByDept = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::getDepartment,
        Collectors.averagingDouble(Employee::getSalary)
    ));
// {Engineering=97666.67, Marketing=70000.0}

// counting per group
Map<String, Long> countByDept = employees.stream()
    .collect(Collectors.groupingBy(Employee::getDepartment, Collectors.counting()));

// partitioningBy — split into true/false
Map<Boolean, List<Employee>> partition = employees.stream()
    .collect(Collectors.partitioningBy(e -> e.getSalary() > 80000));
// {true=[Alice, Charlie, Eve], false=[Bob, Dave]}

// joining — string concatenation
String nameStr = employees.stream()
    .map(Employee::getName)
    .collect(Collectors.joining(", ", "[", "]")); // [Alice, Bob, Charlie, Dave, Eve]

// summarizingDouble — statistics
DoubleSummaryStatistics stats = employees.stream()
    .collect(Collectors.summarizingDouble(Employee::getSalary));
System.out.println("Avg: " + stats.getAverage()); // 86600.0
System.out.println("Max: " + stats.getMax());     // 110000.0
\`\`\`

---

## 6. Parallel Streams

\`\`\`java
// Parallel stream — uses ForkJoinPool.commonPool()
long count = employees.parallelStream()
    .filter(e -> e.getSalary() > 80000)
    .count(); // Computed in parallel — faster for large datasets

// When to use parallel:
// ✅ Large datasets (>10,000 elements)
// ✅ CPU-intensive operations  
// ✅ Order doesn't matter
// ❌ Small datasets (overhead > benefit)
// ❌ Stateful operations with side effects
// ❌ When order matters and not using forEachOrdered()
\`\`\`

---

## Interview Questions
1. What is the difference between \`map()\` and \`flatMap()\`?
2. What is the difference between intermediate and terminal operations?
3. Are streams lazy? What does that mean?
4. What is the difference between \`findFirst()\` and \`findAny()\` in parallel streams?
5. When should you use parallel streams? What are the risks?
`
  },
  {
    id: 32,
    title: "Java Design Patterns: GoF Patterns with Real-World Examples",
    domain: "Programming Languages",
    time: "25 min read",
    category: "Java",
    sources: ["Gang of Four", "Refactoring Guru", "Java Handbook"],
    content: `
# Java Design Patterns: GoF Patterns with Real-World Examples

Design patterns are proven solutions to recurring software design problems. The 23 Gang of Four (GoF) patterns are categorized as Creational, Structural, and Behavioral.

---

## Pattern Categories

| Category | Purpose | Examples |
| :--- | :--- | :--- |
| **Creational** | Object creation mechanisms | Singleton, Factory, Builder, Prototype |
| **Structural** | Object composition & structure | Adapter, Decorator, Facade, Proxy |
| **Behavioral** | Object communication & responsibility | Observer, Strategy, Command, Iterator |

---

## 1. Creational: Singleton

Ensures a class has only one instance and provides a global access point.

\`\`\`java
// Thread-safe Singleton — Double-Checked Locking
public class DatabaseConnection {
    private static volatile DatabaseConnection instance;
    private String url;

    private DatabaseConnection() {
        this.url = "jdbc:mysql://localhost:3306/mydb";
        System.out.println("Database connection created");
    }

    public static DatabaseConnection getInstance() {
        if (instance == null) {             // First check (no locking)
            synchronized (DatabaseConnection.class) {
                if (instance == null) {     // Second check (with locking)
                    instance = new DatabaseConnection();
                }
            }
        }
        return instance;
    }

    public String getUrl() { return url; }
}

// Usage
DatabaseConnection db1 = DatabaseConnection.getInstance();
DatabaseConnection db2 = DatabaseConnection.getInstance();
System.out.println(db1 == db2); // true — same instance!

// Modern alternative: Enum Singleton (thread-safe by JVM)
enum AppConfig {
    INSTANCE;
    private String apiKey = "secret-key";
    public String getApiKey() { return apiKey; }
}
\`\`\`

---

## 2. Creational: Builder

Separates object construction from its representation. Essential for objects with many optional fields.

\`\`\`java
// Without Builder — telescoping constructor anti-pattern
new Pizza("Large", "Thin", true, true, false, false, "Cheese"); // What does each bool mean??

// With Builder
public class Pizza {
    private final String size;
    private final String crust;
    private final boolean cheese;
    private final boolean pepperoni;
    private final boolean mushrooms;

    private Pizza(Builder builder) {
        this.size = builder.size;
        this.crust = builder.crust;
        this.cheese = builder.cheese;
        this.pepperoni = builder.pepperoni;
        this.mushrooms = builder.mushrooms;
    }

    public static class Builder {
        // Required fields
        private final String size;
        private final String crust;
        // Optional fields with defaults
        private boolean cheese = false;
        private boolean pepperoni = false;
        private boolean mushrooms = false;

        public Builder(String size, String crust) {
            this.size = size;
            this.crust = crust;
        }

        public Builder cheese() { this.cheese = true; return this; }
        public Builder pepperoni() { this.pepperoni = true; return this; }
        public Builder mushrooms() { this.mushrooms = true; return this; }

        public Pizza build() { return new Pizza(this); }
    }
}

// Clean, readable usage
Pizza pizza = new Pizza.Builder("Large", "Thin")
    .cheese()
    .pepperoni()
    .build();
\`\`\`

---

## 3. Creational: Factory Method

Defines an interface for creating an object but lets subclasses decide which class to instantiate.

\`\`\`java
// Product interface
interface Notification {
    void send(String message);
}

// Concrete products
class EmailNotification implements Notification {
    @Override public void send(String msg) { System.out.println("EMAIL: " + msg); }
}
class SMSNotification implements Notification {
    @Override public void send(String msg) { System.out.println("SMS: " + msg); }
}
class PushNotification implements Notification {
    @Override public void send(String msg) { System.out.println("PUSH: " + msg); }
}

// Factory
class NotificationFactory {
    public static Notification create(String type) {
        return switch (type.toUpperCase()) {
            case "EMAIL" -> new EmailNotification();
            case "SMS"   -> new SMSNotification();
            case "PUSH"  -> new PushNotification();
            default      -> throw new IllegalArgumentException("Unknown type: " + type);
        };
    }
}

// Usage — caller doesn't know concrete class!
Notification n = NotificationFactory.create("EMAIL");
n.send("Your order is ready!"); // EMAIL: Your order is ready!
\`\`\`

---

## 4. Structural: Decorator

Attaches additional responsibilities to an object dynamically. Flexible alternative to subclassing.

\`\`\`java
// Component interface
interface Coffee {
    String getDescription();
    double getCost();
}

// Concrete component
class SimpleCoffee implements Coffee {
    @Override public String getDescription() { return "Simple coffee"; }
    @Override public double getCost() { return 1.00; }
}

// Abstract decorator
abstract class CoffeeDecorator implements Coffee {
    protected final Coffee coffee;
    CoffeeDecorator(Coffee coffee) { this.coffee = coffee; }
}

// Concrete decorators
class Milk extends CoffeeDecorator {
    Milk(Coffee coffee) { super(coffee); }
    @Override public String getDescription() { return coffee.getDescription() + ", Milk"; }
    @Override public double getCost() { return coffee.getCost() + 0.50; }
}

class Caramel extends CoffeeDecorator {
    Caramel(Coffee coffee) { super(coffee); }
    @Override public String getDescription() { return coffee.getDescription() + ", Caramel"; }
    @Override public double getCost() { return coffee.getCost() + 0.75; }
}

// Usage — chain decorators
Coffee order = new Caramel(new Milk(new SimpleCoffee()));
System.out.println(order.getDescription()); // Simple coffee, Milk, Caramel
System.out.println("$" + order.getCost()); // $2.25
\`\`\`

---

## 5. Behavioral: Observer

Defines a one-to-many dependency. When one object changes state, all dependents are notified automatically.

\`\`\`java
import java.util.*;

// Observer interface
interface StockObserver {
    void onPriceChange(String stock, double price);
}

// Subject
class StockMarket {
    private Map<String, Double> prices = new HashMap<>();
    private List<StockObserver> observers = new ArrayList<>();

    public void addObserver(StockObserver o) { observers.add(o); }
    public void removeObserver(StockObserver o) { observers.remove(o); }

    public void updatePrice(String stock, double price) {
        prices.put(stock, price);
        notifyObservers(stock, price); // Notify all watchers
    }

    private void notifyObservers(String stock, double price) {
        observers.forEach(o -> o.onPriceChange(stock, price));
    }
}

// Concrete observers
class AlertService implements StockObserver {
    @Override
    public void onPriceChange(String stock, double price) {
        if (price > 200) System.out.println("🚨 Alert: " + stock + " reached $" + price);
    }
}

class Portfolio implements StockObserver {
    @Override
    public void onPriceChange(String stock, double price) {
        System.out.println("Portfolio update: " + stock + " = $" + price);
    }
}

// Usage
StockMarket market = new StockMarket();
market.addObserver(new AlertService());
market.addObserver(new Portfolio());
market.updatePrice("AAPL", 210.50); // Both observers notified!
\`\`\`

---

## 6. Behavioral: Strategy

Defines a family of algorithms, encapsulates each one, and makes them interchangeable.

\`\`\`java
// Strategy interface
interface SortStrategy {
    void sort(int[] array);
}

// Concrete strategies
class BubbleSort implements SortStrategy {
    @Override public void sort(int[] arr) {
        System.out.println("Using Bubble Sort O(n²)");
        // ... bubble sort implementation
    }
}
class QuickSort implements SortStrategy {
    @Override public void sort(int[] arr) {
        System.out.println("Using Quick Sort O(n log n)");
        // ... quicksort implementation
    }
}

// Context — uses a strategy
class DataProcessor {
    private SortStrategy strategy;

    public void setStrategy(SortStrategy s) { this.strategy = s; }

    public void process(int[] data) {
        strategy.sort(data); // Delegates to strategy
    }
}

// Usage — change behavior at runtime!
DataProcessor processor = new DataProcessor();
processor.setStrategy(new BubbleSort());
processor.process(new int[]{3,1,2}); // Uses Bubble Sort

processor.setStrategy(new QuickSort());
processor.process(new int[]{3,1,2}); // Now uses Quick Sort
\`\`\`

---

## Interview Questions
1. What is the difference between Factory Method and Abstract Factory?
2. Why is Singleton considered an anti-pattern in some contexts?
3. What is the difference between Decorator and Proxy patterns?
4. When would you use Strategy over Template Method?
5. How does Observer pattern relate to event-driven programming?
`
  },
  {
    id: 33,
    title: "Java 8 to Java 21: Features Evolution & Modern Java",
    domain: "Programming Languages",
    time: "20 min read",
    category: "Java",
    sources: ["OpenJDK JEPs", "Oracle Release Notes", "Java Handbook"],
    content: `
# Java 8 to Java 21: Features Evolution & Modern Java

Java has evolved dramatically from Java 8 (2014) to Java 21 (2023). Understanding these features is essential for modern Java development.

---

## Java 8 (LTS) — The Functional Revolution

\`\`\`java
// 1. Lambda Expressions
Runnable r = () -> System.out.println("Lambda!");
List<Integer> nums = Arrays.asList(3, 1, 4, 1, 5);
nums.sort((a, b) -> a - b); // Functional sorting

// 2. Stream API
long count = nums.stream().filter(n -> n > 2).count(); // 3

// 3. Optional — eliminate NullPointerException
Optional<String> name = Optional.ofNullable(getUserName());
name.ifPresent(System.out::println);
String result = name.orElse("Anonymous"); // default value
String computed = name.orElseGet(() -> computeDefault()); // lazy default

// 4. Default Methods in Interfaces
interface Vehicle {
    void start();
    default void stop() {
        System.out.println("Vehicle stopped");
    }
    static Vehicle create() { return () -> System.out.println("Started"); }
}

// 5. Date/Time API (java.time) — replaces broken java.util.Date
LocalDate today = LocalDate.now();
LocalDate birthday = LocalDate.of(1990, Month.JUNE, 15);
Period age = Period.between(birthday, today);
System.out.println("Age: " + age.getYears() + " years");

LocalDateTime now = LocalDateTime.now();
ZonedDateTime utc = ZonedDateTime.now(ZoneId.of("UTC"));
DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");
System.out.println(now.format(fmt)); // 28-06-2024 14:30

// 6. CompletableFuture — async programming
CompletableFuture<String> future = CompletableFuture
    .supplyAsync(() -> fetchFromDB())           // Run async
    .thenApply(data -> process(data))           // Transform result
    .thenCompose(result -> saveAsync(result))   // Chain another async
    .exceptionally(ex -> "Error: " + ex.getMessage()); // Handle errors

future.join(); // Wait for completion
\`\`\`

---

## Java 9-10 — Modularization & Improvements

\`\`\`java
// Java 9: Collection factory methods
List<String> immutableList = List.of("A", "B", "C");
Set<Integer> immutableSet = Set.of(1, 2, 3);
Map<String, Integer> immutableMap = Map.of("key1", 1, "key2", 2);
// These are truly immutable — add/remove throws UnsupportedOperationException

// Java 9: Stream improvements
Stream.of(1, 2, null, 3).takeWhile(n -> n != null); // takeWhile, dropWhile
Stream.iterate(0, n -> n < 10, n -> n + 1).forEach(System.out::println); // 0-9

// Java 9: Optional improvements
Optional<String> opt = Optional.of("Hello");
opt.ifPresentOrElse(System.out::println, () -> System.out.println("Empty"));
Optional<String> other = opt.or(() -> Optional.of("Default")); // Chain optionals

// Java 10: var — local variable type inference
var list = new ArrayList<String>(); // Compiler infers ArrayList<String>
var map = new HashMap<String, List<Integer>>(); // Complex types simplified
for (var entry : map.entrySet()) {
    System.out.println(entry.getKey() + " = " + entry.getValue());
}
\`\`\`

---

## Java 11 (LTS) — HTTP Client & String Utilities

\`\`\`java
// New String methods
" hello ".strip();         // "hello" (Unicode-aware trim)
"".isBlank();              // true
"line1\\nline2".lines().count(); // 2
"abc".repeat(3);           // "abcabcabc"
"  ".isBlank();            // true

// New HTTP Client (replaces HttpURLConnection)
import java.net.http.*;
import java.net.URI;

HttpClient client = HttpClient.newBuilder()
    .version(HttpClient.Version.HTTP_2)
    .connectTimeout(Duration.ofSeconds(10))
    .build();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/data"))
    .header("Content-Type", "application/json")
    .GET()
    .build();

// Async
client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
    .thenApply(HttpResponse::body)
    .thenAccept(System.out::println);
\`\`\`

---

## Java 14-16 — Records, Pattern Matching, Sealed

\`\`\`java
// Java 16: Records — immutable data classes
record Point(int x, int y) {
    // Automatically generates: constructor, getters, equals, hashCode, toString
    
    // Compact constructor for validation
    Point {
        if (x < 0 || y < 0) throw new IllegalArgumentException("Negative coords");
    }
    
    // Custom methods allowed
    public double distanceTo(Point other) {
        return Math.sqrt(Math.pow(x - other.x, 2) + Math.pow(y - other.y, 2));
    }
}

Point p = new Point(3, 4);
System.out.println(p.x());          // 3 (accessor, not getX())
System.out.println(p);              // Point[x=3, y=4]
System.out.println(p.distanceTo(new Point(0, 0))); // 5.0

// Java 16: Pattern Matching for instanceof
Object obj = "Hello, World!";

// Old way
if (obj instanceof String) {
    String s = (String) obj; // Redundant cast!
    System.out.println(s.length());
}

// New way — pattern variable 's' scoped to if block
if (obj instanceof String s) {
    System.out.println(s.length()); // No cast needed!
    System.out.println(s.toUpperCase());
}

// Java 17: Sealed classes — restrict inheritance hierarchy
sealed interface Shape permits Circle, Rectangle, Triangle {}
record Circle(double radius) implements Shape {}
record Rectangle(double width, double height) implements Shape {}
final class Triangle implements Shape {
    double base, height;
    Triangle(double b, double h) { base = b; height = h; }
}
// No other class can implement Shape!
\`\`\`

---

## Java 21 (LTS) — Virtual Threads, Switch Patterns

\`\`\`java
// Java 21: Virtual Threads (Project Loom) — MASSIVE scalability improvement
// Traditional thread: ~1MB stack, ~10K threads max
// Virtual thread: ~few KB, MILLIONS possible!

// Old way — blocking I/O blocks OS thread (expensive!)
ExecutorService pool = Executors.newFixedThreadPool(200); // Limited to 200 concurrent

// New way — virtual threads block cheaply, JVM remounts on carrier thread
ExecutorService virtualPool = Executors.newVirtualThreadPerTaskExecutor();
for (int i = 0; i < 100_000; i++) { // 100K concurrent tasks!
    virtualPool.submit(() -> {
        Thread.sleep(1000); // Blocks virtual thread, frees OS thread
        return "done";
    });
}

// Structured Concurrency (Preview)
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    Future<String> user = scope.fork(() -> fetchUser(userId));
    Future<String> order = scope.fork(() -> fetchOrder(orderId));
    scope.join();           // Wait for all forks
    scope.throwIfFailed();  // Propagate errors
    return new Response(user.get(), order.get());
}

// Java 21: Switch Pattern Matching (Final)
static double area(Shape shape) {
    return switch (shape) {
        case Circle c -> Math.PI * c.radius() * c.radius();
        case Rectangle r -> r.width() * r.height();
        case Triangle t -> 0.5 * t.base * t.height;
    };
}
// No default needed — compiler verifies all sealed cases!

// Java 21: Sequenced Collections
SequencedCollection<String> seq = new ArrayList<>(List.of("A", "B", "C"));
seq.getFirst(); // "A"
seq.getLast();  // "C"
seq.addFirst("Z"); // [Z, A, B, C]
seq.reversed();    // [C, B, A, Z] view
\`\`\`

---

## Java Version Feature Summary

| Feature | Java Version | Status |
| :--- | :--- | :--- |
| Lambdas & Streams | Java 8 | ✅ Stable |
| Modules (JPMS) | Java 9 | ✅ Stable |
| \`var\` local type inference | Java 10 | ✅ Stable |
| New HTTP Client | Java 11 | ✅ Stable |
| Records | Java 16 | ✅ Stable |
| Pattern Matching instanceof | Java 16 | ✅ Stable |
| Sealed Classes | Java 17 | ✅ Stable |
| Virtual Threads | Java 21 | ✅ Stable |
| Pattern Matching switch | Java 21 | ✅ Stable |
| Sequenced Collections | Java 21 | ✅ Stable |

---

## Interview Questions
1. What are virtual threads? How do they differ from platform threads?
2. What is a Record in Java and when should you use it?
3. What is the difference between \`Optional.of()\`, \`Optional.ofNullable()\`, and \`Optional.empty()\`?
4. What are sealed classes and what problem do they solve?
5. What is the difference between \`var\` in Java 10 and dynamic typing in Python?
`
  }
];
