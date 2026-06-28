# 🎯 Java Practice Exercises & Debugging Challenges

Practice exercises covering tricky syntax, concurrency, and compilation anomalies.

---

## 1. Tricky Code Output Predictions

### Challenge 1: String Pool Reference Comparison
* **Code**:
  ```java
  String s1 = "Java";
  String s2 = new String("Java");
  String s3 = s2.intern();
  
  System.out.println(s1 == s2);
  System.out.println(s1 == s3);
  ```
* **Output Prediction**:
  * `s1 == s2`: `false` (s2 points to a heap object, s1 points to String Constant Pool).
  * `s1 == s3`: `true` (`intern()` returns the matching string reference from the pool).

### Challenge 2: Static Initialization Execution Sequence
* **Code**:
  ```java
  class Test {
      static {
          System.out.println("Static Block");
      }
      {
          System.out.println("Instance Block");
      }
      public Test() {
          System.out.println("Constructor");
      }
  }
  ```
* **Output Sequence** (on `new Test()`):
  1. `Static Block` (Runs once when the class is first loaded by ClassLoader).
  2. `Instance Block` (Runs before every constructor call).
  3. `Constructor`.

---

## 2. Debugging Challenge: Thread Safety Race Condition

Identify the bug in the thread-safe counter and explain how to fix it:

```java
// Buggy Code
public class Counter {
    private int val = 0;
    
    public int getVal() {
        return this.val;
    }
    
    // Multiple threads calling this concurrently increment values incorrectly
    public void increment() {
        this.val++; 
    }
}
```

* **The Bug**: The increment operation `this.val++` is not atomic. It consists of three separate CPU instructions: read value, add 1, write value back. Under concurrency, context switching causes data race conditions.
* **The Fix**: Either make the method `synchronized` or use `AtomicInteger`:
  ```java
  import java.util.concurrent.atomic.AtomicInteger;

  public class SafeCounter {
      private final AtomicInteger val = new AtomicInteger(0);

      public int getVal() {
          return val.get();
      }

      public void increment() {
          val.incrementAndGet(); // Thread-safe atomic operation
      }
  }
  ```
