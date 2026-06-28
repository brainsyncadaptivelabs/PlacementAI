# 📊 Subject Dependency Graph

To learn without gaps, follow the topological sorting of concepts shown below. A solid line ($A \rightarrow B$) indicates that concept $A$ is a prerequisite for concept $B$.

---

```mermaid
graph TD
    %% Section 1: Programming Core
    subgraph Programming Foundations
        LANG_C[C Programming Core] -->|Pointer Arithmetic| POINTERS[Pointers & Memory Layout]
        POINTERS -->|C-Style Arrays| ARRAYS[Linear Data Structures]
        LANG_JAVA[Java Programming Core] -->|JVM Heap/Stack| JVM_MEM[JVM Garbage Collection]
        LANG_CPP[C++ Programming Core] -->|Memory Model| CPP_MEM[C++ Memory Model]
    end

    %% Section 2: DSA Core
    subgraph Algorithm Engineering
        MATH[Discrete Mathematics] -->|Induction & Summations| ASYMP[Asymptotic Analysis]
        ASYMP -->|Recurrence Relations| MASTER_TH[Master Theorem]
        ARRAYS -->|Basic Traversals| SEARCH_SORT[Searching & Sorting]
        SEARCH_SORT -->|Divide & Conquer| MERGESORT[Merge / Quick Sort]
        MASTER_TH -->|Recurrence Solvers| MERGESORT
        MERGESORT -->|Pointers & Nodes| LINKED_LISTS[Linked Lists]
        LINKED_LISTS -->|Tree Traversals| BST[Binary Search Trees]
        BST -->|Self-Balancing Logic| AVL_RBT[AVL & Red-Black Trees]
        AVL_RBT -->|Graphs Representation| GRAPHS[Graph Algorithms]
        GRAPHS -->|DAGs & States| DP[Dynamic Programming]
    end

    %% Section 3: Systems Core
    subgraph Systems Engineering
        POINTERS -->|System Calls| OS_MEM[OS Memory Management: Paging & TLB]
        OS_MEM -->|Sockets & Multiplexing| NETWORKS[Computer Networks: TCP/IP & Sockets]
        NETWORKS -->|Distributed States| DIST_SYS[Distributed Systems: HLD]
    end

    %% Section 4: Databases
    subgraph Database Architecture
        AVL_RBT -->|Disk-based Indexes| DB_INDEX[B+ Trees & LSM Trees]
        DB_INDEX -->|Query Processing| SQL_OPT[SQL Query Optimization]
        SQL_OPT -->|Transaction logs| ACID[ACID Transactions & MVCC]
    end
```

---

## 🛠️ Recommended Study Paths

### 1. The Algorithmist Path
`Discrete Mathematics` $\rightarrow$ `Asymptotic Analysis` $\rightarrow$ `Master Theorem` $\rightarrow$ `Self-Balancing Trees` $\rightarrow$ `Graph Algorithms` $\rightarrow$ `Dynamic Programming`.

### 2. The Systems Architect Path
`C/C++` $\rightarrow$ `Pointers` $\rightarrow$ `OS Memory Management` $\rightarrow$ `B+ Trees` $\rightarrow$ `TCP/IP Networks` $\rightarrow$ `Distributed Systems & CAP Theorem`.
