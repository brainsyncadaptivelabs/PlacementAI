import { Note } from "./notesData";

export const javaNotesB3: Note[] = [
  {
    id: 54,
    title: "Arrays & Matrix Operations",
    domain: "Java — Core",
    time: "10 min read",
    category: "Java",
    sources: ["Oracle Docs", "GeeksforGeeks"],
    content: `
# Arrays & Matrix Operations

An **array** is a fixed-size, ordered collection of elements of the same type stored in contiguous memory.

## 1D Array

\`\`\`java
// Declaration
int[] arr;

// Creation + Initialization
int[] numbers = new int[5];          // [0, 0, 0, 0, 0]
int[] primes = {2, 3, 5, 7, 11};     // inline initialization

// Access
System.out.println(primes[0]);       // 2
System.out.println(primes.length);   // 5

// Modify
primes[0] = 100;

// Iterate
for (int num : primes) System.out.print(num + " ");
\`\`\`

## 2D Array (Matrix)

\`\`\`java
int[][] matrix = new int[3][4];        // 3 rows, 4 cols
int[][] grid = {{1,2,3}, {4,5,6}, {7,8,9}};

// Access
System.out.println(grid[1][2]);  // 6 (row 1, col 2)

// Iterate
for (int[] row : grid) {
    for (int val : row) System.out.printf("%3d", val);
    System.out.println();
}
\`\`\`

## Jagged Arrays

\`\`\`java
int[][] jagged = new int[3][];
jagged[0] = new int[]{1};
jagged[1] = new int[]{1, 2};
jagged[2] = new int[]{1, 2, 3};
// rows have different lengths
\`\`\`

## Common Array Operations

\`\`\`java
import java.util.Arrays;

int[] arr = {5, 3, 8, 1, 9, 2};

Arrays.sort(arr);                    // [1, 2, 3, 5, 8, 9]
System.out.println(Arrays.toString(arr));

int idx = Arrays.binarySearch(arr, 5); // 3 — only after sorting!

int[] copy = Arrays.copyOf(arr, arr.length);
int[] range = Arrays.copyOfRange(arr, 1, 4); // [2, 3, 5]

Arrays.fill(arr, 0);  // [0, 0, 0, 0, 0, 0]
\`\`\`

## Reverse an Array

\`\`\`java
void reverse(int[] arr) {
    int left = 0, right = arr.length - 1;
    while (left < right) {
        int temp = arr[left];
        arr[left] = arr[right];
        arr[right] = temp;
        left++; right--;
    }
}
\`\`\`

## Matrix Multiplication

\`\`\`java
int[][] multiply(int[][] A, int[][] B) {
    int n = A.length, m = B[0].length, k = B.length;
    int[][] C = new int[n][m];
    for (int i = 0; i < n; i++)
        for (int j = 0; j < m; j++)
            for (int p = 0; p < k; p++)
                C[i][j] += A[i][p] * B[p][j];
    return C;
}
\`\`\`

## Interview Questions
1. What is the default value of an uninitialized int array element?
2. What is the difference between \`Array\` and \`ArrayList\`?
3. Is an array an object in Java?
4. What exception is thrown when you access \`arr[-1]\`?
`,
  },
  {
    id: 55,
    title: "Strings & String Pool Internals",
    domain: "Java — Core",
    time: "12 min read",
    category: "Java",
    sources: ["Oracle JLS", "Baeldung"],
    content: `
# Strings & String Pool Internals

In Java, \`String\` is **immutable** — once created, its content cannot be changed. All String operations create a new String object.

## String Creation

\`\`\`java
// String literal — goes into String Pool (constant pool)
String s1 = "Hello";
String s2 = "Hello";
System.out.println(s1 == s2);      // true (same pool reference)

// new keyword — creates on Heap
String s3 = new String("Hello");
System.out.println(s1 == s3);      // false (different objects)
System.out.println(s1.equals(s3)); // true (same content)

// intern() — moves to pool
String s4 = s3.intern();
System.out.println(s1 == s4);      // true
\`\`\`

## Common String Methods

\`\`\`java
String s = "  Hello, World!  ";

s.length()                  // 17
s.trim()                    // "Hello, World!"
s.strip()                   // "Hello, World!" (Unicode-aware, Java 11+)
s.toUpperCase()             // "  HELLO, WORLD!  "
s.toLowerCase()             // "  hello, world!  "
s.charAt(2)                 // ' ' (index 2)
s.indexOf("World")          // 9
s.contains("World")         // true
s.startsWith("  He")        // true
s.endsWith("!  ")           // true
s.substring(2, 7)           // "Hello"
s.replace("World", "Java")  // "  Hello, Java!  "
s.split(",")                // ["  Hello", " World!  "]
s.isEmpty()                 // false
s.isBlank()                 // false (Java 11+)
\`\`\`

## String Comparison

\`\`\`java
String a = "Java";
String b = "java";

a.equals(b)                 // false (case-sensitive)
a.equalsIgnoreCase(b)       // true
a.compareTo(b)              // negative (J < j in ASCII)
\`\`\`

## StringBuilder vs StringBuffer

\`\`\`java
// StringBuilder — mutable, NOT thread-safe (faster)
StringBuilder sb = new StringBuilder();
sb.append("Hello");
sb.append(", ");
sb.append("World!");
sb.insert(5, "---");         // "Hello---, World!"
sb.delete(5, 8);             // "Hello, World!"
sb.reverse();
String result = sb.toString();

// StringBuffer — mutable, thread-safe (synchronized, slower)
StringBuffer sf = new StringBuffer("Java");
sf.append(" is great!");
\`\`\`

## String Formatting

\`\`\`java
// Java 13+ text blocks
String json = """
              {
                "name": "Java",
                "version": 21
              }
              """;

// String.format
String msg = String.format("Name: %s, Score: %.1f", "Alice", 95.5);

// formatted() — Java 15+
String msg2 = "Pi = %.4f".formatted(3.14159);
\`\`\`

## Immutability & Performance

\`\`\`java
// BAD: creates many intermediate String objects
String result = "";
for (int i = 0; i < 10000; i++) {
    result += i;  // O(n²) — each += creates a new String
}

// GOOD: use StringBuilder
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 10000; i++) {
    sb.append(i);  // O(n) — single buffer
}
String result = sb.toString();
\`\`\`

## Interview Questions
1. Why is String immutable in Java?
2. What is the String Pool?
3. What is the difference between \`==\` and \`.equals()\` for Strings?
4. Difference between StringBuilder and StringBuffer?
5. What does \`intern()\` do?
`,
  },
  {
    id: 56,
    title: "Methods & Parameter Passing",
    domain: "Java — Core",
    time: "8 min read",
    category: "Java",
    sources: ["Oracle JLS", "GeeksforGeeks"],
    content: `
# Methods & Parameter Passing

A **method** is a named block of code that performs a specific task and can be invoked (called) by name.

## Method Structure

\`\`\`java
accessModifier returnType methodName(parameterList) {
    // body
    return value; // optional if void
}
\`\`\`

\`\`\`java
public static int add(int a, int b) {
    return a + b;
}

// Call
int result = add(3, 5); // 8
\`\`\`

## Method Types

\`\`\`java
// Static method — called on class, no object needed
public static double circleArea(double r) { return Math.PI * r * r; }

// Instance method — called on an object
public String getFullName() { return firstName + " " + lastName; }

// Void method — no return value
public void printInfo() { System.out.println("Info..."); }
\`\`\`

## Java is ALWAYS Pass-by-Value

Java passes a **copy** of the value — primitives copy the value, objects copy the reference.

\`\`\`java
void modify(int x) {
    x = 100;  // changes local copy only
}
int n = 5;
modify(n);
System.out.println(n); // 5 — unchanged!

void modifyArray(int[] arr) {
    arr[0] = 999;  // modifies the actual array (reference copy)
}
int[] myArr = {1, 2, 3};
modifyArray(myArr);
System.out.println(myArr[0]); // 999 — changed!
\`\`\`

## Method Overloading

Same method name, different parameter lists (compile-time polymorphism).

\`\`\`java
class Calculator {
    int add(int a, int b)           { return a + b; }
    double add(double a, double b)  { return a + b; }
    int add(int a, int b, int c)    { return a + b + c; }
}
\`\`\`

## Variable Arguments (Varargs)

\`\`\`java
int sum(int... nums) {
    int total = 0;
    for (int n : nums) total += n;
    return total;
}
System.out.println(sum(1, 2, 3));       // 6
System.out.println(sum(1, 2, 3, 4, 5)); // 15
\`\`\`

## Returning Multiple Values (via Array or Object)

\`\`\`java
int[] minMax(int[] arr) {
    int min = arr[0], max = arr[0];
    for (int n : arr) {
        if (n < min) min = n;
        if (n > max) max = n;
    }
    return new int[]{min, max};
}
int[] result = minMax(new int[]{5, 1, 9, 2, 8});
System.out.println(result[0] + ", " + result[1]); // 1, 9
\`\`\`

## Interview Questions
1. Is Java pass-by-value or pass-by-reference?
2. What is method overloading?
3. What is the difference between overloading and overriding?
4. What is a varargs parameter?
5. Can a method return multiple values in Java?
`,
  },
  {
    id: 57,
    title: "Recursion & Stack Frames",
    domain: "Java — Core",
    time: "10 min read",
    category: "Java",
    sources: ["GeeksforGeeks", "LeetCode"],
    content: `
# Recursion & Stack Frames

**Recursion** is when a method calls itself. Every recursive solution must have a **base case** (stopping condition) and a **recursive case** (reduces the problem).

## Structure of Recursion

\`\`\`java
returnType method(params) {
    if (baseCondition) {
        return baseValue;      // BASE CASE — stop recursion
    }
    return method(smallerProblem); // RECURSIVE CASE
}
\`\`\`

## Classic Examples

### Factorial

\`\`\`java
int factorial(int n) {
    if (n == 0 || n == 1) return 1;  // base case
    return n * factorial(n - 1);     // recursive case
}
// factorial(5) = 5 × 4 × 3 × 2 × 1 = 120
\`\`\`

### Fibonacci

\`\`\`java
int fib(int n) {
    if (n <= 1) return n;          // base cases
    return fib(n-1) + fib(n-2);   // O(2^n) — exponential!
}

// Memoized version — O(n)
Map<Integer, Long> memo = new HashMap<>();
long fibMemo(int n) {
    if (n <= 1) return n;
    if (memo.containsKey(n)) return memo.get(n);
    long result = fibMemo(n-1) + fibMemo(n-2);
    memo.put(n, result);
    return result;
}
\`\`\`

### Binary Search (Recursive)

\`\`\`java
int binarySearch(int[] arr, int low, int high, int target) {
    if (low > high) return -1;
    int mid = low + (high - low) / 2;
    if (arr[mid] == target) return mid;
    if (arr[mid] < target) return binarySearch(arr, mid+1, high, target);
    return binarySearch(arr, low, mid-1, target);
}
\`\`\`

### Tower of Hanoi

\`\`\`java
void hanoi(int n, char from, char to, char aux) {
    if (n == 1) {
        System.out.println("Move disk 1 from " + from + " to " + to);
        return;
    }
    hanoi(n-1, from, aux, to);
    System.out.println("Move disk " + n + " from " + from + " to " + to);
    hanoi(n-1, aux, to, from);
}
\`\`\`

## How Recursion Uses the Stack

Each method call creates a **stack frame** containing local variables and return address:

\`\`\`
factorial(4)
  └─ factorial(3)
       └─ factorial(2)
            └─ factorial(1)  ← base case returns 1
         returns 2×1=2
    returns 3×2=6
  returns 4×6=24
\`\`\`

## Tail Recursion

When the recursive call is the **last operation** — some compilers can optimize it into a loop (Java JVM does NOT do Tail Call Optimization).

\`\`\`java
// Regular recursion (not tail recursive)
int factorial(int n) { return n * factorial(n-1); }

// Tail recursive version (accumulator pattern)
int factorial(int n, int acc) {
    if (n <= 1) return acc;
    return factorial(n-1, n * acc); // last operation is the recursive call
}
\`\`\`

## Interview Questions
1. What is a base case in recursion and why is it required?
2. What is \`StackOverflowError\` and what causes it?
3. What is the time complexity of recursive Fibonacci without memoization?
4. What is tail recursion? Does Java optimize it?
`,
  },
  {
    id: 58,
    title: "OOP Core Principles",
    domain: "Java — OOP",
    time: "10 min read",
    category: "Java",
    sources: ["Oracle Docs", "GeeksforGeeks"],
    content: `
# OOP Core Principles

**Object-Oriented Programming (OOP)** is a paradigm that models software as a collection of interacting **objects**, each bundling data (state) and behavior (methods).

## The 4 Pillars of OOP

| Pillar | One-Line Definition |
|---|---|
| **Encapsulation** | Bundling data + behavior; hiding internal details |
| **Inheritance** | A class acquires properties and methods of another class |
| **Polymorphism** | One interface, many implementations |
| **Abstraction** | Exposing only essential details, hiding complexity |

## Class & Object

\`\`\`java
// Class — blueprint
class Car {
    String brand;     // field (state)
    int speed;

    void accelerate(int amount) {  // method (behavior)
        speed += amount;
    }

    void displayInfo() {
        System.out.println(brand + " going at " + speed + " km/h");
    }
}

// Object — instance of the class
Car myCar = new Car();   // object created on heap
myCar.brand = "Toyota";
myCar.speed = 0;
myCar.accelerate(60);
myCar.displayInfo();     // Toyota going at 60 km/h
\`\`\`

## this Keyword

Refers to the **current object instance**.

\`\`\`java
class Person {
    String name;
    int age;

    Person(String name, int age) {
        this.name = name;  // this.name = instance var, name = parameter
        this.age = age;
    }

    Person getThis() { return this; }  // return current object
}
\`\`\`

## static Members

\`\`\`java
class Counter {
    static int count = 0;   // shared across all instances
    String id;

    Counter(String id) {
        this.id = id;
        count++;            // increments shared counter
    }

    static int getCount() { return count; } // static method
}

Counter c1 = new Counter("A");
Counter c2 = new Counter("B");
System.out.println(Counter.getCount()); // 2
\`\`\`

## Real-World Analogy

| OOP Concept | Real World |
|---|---|
| Class | Blueprint of a house |
| Object | An actual built house |
| Field | Room dimensions, color |
| Method | Open door, turn on AC |
| Inheritance | Luxury house extends basic house |
| Polymorphism | Draw() renders differently for Circle vs Square |

## Interview Questions
1. What are the 4 pillars of OOP?
2. What is the difference between a class and an object?
3. What is the purpose of the \`this\` keyword?
4. Can a class have multiple objects?
5. What is the difference between a static and instance method?
`,
  },
  {
    id: 59,
    title: "Constructors & Initialization",
    domain: "Java — OOP",
    time: "8 min read",
    category: "Java",
    sources: ["Oracle JLS", "Baeldung"],
    content: `
# Constructors & Initialization

A **constructor** is a special method that is called automatically when an object is created. It initializes the object's state.

## Types of Constructors

\`\`\`java
class Student {
    String name;
    int age;
    double gpa;

    // 1. Default Constructor (no-args) — compiler provides if none defined
    Student() {
        this.name = "Unknown";
        this.age = 0;
        this.gpa = 0.0;
    }

    // 2. Parameterized Constructor
    Student(String name, int age, double gpa) {
        this.name = name;
        this.age = age;
        this.gpa = gpa;
    }

    // 3. Copy Constructor
    Student(Student other) {
        this.name = other.name;
        this.age = other.age;
        this.gpa = other.gpa;
    }
}

Student s1 = new Student();
Student s2 = new Student("Alice", 20, 9.1);
Student s3 = new Student(s2);  // copy
\`\`\`

## Constructor Chaining with this()

\`\`\`java
class Product {
    String name;
    double price;
    int quantity;

    Product(String name) {
        this(name, 0.0);  // calls 2-arg constructor
    }

    Product(String name, double price) {
        this(name, price, 1);  // calls 3-arg constructor
    }

    Product(String name, double price, int quantity) {
        this.name = name;
        this.price = price;
        this.quantity = quantity;
    }
}
\`\`\`

## Calling Parent Constructor with super()

\`\`\`java
class Animal {
    String name;
    Animal(String name) { this.name = name; }
}

class Dog extends Animal {
    String breed;
    Dog(String name, String breed) {
        super(name);         // must be FIRST statement
        this.breed = breed;
    }
}
\`\`\`

## Initialization Order

\`\`\`java
class InitOrder {
    static int x = initX();             // 1. Static field
    static { System.out.println("2. Static block"); } // 2. Static block
    int y = initY();                     // 3. Instance field
    { System.out.println("4. Instance block"); } // 4. Instance block

    InitOrder() { System.out.println("5. Constructor"); } // 5. Constructor

    static int initX() { System.out.println("1. Static field"); return 10; }
    int initY() { System.out.println("3. Instance field"); return 20; }
}
\`\`\`

## Key Rules

- A constructor has **no return type** (not even void)
- Constructor name must **exactly match** the class name
- If no constructor is defined, Java provides a **default no-args** constructor
- If ANY constructor is defined, Java does NOT provide the default one
- \`this()\` and \`super()\` must be the **first statement** in a constructor

## Interview Questions
1. What is a default constructor? When does Java generate one?
2. What is constructor chaining?
3. What is the difference between \`this()\` and \`super()\`?
4. Can a constructor be private? When would you use that?
5. What is the order of initialization in Java?
`,
  },
  {
    id: 60,
    title: "Inheritance",
    domain: "Java — OOP",
    time: "10 min read",
    category: "Java",
    sources: ["Oracle JLS", "GeeksforGeeks"],
    content: `
# Inheritance

**Inheritance** allows a class (child/subclass) to acquire the fields and methods of another class (parent/superclass), promoting code reuse.

## extends Keyword

\`\`\`java
class Vehicle {               // Parent/Superclass
    String brand;
    int speed;

    void start() { System.out.println(brand + " started"); }
    void stop()  { System.out.println(brand + " stopped"); }
}

class Car extends Vehicle {  // Child/Subclass — inherits from Vehicle
    int doors;

    void honk() { System.out.println("Beep!"); }
}

Car myCar = new Car();
myCar.brand = "Toyota";      // inherited field
myCar.start();               // inherited method
myCar.honk();                // own method
\`\`\`

## Method Overriding

A subclass provides a specific implementation of a method defined in the parent.

\`\`\`java
class Animal {
    void makeSound() { System.out.println("Some sound"); }
}

class Dog extends Animal {
    @Override
    void makeSound() { System.out.println("Woof!"); }  // overrides parent
}

class Cat extends Animal {
    @Override
    void makeSound() { System.out.println("Meow!"); }
}

Animal a = new Dog();  // polymorphism
a.makeSound();         // "Woof!" — runtime dispatch
\`\`\`

## super Keyword

\`\`\`java
class Shape {
    String color;
    void draw() { System.out.println("Drawing " + color + " shape"); }
}

class Circle extends Shape {
    double radius;

    Circle(String color, double radius) {
        super.color = color;   // access parent field
        this.radius = radius;
    }

    @Override
    void draw() {
        super.draw();          // call parent method
        System.out.println("Circle radius: " + radius);
    }
}
\`\`\`

## Types of Inheritance in Java

| Type | Java Support |
|---|---|
| Single | ✅ \`class B extends A\` |
| Multilevel | ✅ \`class C extends B extends A\` |
| Hierarchical | ✅ Multiple classes extend same parent |
| Multiple (class) | ❌ NOT supported (use interfaces instead) |
| Hybrid | ❌ NOT supported directly |

## IS-A Relationship

\`\`\`java
Dog d = new Dog();
System.out.println(d instanceof Dog);    // true
System.out.println(d instanceof Animal); // true — Dog IS-A Animal
\`\`\`

## final Class & Method

\`\`\`java
final class ImmutableClass {}   // cannot be subclassed

class Base {
    final void sealedMethod() {} // cannot be overridden in subclass
}
\`\`\`

## Interview Questions
1. What is the difference between inheritance and composition?
2. Why does Java not support multiple inheritance with classes?
3. What is method overriding? What rules must it follow?
4. What does the \`@Override\` annotation do?
5. What is the IS-A relationship?
`,
  },
  {
    id: 61,
    title: "Polymorphism & Dynamic Dispatch",
    domain: "Java — OOP",
    time: "10 min read",
    category: "Java",
    sources: ["Oracle JLS", "Baeldung"],
    content: `
# Polymorphism & Dynamic Dispatch

**Polymorphism** ("many forms") allows one interface to represent different underlying types. In Java there are two kinds:

## 1. Compile-Time Polymorphism — Method Overloading

Same method name, different signatures. Resolved by the **compiler**.

\`\`\`java
class MathUtils {
    int    add(int a, int b)       { return a + b; }
    double add(double a, double b) { return a + b; }
    int    add(int a, int b, int c){ return a + b + c; }

    // Note: return type alone does NOT differentiate overloaded methods
}
\`\`\`

## 2. Runtime Polymorphism — Method Overriding

Subclass overrides parent method. The correct version is selected at **runtime** (dynamic dispatch).

\`\`\`java
class Shape {
    double area() { return 0; }
    void display() {
        System.out.println("Area = " + area()); // calls subclass area()!
    }
}

class Circle extends Shape {
    double r;
    Circle(double r) { this.r = r; }
    @Override double area() { return Math.PI * r * r; }
}

class Rectangle extends Shape {
    double w, h;
    Rectangle(double w, double h) { this.w = w; this.h = h; }
    @Override double area() { return w * h; }
}

// Polymorphic array
Shape[] shapes = {new Circle(5), new Rectangle(4, 6)};
for (Shape s : shapes) {
    s.display();  // correct area() selected at RUNTIME
}
\`\`\`

## Upcasting & Downcasting

\`\`\`java
Animal a = new Dog();     // Upcasting — implicit
Dog d = (Dog) a;          // Downcasting — explicit

// Pattern matching (Java 16+)
if (a instanceof Dog dog) {
    dog.fetch();           // safe, no explicit cast needed
}
\`\`\`

## Dynamic Method Dispatch

Java uses a **vtable** (virtual method table) at runtime to resolve which overridden method to call based on the actual object type — not the reference type.

\`\`\`java
Animal animal = new Dog(); // reference type: Animal, actual type: Dog
animal.makeSound();        // calls DOG's makeSound(), not Animal's
\`\`\`

## Covariant Return Types

A subclass method can return a subtype of the parent's return type.

\`\`\`java
class Animal { Animal getInstance() { return new Animal(); } }
class Dog extends Animal {
    @Override Dog getInstance() { return new Dog(); } // ✅ covariant
}
\`\`\`

## Interview Questions
1. What is the difference between overloading and overriding?
2. Can you override a static method in Java?
3. What is dynamic dispatch / virtual method invocation?
4. What is covariant return type?
5. Can polymorphism work with fields (not methods)?
`,
  },
  {
    id: 62,
    title: "Encapsulation",
    domain: "Java — OOP",
    time: "7 min read",
    category: "Java",
    sources: ["Oracle Docs", "GeeksforGeeks"],
    content: `
# Encapsulation

**Encapsulation** is the bundling of data (fields) and behavior (methods) together in a class, while **hiding** the internal state from outside access. This is enforced using access modifiers + getters/setters.

## Why Encapsulate?

- Protects data from invalid external modification
- Decouples implementation from interface
- Makes maintenance and testing easier

## Implementation

\`\`\`java
public class BankAccount {
    private String owner;
    private double balance;  // private — cannot be accessed directly

    // Constructor
    public BankAccount(String owner, double initialBalance) {
        this.owner = owner;
        this.balance = (initialBalance >= 0) ? initialBalance : 0;
    }

    // Getter
    public double getBalance() {
        return balance;
    }

    // Setter with validation
    public void deposit(double amount) {
        if (amount > 0) balance += amount;
        else throw new IllegalArgumentException("Amount must be positive");
    }

    public boolean withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
            return true;
        }
        return false;
    }

    public String getOwner() { return owner; }
}

BankAccount acc = new BankAccount("Alice", 1000);
acc.deposit(500);
acc.withdraw(200);
System.out.println(acc.getBalance()); // 1300.0
// acc.balance = -9999; ❌ compile error — private!
\`\`\`

## Records (Java 16+) — Compact Encapsulation

\`\`\`java
public record Point(int x, int y) {}

Point p = new Point(3, 4);
System.out.println(p.x()); // 3
System.out.println(p);     // Point[x=3, y=4]
// p.x() is automatically generated accessor — immutable!
\`\`\`

## POJO vs JavaBean

| Type | Rules |
|---|---|
| **POJO** | Plain Old Java Object — no special rules |
| **JavaBean** | Serializable, private fields, public getters/setters, no-arg constructor |

## Interview Questions
1. What is encapsulation and why is it important?
2. How do getters and setters enforce encapsulation?
3. What is a JavaBean?
4. What are Java Records (Java 16+)?
5. Is encapsulation only about private fields?
`,
  },
  {
    id: 63,
    title: "Abstraction",
    domain: "Java — OOP",
    time: "7 min read",
    category: "Java",
    sources: ["Oracle Docs", "GeeksforGeeks"],
    content: `
# Abstraction

**Abstraction** means hiding complex implementation details and exposing only the **essential** features. In Java, abstraction is achieved through **abstract classes** and **interfaces**.

## Why Abstraction?

- Reduces complexity — users only see what they need
- Promotes loose coupling — implementation can change without breaking users
- Enforces a contract — all subclasses must implement abstract methods

## Abstract Class

\`\`\`java
abstract class Shape {
    String color;

    Shape(String color) { this.color = color; }

    abstract double area();        // abstract — no body, subclass must implement
    abstract double perimeter();

    // Concrete method — shared behavior
    void displayInfo() {
        System.out.printf("Color: %s, Area: %.2f%n", color, area());
    }
}

class Circle extends Shape {
    double radius;
    Circle(String color, double r) { super(color); this.radius = r; }

    @Override double area()      { return Math.PI * radius * radius; }
    @Override double perimeter() { return 2 * Math.PI * radius; }
}

// Shape s = new Shape("red"); ❌ Cannot instantiate abstract class
Shape s = new Circle("blue", 5);
s.displayInfo();  // Color: blue, Area: 78.54
\`\`\`

## Interface as Abstraction

\`\`\`java
interface Drawable {
    void draw();              // implicitly public abstract
    default void show() {    // default method with body
        System.out.println("Showing: ");
        draw();
    }
}

class Square implements Drawable {
    @Override public void draw() { System.out.println("Drawing square"); }
}
\`\`\`

## Abstract vs Interface

| Feature | Abstract Class | Interface |
|---|---|---|
| Instantiation | ❌ No | ❌ No |
| Fields | All types | Only \`public static final\` |
| Methods | Abstract + concrete | Abstract + default + static |
| Constructor | ✅ Yes | ❌ No |
| Multiple inheritance | ❌ (single) | ✅ (multiple) |
| Access modifiers | All | \`public\` only |

## Real-World Analogy

A **remote control** (abstraction) exposes simple buttons (volume, channel). You don't need to know how the TV processes infrared signals internally.

## Interview Questions
1. What is the difference between abstraction and encapsulation?
2. Can abstract classes have constructors?
3. Can you have an abstract method in a non-abstract class?
4. What is the difference between an abstract class and an interface?
`,
  },
];
