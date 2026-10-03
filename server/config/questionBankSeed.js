/**
 * Authoritative Curated Seed Dataset for Phase 3 Question Bank
 * Covers DSA, Technical Quiz, SQL Practice, and System Design.
 */
export const SEED_QUESTIONS = [
  // ==========================================
  // CODING PRACTICE
  // ==========================================
  {
    slug: "reverse-string",
    contentType: "coding",
    title: "Reverse String",
    difficulty: "easy",
    category: "Strings",
    subtopic: "Manipulation",
    tags: ["string", "two-pointers"],
    companyTags: ["Apple", "Microsoft"],
    description: `Write a function that reverses a string. The input string is given as an array of characters \`s\`.

You must do this by modifying the input array in-place with \`O(1)\` extra memory.

### Example 1:
\`\`\`
Input: s = ["h","e","l","l","o"]
Output: ["o","l","l","e","h"]
\`\`\`

### Example 2:
\`\`\`
Input: s = ["H","a","n","n","a","h"]
Output: ["h","a","n","n","a","H"]
\`\`\``,
    dsaMetadata: {
      starterCode: {
        python: `class Solution:
    def reverseString(self, s: list[str]) -> None:
        """
        Do not return anything, modify s in-place instead.
        """
        pass
`,
        javascript: `/**
 * @param {character[]} s
 * @return {void} Do not return anything, modify s in-place instead.
 */
function reverseString(s) {
  // Write your solution here
}
`,
        cpp: `#include <vector>
using namespace std;

class Solution {
public:
    void reverseString(vector<char>& s) {
        // Write your solution here
    }
};
`,
        java: `class Solution {
    public void reverseString(char[] s) {
        // Write your solution here
    }
}
`,
      },
      constraints: [
        "1 <= s.length <= 10^5",
        "s[i] is a printable ascii character.",
      ],
      sampleTestCases: [
        {
          input: '["h","e","l","l","o"]',
          expectedOutput: '["o","l","l","e","h"]',
          explanation: "The characters are reversed.",
        },
        {
          input: '["H","a","n","n","a","h"]',
          expectedOutput: '["h","a","n","n","a","H"]',
          explanation: "The characters are reversed.",
        },
      ],
      hiddenTestCases: [
        {
          input: '["a"]',
          expectedOutput: '["a"]',
        },
        {
          input: '["a","b"]',
          expectedOutput: '["b","a"]',
        },
      ],
    },
  },
  {
    slug: "fizz-buzz",
    contentType: "coding",
    title: "Fizz Buzz",
    difficulty: "easy",
    category: "Math",
    subtopic: "Simulation",
    tags: ["math", "string", "simulation"],
    companyTags: ["Amazon", "Microsoft", "Bloomberg"],
    description: `Given an integer \`n\`, return *a string array* \`answer\` (1-indexed) where:

* \`answer[i] == "FizzBuzz"\` if \`i\` is divisible by \`3\` and \`5\`.
* \`answer[i] == "Fizz"\` if \`i\` is divisible by \`3\`.
* \`answer[i] == "Buzz"\` if \`i\` is divisible by \`5\`.
* \`answer[i] == i\` (as a string) if none of the above conditions are true.

### Example 1:
\`\`\`
Input: n = 3
Output: ["1","2","Fizz"]
\`\`\`

### Example 2:
\`\`\`
Input: n = 5
Output: ["1","2","Fizz","4","Buzz"]
\`\`\`

### Example 3:
\`\`\`
Input: n = 15
Output: ["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]
\`\`\``,
    dsaMetadata: {
      starterCode: {
        python: `class Solution:
    def fizzBuzz(self, n: int) -> list[str]:
        # Write your solution here
        pass
`,
        javascript: `/**
 * @param {number} n
 * @return {string[]}
 */
function fizzBuzz(n) {
  // Write your solution here
}
`,
        cpp: `#include <vector>
#include <string>
using namespace std;

class Solution {
public:
    vector<string> fizzBuzz(int n) {
        // Write your solution here
        return {};
    }
};
`,
        java: `import java.util.*;

class Solution {
    public List<String> fizzBuzz(int n) {
        // Write your solution here
        return new ArrayList<>();
    }
}
`,
      },
      constraints: [
        "1 <= n <= 10^4",
      ],
      sampleTestCases: [
        {
          input: "3",
          expectedOutput: '["1","2","Fizz"]',
          explanation: "Standard FizzBuzz for n=3.",
        },
        {
          input: "5",
          expectedOutput: '["1","2","Fizz","4","Buzz"]',
          explanation: "Standard FizzBuzz for n=5.",
        },
      ],
      hiddenTestCases: [
        {
          input: "1",
          expectedOutput: '["1"]',
        },
        {
          input: "15",
          expectedOutput: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]',
        },
      ],
    },
  },
  // ==========================================
  // DSA / CODING PRACTICE
  // ==========================================
  {
    slug: "two-sum",
    contentType: "dsa",
    title: "Two Sum",
    difficulty: "easy",
    category: "Data Structures",
    subtopic: "Arrays & Hashing",
    tags: ["array", "hash-table"],
    companyTags: ["Google", "Amazon", "Meta", "Microsoft"],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have ***exactly one solution***, and you may not use the *same* element twice.

You can return the answer in any order.

### Example 1:
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

### Example 2:
\`\`\`
Input: nums = [3,2,4], target = 6
Output: [1,2]
\`\`\``,
    dsaMetadata: {
      starterCode: {
        python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Write your solution here
        pass
`,
        javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Write your solution here
}
`,
        cpp: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        return {};
    }
};
`,
        java: `import java.util.*;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }
}
`,
      },
      constraints: [
        "2 <= nums.length <= 10^4",
        "-10^9 <= nums[i] <= 10^9",
        "-10^9 <= target <= 10^9",
        "Only one valid answer exists.",
      ],
      sampleTestCases: [
        {
          input: "[2,7,11,15]\n9",
          expectedOutput: "[0,1]",
          explanation: "nums[0] + nums[1] = 2 + 7 = 9",
        },
        {
          input: "[3,2,4]\n6",
          expectedOutput: "[1,2]",
          explanation: "nums[1] + nums[2] = 2 + 4 = 6",
        },
      ],
      hiddenTestCases: [
        {
          input: "[3,3]\n6",
          expectedOutput: "[0,1]",
        },
        {
          input: "[-1,-2,-3,-4,-5]\n-8",
          expectedOutput: "[2,4]",
        },
      ],
    },
  },
  {
    slug: "valid-parentheses",
    contentType: "dsa",
    title: "Valid Parentheses",
    difficulty: "easy",
    category: "Data Structures",
    subtopic: "Stack",
    tags: ["stack", "string"],
    companyTags: ["Amazon", "Microsoft", "Google", "Bloomberg"],
    description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

### Example 1:
\`\`\`
Input: s = "()"
Output: true
\`\`\`

### Example 2:
\`\`\`
Input: s = "()[]{}"
Output: true
\`\`\`

### Example 3:
\`\`\`
Input: s = "(]"
Output: false
\`\`\``,
    dsaMetadata: {
      starterCode: {
        python: `class Solution:
    def isValid(self, s: str) -> bool:
        pass
`,
        javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // Write your solution here
}
`,
        cpp: `#include <string>
#include <stack>
using namespace std;

class Solution {
public:
    bool isValid(string s) {
        return false;
    }
};
`,
        java: `import java.util.*;

class Solution {
    public boolean isValid(String s) {
        return false;
    }
}
`,
      },
      constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'."],
      sampleTestCases: [
        { input: "\"()\"", expectedOutput: "true", explanation: "Matching parentheses" },
        { input: "\"()[]{}\"", expectedOutput: "true", explanation: "All matched in order" },
        { input: "\"(]\"", expectedOutput: "false", explanation: "Mismatched types" },
      ],
      hiddenTestCases: [
        { input: "\"([)]\"", expectedOutput: "false" },
        { input: "\"{[]}\"", expectedOutput: "true" },
        { input: "\"[\"", expectedOutput: "false" },
      ],
    },
  },
  {
    slug: "lru-cache",
    contentType: "dsa",
    title: "LRU Cache Design",
    difficulty: "medium",
    category: "System & Data Structures",
    subtopic: "Design & Hash Map",
    tags: ["hash-table", "linked-list", "design"],
    companyTags: ["Amazon", "Google", "Microsoft", "Meta"],
    description: `Design a data structure that follows the constraints of a **Least Recently Used (LRU) cache**.

Implement the \`LRUCache\` class:
- \`LRUCache(int capacity)\` Initialize the LRU cache with positive size \`capacity\`.
- \`int get(int key)\` Return the value of the \`key\` if the key exists, otherwise return \`-1\`.
- \`void put(int key, int value)\` Update the value of the \`key\` if the \`key\` exists. Otherwise, add the \`key-value\` pair to the cache. If the number of keys exceeds the \`capacity\` from this operation, **evict** the least recently used key.

The functions \`get\` and \`put\` must each run in \`O(1)\` average time complexity.`,
    dsaMetadata: {
      starterCode: {
        python: `class LRUCache:
    def __init__(self, capacity: int):
        pass

    def get(self, key: int) -> int:
        pass

    def put(self, key: int, value: int) -> None:
        pass
`,
        javascript: `class LRUCache {
  /**
   * @param {number} capacity
   */
  constructor(capacity) {
    this.capacity = capacity;
  }

  get(key) {
    return -1;
  }

  put(key, value) {
  }
}
`,
        cpp: `class LRUCache {
public:
    LRUCache(int capacity) {}
    int get(int key) { return -1; }
    void put(int key, int value) {}
};
`,
        java: `class LRUCache {
    public LRUCache(int capacity) {}
    public int get(int key) { return -1; }
    public void put(int key, int value) {}
}
`,
      },
      constraints: [
        "1 <= capacity <= 3000",
        "0 <= key <= 10^4",
        "0 <= value <= 10^5",
        "At most 2 * 10^5 calls will be made to get and put.",
      ],
      sampleTestCases: [
        {
          input: '["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"]\n[[2], [1, 1], [2, 2], [1], [3, 3], [2], [4, 4], [1], [3], [4]]',
          expectedOutput: "[null, null, null, 1, null, -1, null, -1, 3, 4]",
          explanation: "Standard LRU cache lifecycle",
        },
      ],
      hiddenTestCases: [
        {
          input: '["LRUCache", "put", "get"]\n[[1], [2, 1], [2]]',
          expectedOutput: "[null, null, 1]",
        },
      ],
    },
  },

  // ==========================================
  // TECHNICAL QUIZ QUESTIONS
  // ==========================================
  {
    slug: "os-virtual-memory-page-fault",
    contentType: "quiz",
    title: "Virtual Memory & Page Faults",
    difficulty: "medium",
    category: "Operating Systems",
    subtopic: "Memory Management",
    tags: ["os", "virtual-memory", "paging"],
    companyTags: ["Google", "Microsoft", "TCS", "Infosys"],
    description: "What sequence of events occurs when a CPU attempts to access a page marked invalid in the page table?",
    quizMetadata: {
      options: [
        { key: "A", text: "The CPU immediately raises a kernel trap (Page Fault), context switches to OS handler, loads the page from disk into a free physical frame, updates the page table, and restarts the instruction." },
        { key: "B", text: "The operating system terminates the process immediately with a Segmentation Fault error without checking disk backing." },
        { key: "C", text: "The CPU bypasses the MMU and directly reads the data from the hard disk controller into registers." },
        { key: "D", text: "The process is placed in a zombie state until the garbage collector frees adjacent memory frames." },
      ],
      correctOptionKey: "A",
      explanation: "A page fault is a hardware interrupt raised by the Memory Management Unit (MMU) when a program accesses a virtual page that has no mapped physical frame. The OS locates the page on swap/disk, brings it into RAM, updates the PTE, and re-executes the faulting instruction.",
    },
  },
  {
    slug: "dbms-acid-isolation-levels",
    contentType: "quiz",
    title: "Database Isolation Levels & Anomalies",
    difficulty: "medium",
    category: "Database Systems",
    subtopic: "Transactions & Concurrency",
    tags: ["dbms", "acid", "sql", "transactions"],
    companyTags: ["Amazon", "Uber", "Oracle"],
    description: "Which SQL transaction isolation level prevents Dirty Reads and Non-Repeatable Reads, but may still permit Phantom Reads under the ANSI/ISO SQL standard?",
    quizMetadata: {
      options: [
        { key: "A", text: "Read Uncommitted" },
        { key: "B", text: "Read Committed" },
        { key: "C", text: "Repeatable Read" },
        { key: "D", text: "Serializable" },
      ],
      correctOptionKey: "C",
      explanation: "Under ANSI SQL-92, Repeatable Read prevents Dirty Reads (reading uncommitted changes) and Non-Repeatable Reads (row modified mid-transaction), but allows Phantom Reads (new matching rows inserted by another concurrent transaction). Serializable prevents all three.",
    },
  },
  {
    slug: "cn-tcp-three-way-handshake",
    contentType: "quiz",
    title: "TCP 3-Way Handshake Flags",
    difficulty: "easy",
    category: "Computer Networks",
    subtopic: "Transport Layer",
    tags: ["networking", "tcp", "protocols"],
    companyTags: ["Cisco", "Google", "Amazon"],
    description: "What is the correct sequence of TCP flag packets exchanged between client and server to establish a connection?",
    quizMetadata: {
      options: [
        { key: "A", text: "SYN -> SYN-ACK -> ACK" },
        { key: "B", text: "ACK -> SYN -> ACK" },
        { key: "C", text: "SYN -> ACK -> FIN" },
        { key: "D", text: "RST -> SYN -> ACK" },
      ],
      correctOptionKey: "A",
      explanation: "The client sends a SYN packet with initial sequence number x; server responds with SYN-ACK acknowledging x+1 with sequence y; client responds with ACK y+1 to establish the connection.",
    },
  },
  {
    slug: "sys-cap-theorem-tradeoffs",
    contentType: "quiz",
    title: "CAP Theorem in Distributed Systems",
    difficulty: "hard",
    category: "Distributed Systems",
    subtopic: "CAP Theorem",
    tags: ["system-design", "distributed-systems", "scalability"],
    companyTags: ["Meta", "Netflix", "Amazon"],
    description: "In the presence of a network partition (P) in a distributed data store, what trade-off must architecturally be made?",
    quizMetadata: {
      options: [
        { key: "A", text: "Choose between Consistency (guaranteeing all nodes see the same data at the cost of returning errors) or Availability (returning stale or local data at the cost of consistency)." },
        { key: "B", text: "Disable all read operations and allow write operations only." },
        { key: "C", text: "Elect a single centralized leader and drop network partitioning protection." },
        { key: "D", text: "Increase network bandwidth to eliminate network partitions completely." },
      ],
      correctOptionKey: "A",
      explanation: "According to Eric Brewer's CAP Theorem, network partitions are inevitable in real-world distributed networks. Thus, when partition occurs, a system must choose CP (Consistency over Availability) or AP (Availability over Consistency).",
    },
  },

  // ==========================================
  // SQL PRACTICE
  // ==========================================
  {
    slug: "second-highest-salary",
    contentType: "sql",
    title: "Second Highest Salary",
    difficulty: "easy",
    category: "Database Systems",
    subtopic: "Subqueries & Aggregations",
    tags: ["sql", "aggregation", "subquery"],
    companyTags: ["Amazon", "LinkedIn", "Microsoft"],
    description: `Write a SQL query to find the **second highest** distinct salary from the \`Employee\` table. If there is no second highest salary, return \`null\`.

### Table: Employee
| Column Name | Type |
| :--- | :--- |
| id | int |
| salary | int |

### Example 1:
\`\`\`
Employee:
+----+--------+
| id | salary |
+----+--------+
| 1  | 100    |
| 2  | 200    |
| 3  | 300    |
+----+--------+

Output:
+---------------------+
| SecondHighestSalary |
+---------------------+
| 200                 |
+---------------------+
\`\`\``,
    sqlMetadata: {
      schemaDdl: `CREATE TABLE Employee (
  id INTEGER PRIMARY KEY,
  salary INTEGER NOT NULL
);`,
      seedDataSql: `INSERT INTO Employee (id, salary) VALUES 
(1, 100),
(2, 200),
(3, 300);`,
      referenceQuery: `SELECT (
  SELECT DISTINCT salary 
  FROM Employee 
  ORDER BY salary DESC 
  LIMIT 1 OFFSET 1
) AS SecondHighestSalary;`,
      expectedOutput: [{ SecondHighestSalary: 200 }],
    },
  },
  {
    slug: "department-top-earners",
    contentType: "sql",
    title: "Department Highest Salaries",
    difficulty: "medium",
    category: "Database Systems",
    subtopic: "Joins & Group By",
    tags: ["sql", "join", "group-by"],
    companyTags: ["Google", "Meta", "Amazon"],
    description: `Find employees who have the highest salary in each of the departments. Return the Department name, Employee name, and Salary.`,
    sqlMetadata: {
      schemaDdl: `CREATE TABLE Department (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE Employee (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  salary INTEGER NOT NULL,
  departmentId INTEGER,
  FOREIGN KEY (departmentId) REFERENCES Department(id)
);`,
      seedDataSql: `INSERT INTO Department (id, name) VALUES (1, 'IT'), (2, 'Sales');
INSERT INTO Employee (id, name, salary, departmentId) VALUES 
(1, 'Joe', 85000, 1),
(2, 'Henry', 80000, 2),
(3, 'Sam', 60000, 2),
(4, 'Max', 90000, 1);`,
      referenceQuery: `SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary
FROM Employee e
JOIN Department d ON e.departmentId = d.id
WHERE (e.departmentId, e.salary) IN (
  SELECT departmentId, MAX(salary)
  FROM Employee
  GROUP BY departmentId
);`,
      expectedOutput: [
        { Department: "IT", Employee: "Max", Salary: 90000 },
        { Department: "Sales", Employee: "Henry", Salary: 80000 },
      ],
    },
  },

  // ==========================================
  // SYSTEM DESIGN WORKSPACE
  // ==========================================
  {
    slug: "design-url-shortener",
    contentType: "system_design",
    title: "Design a Scalable URL Shortener (TinyURL)",
    difficulty: "medium",
    category: "Distributed Systems",
    subtopic: "Web Services & Caching",
    tags: ["system-design", "hashing", "caching", "nosql"],
    companyTags: ["Google", "Amazon", "Microsoft", "Meta"],
    description: `Design a scalable URL shortening service like TinyURL or Bitly. The service should accept long URLs and generate compact short links that redirect to the original destination with high availability and low latency.

### Core Requirements:
1. Given a URL, generate a shorter and unique alias (e.g. \`https://iv.link/x7kQ9\`).
2. When users access a short link, redirect them to the original link within <50ms.
3. High availability ($99.99\\%$) and fault tolerance.
4. Scale: 100 Million new URLs created per month, 10 Billion read redirections per month ($100:1$ read-to-write ratio).`,
    systemDesignMetadata: {
      scaleRequirements: {
        dau: "100 Million Active Users",
        qps: "Writes: ~40 QPS, Reads: ~4,000 QPS",
        storage: "~1.5 TB per year, 7.5 TB over 5 years",
        readWriteRatio: "100 : 1 (Read heavy)",
      },
      functionalRequirements: [
        "URL Shortening with unique Base62 alias",
        "HTTP 301/302 Redirect with sub-50ms latency",
        "Custom alias support (optional vanity URLs)",
        "Analytics on click counts and geographic metrics",
      ],
      nonFunctionalRequirements: [
        "High availability (99.99%)",
        "Low latency (<50ms for redirects)",
        "Predictable alias collision avoidance",
        "Distributed in-memory caching (Redis/Memcached)",
      ],
      evaluationRubric: {
        architecturalCompleteness: 25,
        scalingCorrectness: 25,
        dataDesign: 25,
        tradeOffAnalysis: 25,
      },
    },
  },
  {
    slug: "design-rate-limiter",
    contentType: "system_design",
    title: "Design an API Rate Limiter",
    difficulty: "medium",
    category: "Distributed Systems",
    subtopic: "Security & API Gateways",
    tags: ["system-design", "rate-limiting", "redis", "concurrency"],
    companyTags: ["Stripe", "Cloudflare", "Uber", "Amazon"],
    description: `Design a high-throughput, low-latency API Rate Limiter to protect downstream microservices from denial of service and abusive clients.

### Core Requirements:
1. Limit requests per client IP or API key (e.g., 100 requests per minute).
2. Return HTTP 429 Too Many Requests with informative retry headers.
3. Microsecond-level evaluation overhead so downstream API latency is not noticeably impacted.
4. Distributed support across multiple API gateway server instances.`,
    systemDesignMetadata: {
      scaleRequirements: {
        dau: "50 Million API Consumers",
        qps: "Peak 50,000 QPS across all gateway instances",
        storage: "~500 MB RAM memory footprint in Redis cluster",
        readWriteRatio: "1 : 1 (Every request requires atomic check-and-increment)",
      },
      functionalRequirements: [
        "Throttle requests exceeding configured quota threshold",
        "Return standard X-RateLimit-Limit, Remaining, Reset headers",
        "Support configurable tier policies (Free vs Pro tiers)",
      ],
      nonFunctionalRequirements: [
        "Minimal latency (<2ms overhead per evaluation)",
        "Distributed synchronization without race conditions (Redis Lua script)",
        "Graceful degradation if cache cluster is temporarily unreachable",
      ],
      evaluationRubric: {
        architecturalCompleteness: 25,
        scalingCorrectness: 25,
        dataDesign: 25,
        tradeOffAnalysis: 25,
      },
    },
  },
];

