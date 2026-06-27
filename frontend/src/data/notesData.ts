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
  }
];
