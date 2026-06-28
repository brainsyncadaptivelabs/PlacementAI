import { Note } from "./notesData";

export const javaNotesB2: Note[] = [
  {
    id: 44,
    title: "Java Installation & Setup",
    domain: "Java — Setup",
    time: "5 min read",
    category: "Java",
    sources: ["Oracle Docs"],
    content: `
# Java Installation & Setup

## Installing on macOS

\`\`\`bash
# Using Homebrew
brew install openjdk@21
export JAVA_HOME=$(brew --prefix openjdk@21)
export PATH="$JAVA_HOME/bin:$PATH"
java -version && javac -version
\`\`\`

## Installing on Windows

1. Download from [adoptium.net](https://adoptium.net) (Eclipse Temurin — free LTS builds)
2. Run the installer; note the install path e.g. \`C:\\Program Files\\Java\\jdk-21\`
3. Set Environment Variables:
   - \`JAVA_HOME = C:\\Program Files\\Java\\jdk-21\`
   - Add \`%JAVA_HOME%\\bin\` to \`PATH\`
4. Open CMD → \`java -version\`

## Installing on Linux (Ubuntu/Debian)

\`\`\`bash
sudo apt update && sudo apt install openjdk-21-jdk
export JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64
java -version
\`\`\`

## Managing Multiple Versions with SDKMAN

\`\`\`bash
curl -s "https://get.sdkman.io" | bash
sdk install java 21.0.1-tem
sdk use java 21.0.1-tem
sdk list java   # see all available versions
\`\`\`

## Interview Questions
1. What is JAVA_HOME and why is it needed?
2. What is the difference between OpenJDK and Oracle JDK?
3. How do you switch Java versions on the same machine?
`,
  },
  {
    id: 45,
    title: "IDE Setup — IntelliJ IDEA & VS Code",
    domain: "Java — Setup",
    time: "5 min read",
    category: "Java",
    sources: ["JetBrains Docs", "Microsoft Docs"],
    content: `
# IDE Setup for Java Development

## IntelliJ IDEA (Best for Java)

Download the **Community Edition** (free) from [jetbrains.com/idea](https://www.jetbrains.com/idea/).

### Configure JDK
\`File → Project Structure → SDKs → + → JDK → select your JAVA_HOME path\`

### Essential Shortcuts

| Action | Mac | Windows |
|---|---|---|
| Run | ⌃R | Shift+F10 |
| Debug | ⌃D | Shift+F9 |
| Auto-fix | ⌥⏎ | Alt+Enter |
| Reformat | ⌘⌥L | Ctrl+Alt+L |
| Find class | ⌘O | Ctrl+N |
| Rename | ⇧F6 | Shift+F6 |
| Generate code | ⌘N | Alt+Insert |

## VS Code (Lightweight Option)

1. Install [VS Code](https://code.visualstudio.com)
2. Install **Extension Pack for Java** by Microsoft (includes debugger, Maven, test runner)

### settings.json
\`\`\`json
{
  "java.configuration.runtimes": [
    {
      "name": "JavaSE-21",
      "path": "/Library/Java/JavaVirtualMachines/jdk-21.jdk/Contents/Home",
      "default": true
    }
  ]
}
\`\`\`

## Interview Questions
1. What advantages does an IDE offer over a plain text editor?
2. What does "live error checking" in IntelliJ rely on under the hood?
`,
  },
  {
    id: 46,
    title: "First Java Program",
    domain: "Java — Setup",
    time: "5 min read",
    category: "Java",
    sources: ["Oracle Docs", "GeeksforGeeks"],
    content: `
# First Java Program

## Hello, World!

\`\`\`java
// File: HelloWorld.java  ← filename MUST match class name
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
\`\`\`

## Anatomy

| Element | Meaning |
|---|---|
| \`public class HelloWorld\` | Public class — must match filename |
| \`public static void main(String[] args)\` | JVM entry point |
| \`public\` | Accessible anywhere |
| \`static\` | No object needed to call it |
| \`void\` | Returns nothing |
| \`String[] args\` | Command-line arguments |
| \`System.out.println()\` | Print to stdout with newline |

## Compile & Run

\`\`\`bash
javac HelloWorld.java   # → HelloWorld.class (bytecode)
java HelloWorld         # → Hello, World!
\`\`\`

## Print Variants

\`\`\`java
System.out.println("With newline");         // adds \\n
System.out.print("No newline");             // no \\n
System.out.printf("Pi ≈ %.4f%n", 3.14159); // formatted
\`\`\`

## Command-Line Arguments

\`\`\`java
public class Greet {
    public static void main(String[] args) {
        String name = args.length > 0 ? args[0] : "World";
        System.out.println("Hello, " + name + "!");
    }
}
\`\`\`
\`\`\`bash
java Greet Bharath   # → Hello, Bharath!
\`\`\`

## Interview Questions
1. Why must the file name match the public class name?
2. Why is \`main\` declared \`static\`?
3. What does \`String[] args\` represent?
`,
  },
  {
    id: 47,
    title: "Variables & Scopes",
    domain: "Java — Core",
    time: "8 min read",
    category: "Java",
    sources: ["Oracle JLS", "GeeksforGeeks"],
    content: `
# Variables & Scopes

A **variable** is a named container for a value of a specific type. Java is statically typed — each variable's type is declared at compile time.

## Types of Variables

| Type | Where Declared | Lifecycle | Default Value |
|---|---|---|---|
| **Local** | Inside method/block | Until block ends | None (must init) |
| **Instance** | Inside class, outside method | Object lifetime | Type default |
| **Static** | Inside class with \`static\` | Class lifetime | Type default |
| **Parameter** | Method signature | Method call | Caller's value |

\`\`\`java
class BankAccount {
    static int totalAccounts = 0;   // static — shared
    String owner;                    // instance — per object
    double balance;                  // instance

    void deposit(double amount) {   // amount = parameter
        double tax = amount * 0.02; // tax = local
        balance += (amount - tax);
    }
}
\`\`\`

## Variable Declaration & Initialization

\`\`\`java
int age;           // declared — no value (local must be initialized before use)
age = 21;          // initialized
int score = 100;   // declare + init in one line

var name = "Java"; // Java 10+ type inference (infers String)
var list = new ArrayList<String>(); // infers ArrayList<String>
\`\`\`

## Scope Rules

\`\`\`java
class Demo {
    int x = 10;              // class scope

    void method() {
        int y = 20;          // method scope
        {
            int z = 30;      // block scope
            System.out.println(x + y + z);  // ✅
        }
        // z not accessible here ❌
    }
}
\`\`\`

## final (Constant)

\`\`\`java
final double PI = 3.14159;
// PI = 3.0; ❌ Cannot reassign final variable

final int MAX_SIZE = 100;   // convention: UPPER_SNAKE_CASE
\`\`\`

## Naming Conventions

| Entity | Style | Example |
|---|---|---|
| Variable | camelCase | \`totalScore\` |
| Constant | UPPER_SNAKE | \`MAX_RETRY\` |
| Class | PascalCase | \`StudentRecord\` |
| Method | camelCase | \`calculateGpa()\` |

## Interview Questions
1. What is the default value of an instance variable of type \`int\`?
2. What happens if you use a local variable before initializing it?
3. What is the difference between \`static\` and instance variables?
4. What does \`var\` do in Java 10+?
`,
  },
  {
    id: 48,
    title: "Primitive Data Types",
    domain: "Java — Core",
    time: "8 min read",
    category: "Java",
    sources: ["Oracle JLS", "W3Schools"],
    content: `
# Primitive Data Types

Java has **8 primitive types** — they store raw values directly in memory (not as objects).

## The 8 Primitives

| Type | Bits | Default | Range | Literal |
|---|---|---|---|---|
| \`byte\` | 8 | 0 | -128 to 127 | \`byte b = 100;\` |
| \`short\` | 16 | 0 | -32,768 to 32,767 | \`short s = 30000;\` |
| \`int\` | 32 | 0 | -2³¹ to 2³¹−1 | \`int i = 1_000_000;\` |
| \`long\` | 64 | 0L | -2⁶³ to 2⁶³−1 | \`long l = 10L;\` |
| \`float\` | 32 | 0.0f | ±3.4×10³⁸ | \`float f = 3.14f;\` |
| \`double\` | 64 | 0.0 | ±1.8×10³⁰⁸ | \`double d = 3.14;\` |
| \`char\` | 16 | '\\u0000' | 0–65,535 (Unicode) | \`char c = 'A';\` |
| \`boolean\` | 1 | false | true/false | \`boolean b = true;\` |

## Wrapper Classes & Autoboxing

Every primitive has a wrapper class in \`java.lang\`:
\`int\` ↔ \`Integer\`, \`double\` ↔ \`Double\`, \`boolean\` ↔ \`Boolean\`, etc.

\`\`\`java
Integer boxed = 42;      // Autoboxing: int → Integer
int unboxed = boxed;     // Unboxing: Integer → int

List<Integer> list = new ArrayList<>();
list.add(5);             // autoboxes 5 → Integer.valueOf(5)
int val = list.get(0);   // unboxes
\`\`\`

## Numeric Literals

\`\`\`java
int million   = 1_000_000;   // underscores (Java 7+)
int hex       = 0xFF;        // hexadecimal = 255
int binary    = 0b1010_1010; // binary = 170
long big      = 9_000_000_000L;  // L suffix required
float pi      = 3.14f;           // f suffix required
\`\`\`

## Type Promotion in Expressions

\`\`\`java
byte a = 40, b = 50;
// byte c = a + b;  ❌ result is int!
int c = a + b;      // ✅

// Rule: byte/short/char promoted to int; int+long=long; float+double=double
\`\`\`

## Interview Questions
1. What is the size (in bits) of an \`int\` in Java?
2. Why use \`long\` instead of \`int\`?
3. What is autoboxing? What are its performance pitfalls?
4. What is the default value of an uninitialized boolean instance variable?
`,
  },
  {
    id: 49,
    title: "Operators in Java",
    domain: "Java — Core",
    time: "8 min read",
    category: "Java",
    sources: ["Oracle JLS", "GeeksforGeeks"],
    content: `
# Operators in Java

## 1. Arithmetic

\`\`\`java
int a = 10, b = 3;
a + b   // 13
a - b   // 7
a * b   // 30
a / b   // 3 (integer division — truncates)
a % b   // 1 (remainder/modulo)
\`\`\`

## 2. Relational (Comparison)

\`\`\`java
10 > 5    // true
10 == 10  // true
10 != 5   // true
5 >= 5    // true
4 <= 3    // false
\`\`\`

## 3. Logical

\`\`\`java
true && false  // false — AND (short-circuits: stops at first false)
true || false  // true  — OR  (short-circuits: stops at first true)
!true          // false — NOT
\`\`\`

## 4. Bitwise

\`\`\`java
// 5 = 0101, 3 = 0011
5 & 3   // 0001 = 1   (AND)
5 | 3   // 0111 = 7   (OR)
5 ^ 3   // 0110 = 6   (XOR)
~5      // -6          (complement)
5 << 1  // 0010 = 10  (left shift × 2)
5 >> 1  // 0010 = 2   (right shift ÷ 2, sign-preserving)
-8>>>1  // unsigned right shift (fills with 0)
\`\`\`

## 5. Compound Assignment

\`\`\`java
int n = 10;
n += 5;  // 15
n -= 3;  // 12
n *= 2;  // 24
n /= 4;  // 6
n %= 4;  // 2
n <<= 1; // 4
\`\`\`

## 6. Unary & Increment/Decrement

\`\`\`java
int i = 5;
int a = i++;  // a=5, i=6 (post-increment: use then increment)
int b = ++i;  // i=7, b=7 (pre-increment: increment then use)
\`\`\`

## 7. Ternary

\`\`\`java
int age = 18;
String label = (age >= 18) ? "Adult" : "Minor"; // "Adult"
\`\`\`

## 8. instanceof (Pattern Matching, Java 16+)

\`\`\`java
Object obj = "Hello";
if (obj instanceof String s) {       // Pattern matching
    System.out.println(s.length()); // 5 — no cast needed
}
\`\`\`

## Operator Precedence (Highest → Lowest)

\`\`\`
Postfix: i++ i--
Unary:   ++i --i + - ~ !
Multiply: * / %
Add:      + -
Shift:    << >> >>>
Compare:  < <= > >= instanceof
Equals:   == !=
Bitwise:  &  ^  |
Logical:  && ||
Ternary:  ?:
Assign:   = += -= ...
\`\`\`

## Interview Questions
1. Difference between \`==\` and \`.equals()\`?
2. What is short-circuit evaluation?
3. Difference between \`>>\` and \`>>>\`?
4. What is the result of \`5/2\` vs \`5.0/2\`?
`,
  },
  {
    id: 50,
    title: "Console Input & Output",
    domain: "Java — Core",
    time: "7 min read",
    category: "Java",
    sources: ["Oracle Docs", "GeeksforGeeks"],
    content: `
# Console Input & Output

## Output

\`\`\`java
System.out.println("With newline");
System.out.print("No newline");
System.out.printf("Name: %s, Score: %d, GPA: %.2f%n", "Bharath", 95, 9.1);

// String.format — returns a String, doesn't print
String msg = String.format("Result: %s", "PASS");
\`\`\`

## Format Specifiers

| Spec | Type | Example |
|---|---|---|
| \`%d\` | int/long | \`"Age: %d"` → \`Age: 21\` |
| \`%f\` / \`%.2f\` | float/double | \`"%.2f"` → \`3.14\` |
| \`%s\` | String | \`"%s"` → \`Java\` |
| \`%c\` | char | \`"%c"` → \`A\` |
| \`%b\` | boolean | \`"%b"` → \`true\` |
| \`%n\` | Newline | platform-independent |
| \`%10d\` | Right-pad to 10 | |
| \`%-10d\` | Left-pad to 10 | |

## Input with Scanner

\`\`\`java
import java.util.Scanner;

Scanner sc = new Scanner(System.in);

System.out.print("Enter name: ");
String name = sc.nextLine();      // reads full line (spaces included)

System.out.print("Enter age: ");
int age = sc.nextInt();           // reads int

System.out.print("Enter GPA: ");
double gpa = sc.nextDouble();

System.out.printf("Hello %s! Age: %d, GPA: %.1f%n", name, age, gpa);
sc.close();
\`\`\`

### ⚠️ nextInt + nextLine Pitfall

\`\`\`java
int num = sc.nextInt();
sc.nextLine();           // consume leftover \\n — MUST do this!
String text = sc.nextLine(); // now reads correctly
\`\`\`

## Scanner Methods

| Method | Reads |
|---|---|
| \`nextLine()\` | Full line including spaces |
| \`next()\` | Next token (space-separated) |
| \`nextInt()\` | Integer |
| \`nextDouble()\` | Double |
| \`hasNextInt()\` | Returns true if next token is int |

## BufferedReader (Competitive Programming)

\`\`\`java
BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
int n = Integer.parseInt(br.readLine().trim());
String[] parts = br.readLine().split(" ");
\`\`\`

## Interview Questions
1. Difference between \`next()\` and \`nextLine()\`?
2. Why must you call \`sc.nextLine()\` after \`sc.nextInt()\`?
3. When is \`BufferedReader\` preferred over \`Scanner\`?
`,
  },
  {
    id: 51,
    title: "Type Casting & Type Promotion",
    domain: "Java — Core",
    time: "7 min read",
    category: "Java",
    sources: ["Oracle JLS", "GeeksforGeeks"],
    content: `
# Type Casting & Type Promotion

## Widening (Implicit) Conversion

Automatically converts smaller → larger type. No data loss.

\`\`\`
byte → short → int → long → float → double
                        char ↗
\`\`\`

\`\`\`java
int i = 100;
long l = i;       // automatic widening
double d = l;     // automatic widening
\`\`\`

## Narrowing (Explicit) Cast

Requires manual cast — possible data loss.

\`\`\`java
double d = 9.99;
int i = (int) d;     // truncates → 9 (NOT rounded!)

long big = 100_000_000_000L;
int small = (int) big; // OVERFLOW — undefined truncation

char c = (char) 65;  // → 'A'
int ascii = 'A';     // → 65 (char widens to int automatically)
\`\`\`

## Type Promotion Rules in Expressions

\`\`\`java
byte a = 40, b = 50;
// byte c = a + b;  ❌ a+b is promoted to int!
int c = a + b;      // ✅

int x = 10;
double result = x * 2.5; // x promoted to double → 25.0
\`\`\`

**Rules**: \`byte\`/\`short\`/\`char\` → \`int\`; \`int\`+\`long\`→\`long\`; anything+\`float\`→\`float\`; anything+\`double\`→\`double\`

## String ↔ Primitive Conversion

\`\`\`java
// Primitive → String
String s = String.valueOf(42);       // "42"
String s2 = Integer.toString(42);    // "42"

// String → Primitive
int n    = Integer.parseInt("42");
double d = Double.parseDouble("3.14");
boolean b = Boolean.parseBoolean("true");
long l   = Long.parseLong("9999999999");
\`\`\`

## Object Casting (Upcasting & Downcasting)

\`\`\`java
class Animal {}
class Dog extends Animal { void bark() { System.out.println("Woof!"); } }

Animal a = new Dog();   // Upcasting — implicit (Dog IS-A Animal)
Dog d = (Dog) a;        // Downcasting — explicit
d.bark();               // ✅

// Safe downcasting
if (a instanceof Dog dog) {  // Java 16+ pattern matching
    dog.bark();
}

// Unsafe — throws ClassCastException at runtime
Animal cat = new Animal();
Dog d2 = (Dog) cat;  // ❌ ClassCastException
\`\`\`

## Interview Questions
1. Difference between widening and narrowing conversion?
2. What happens when you cast a \`double\` to \`int\`?
3. What is \`ClassCastException\` and how to prevent it?
4. Why does \`byte + byte\` produce \`int\`?
`,
  },
  {
    id: 52,
    title: "Control Statements",
    domain: "Java — Core",
    time: "8 min read",
    category: "Java",
    sources: ["Oracle JLS", "W3Schools"],
    content: `
# Control Statements in Java

## if / else if / else

\`\`\`java
int score = 85;

if (score >= 90) {
    System.out.println("Grade: A");
} else if (score >= 80) {
    System.out.println("Grade: B");  // ← runs
} else if (score >= 70) {
    System.out.println("Grade: C");
} else {
    System.out.println("Grade: F");
}
\`\`\`

## switch Statement (Classic)

\`\`\`java
int day = 3;
switch (day) {
    case 1: System.out.println("Mon"); break;
    case 2: System.out.println("Tue"); break;
    case 3: System.out.println("Wed"); break; // ← runs
    default: System.out.println("?");
}
// Without break: fall-through to next case!
\`\`\`

## switch Expression (Java 14+)

\`\`\`java
String dayName = switch (day) {
    case 1 -> "Monday";
    case 2 -> "Tuesday";
    case 3 -> "Wednesday";
    default -> "Unknown";
};
// No fall-through, no break needed
\`\`\`

## switch with Multiple Labels

\`\`\`java
int result = switch (day) {
    case 1, 2, 3, 4, 5 -> { yield 1; } // weekday
    case 6, 7 -> 0; // weekend
    default -> -1;
};
\`\`\`

## break & continue

\`\`\`java
// break — exits nearest loop/switch
for (int i = 0; i < 10; i++) {
    if (i == 5) break;
    System.out.print(i + " "); // 0 1 2 3 4
}

// continue — skip current iteration
for (int i = 0; i < 10; i++) {
    if (i % 2 == 0) continue;
    System.out.print(i + " "); // 1 3 5 7 9
}
\`\`\`

## Labeled break (Nested Loops)

\`\`\`java
outer:
for (int i = 0; i < 3; i++) {
    for (int j = 0; j < 3; j++) {
        if (j == 1) break outer; // exits both loops
        System.out.println(i + "," + j);
    }
}
// Prints only: 0,0
\`\`\`

## Interview Questions
1. What is fall-through in switch? How do you prevent it?
2. Difference between \`break\` and \`continue\`?
3. What types can be used in a switch expression (Java 14+)?
4. What does \`yield\` do in a switch expression?
`,
  },
  {
    id: 53,
    title: "Loops & Iterations",
    domain: "Java — Core",
    time: "8 min read",
    category: "Java",
    sources: ["Oracle JLS", "GeeksforGeeks"],
    content: `
# Loops & Iterations in Java

## for Loop

Best when the **number of iterations is known**.

\`\`\`java
for (int i = 0; i < 5; i++) {
    System.out.print(i + " "); // 0 1 2 3 4
}
// Structure: for (init; condition; update)
\`\`\`

## while Loop

Best when the number of iterations is **unknown** — checks condition before each iteration.

\`\`\`java
int n = 1;
while (n <= 5) {
    System.out.print(n + " "); // 1 2 3 4 5
    n++;
}
\`\`\`

## do-while Loop

Executes body **at least once** — checks condition after.

\`\`\`java
int n = 10;
do {
    System.out.println(n); // prints 10 (condition is false from start)
    n++;
} while (n < 5);
\`\`\`

## Enhanced for (for-each)

Iterates over arrays or \`Iterable\` (Collections).

\`\`\`java
int[] nums = {1, 2, 3, 4, 5};
for (int num : nums) {
    System.out.print(num + " "); // 1 2 3 4 5
}

List<String> names = List.of("Alice", "Bob", "Carol");
for (String name : names) System.out.println(name);
\`\`\`

## Common Patterns

\`\`\`java
// Sum 1 to N
int sum = 0;
for (int i = 1; i <= 100; i++) sum += i;
// sum = 5050

// Factorial
long fact = 1;
for (int i = 1; i <= 10; i++) fact *= i;

// Reverse array
int[] arr = {1, 2, 3, 4, 5};
for (int i = arr.length - 1; i >= 0; i--) System.out.print(arr[i] + " ");

// Prime check (optimized to √n)
boolean isPrime(int n) {
    if (n < 2) return false;
    for (int i = 2; i * i <= n; i++)
        if (n % i == 0) return false;
    return true;
}
\`\`\`

## Nested Loops — Patterns

\`\`\`java
// Star triangle
for (int i = 1; i <= 5; i++) {
    for (int j = 1; j <= i; j++) System.out.print("* ");
    System.out.println();
}
/*
*
* *
* * *
* * * *
* * * * *
*/
\`\`\`

## Interview Questions
1. Difference between \`while\` and \`do-while\`?
2. Can you use \`for-each\` to modify array elements?
3. What happens if you forget to increment in a \`while\` loop?
4. What is the time complexity of a nested loop with n iterations each?
`,
  },
];
