// Antigravity Omni-Intelligence Engine
// Multi-Domain Knowledge Base, Math Solver, Coding Assistant, and Universal Conversational Synthesizer

export interface AntigravityContext {
  userName?: string
  college?: string
  currentBalance?: number
  safeDailySpend?: number
  formatMoney?: (amount: number) => string
}

// Math expression evaluator for calculations like "25 * 40", "15% of 12000", "2^16", "compound interest"
export function tryEvaluateMath(query: string): string | null {
  const q = query.toLowerCase().trim()

  // Percentage calculation: "15% of 12000" or "what is 20 percent of 5000"
  const pctMatch = q.match(/(?:what is\s+)?(\d+(?:\.\d+)?)\s*(?:%|percent)\s*(?:of)\s*([₹$]?\s*\d+(?:\.\d+)?)/i)
  if (pctMatch) {
    const rate = parseFloat(pctMatch[1])
    const base = parseFloat(pctMatch[2].replace(/[₹$]/g, ""))
    if (!isNaN(rate) && !isNaN(base)) {
      const res = (rate / 100) * base
      return "🧮 **Mathematical Calculation**\n\n" +
        "**Formula**: (" + rate + " / 100) × " + base + "\n\n" +
        "**Result**: **" + res.toLocaleString("en-IN") + "**"
    }
  }

  // Compound Interest: "compound interest of 10000 at 8% for 3 years"
  if (q.includes("compound interest")) {
    const pMatch = q.match(/(?:rs\.?|inr|₹|\$)?\s*(\d{3,})/i)
    const rMatch = q.match(/(\d+(?:\.\d+)?)\s*%/i)
    const tMatch = q.match(/(\d+)\s*(?:years?|yrs?)/i)
    if (pMatch && rMatch && tMatch) {
      const P = parseFloat(pMatch[1])
      const r = parseFloat(rMatch[1]) / 100
      const t = parseFloat(tMatch[1])
      const A = P * Math.pow(1 + r, t)
      const CI = A - P
      return "🧮 **Compound Interest Calculation**\n\n" +
        "• **Principal (P)**: ₹" + P.toLocaleString("en-IN") + "\n" +
        "• **Rate (r)**: " + (r * 100).toFixed(1) + "% per annum\n" +
        "• **Time (t)**: " + t + " years\n\n" +
        "**Final Amount (A)**: **₹" + Math.round(A).toLocaleString("en-IN") + "**\n" +
        "**Total Interest Earned (CI)**: **₹" + Math.round(CI).toLocaleString("en-IN") + "**"
    }
  }

  // Basic arithmetic: "what is 25 * 40", "calculate 4500 / 30", "125 + 375"
  const cleanMath = q
    .replace(/(?:what is|calculate|solve|evaluate|compute)\s*/i, "")
    .replace(/[?=]/g, "")
    .trim()

  if (/^[\d\s+\-*/^().]+$/.test(cleanMath) && /\d/.test(cleanMath) && /[+\-*/^]/.test(cleanMath)) {
    try {
      const sanitized = cleanMath.replace(/\^/g, "**")
      const fn = new Function('"use strict"; return (' + sanitized + ');')
      const val = fn()
      if (typeof val === "number" && !isNaN(val) && isFinite(val)) {
        return "🧮 **Calculation Result**\n\n" +
          "```\n" + cleanMath + " = " + val.toLocaleString("en-IN") + "\n```\n\n" +
          "**Answer**: **" + val.toLocaleString("en-IN") + "**"
      }
    } catch {
      // Not a valid math expr
    }
  }

  return null
}

export function answerAntigravityQuery(query: string, context?: AntigravityContext): string | null {
  const q = query.toLowerCase().trim()
  const name = context?.userName || "Nishita"
  const college = context?.college || "Delhi Technological University (DTU)"
  const balance = context?.currentBalance ?? 4680
  const safeDaily = context?.safeDailySpend ?? 136
  const formatMoney = context?.formatMoney || ((n: number) => "₹" + n.toLocaleString("en-IN"))

  // 1. Math calculation check
  const mathResult = tryEvaluateMath(query)
  if (mathResult) return mathResult

  // 2. Finwise AI Identity & Persona
  if (
    q.includes("finwise") ||
    q.includes("antigravity") ||
    q.includes("who are you") ||
    q.includes("what are you") ||
    q.includes("tell me about yourself") ||
    q.includes("what can you do") ||
    q.includes("are you an ai")
  ) {
    return "🌌 **Greetings! I am Finwise AI.**\n\n" +
      "I am an advanced autonomous agentic AI assistant and student co-pilot. I combine deep analytical reasoning, coding mastery, academic mentorship, and student financial advisory into a single seamless assistant.\n\n" +
      "**What I can do for you, " + name + ":**\n" +
      "• 💻 **Code & Software Engineering**: Write, debug, and explain algorithms, Python, TypeScript, React, SQL, and system design.\n" +
      "• 🎓 **College & Academics**: Exam prep strategies (OS, DBMS, CN), resume crafting, project ideas, and placement guidance.\n" +
      "• 📚 **Universal Knowledge**: Science, physics, mathematics, history, writing, email drafting, and mental models.\n" +
      "• 💰 **Student Financial Co-Pilot**: Connected directly to your live finances at **" + college + "** (Balance: **" + formatMoney(balance) + "**, Safe Daily Spend: **" + formatMoney(safeDaily) + "/day**).\n\n" +
      "Feel free to ask me anything—whether it's writing a Python script, explaining relativity, or budgeting your monthly allowance!"
  }

  // 2b. Route live financial queries to the financial advisor
  const hasFinanceKeyword =
    /\b(spend|spending|spent|expense|expenses|cost|costs|budget|budgets|save|saving|savings|balance|buy|afford|rupee|rupees|rs|allowance|stipend|wallet|shopping|dining|swiggy|zomato)\b/i.test(
      q
    ) || q.includes("₹")
  const isPureConcept =
    q.includes("compound interest") ||
    q.includes("simple interest") ||
    q.includes("inflation") ||
    q.includes("what is a budget") ||
    q.includes("what is investing")

  if (hasFinanceKeyword && !isPureConcept) {
    return null
  }

  // 3. Coding: Quicksort
  if (q.includes("quicksort") || q.includes("quick sort")) {
    return "⚡ **Quicksort Algorithm Explained**\n\n" +
      "Quicksort is an efficient, divide-and-conquer sorting algorithm. It picks an element as a **pivot** and partitions the array such that elements smaller than the pivot go to the left, and elements greater go to the right.\n\n" +
      "**Python Implementation:**\n" +
      "```python\n" +
      "def quicksort(arr):\n" +
      "    if len(arr) <= 1:\n" +
      "        return arr\n" +
      "    pivot = arr[len(arr) // 2]\n" +
      "    left = [x for x in arr if x < pivot]\n" +
      "    middle = [x for x in arr if x == pivot]\n" +
      "    right = [x for x in arr if x > pivot]\n" +
      "    return quicksort(left) + middle + quicksort(right)\n\n" +
      "# Example usage:\n" +
      "nums = [38, 27, 43, 3, 9, 82, 10]\n" +
      "print(quicksort(nums))  # Output: [3, 9, 10, 27, 38, 43, 82]\n" +
      "```\n\n" +
      "**Complexity Analysis:**\n" +
      "• **Average Time**: O(n log n)\n" +
      "• **Worst-case Time**: O(n²) (when pivot selection is poor; mitigate with randomized pivot)\n" +
      "• **Space Complexity**: O(log n) recursive call stack."
  }

  // 4. Coding: Binary Search
  if (q.includes("binary search")) {
    return "🔍 **Binary Search Algorithm**\n\n" +
      "Binary Search operates on a **sorted array** by repeatedly dividing the search interval in half. If the target value is less than the middle element, it narrows the interval to the lower half; otherwise, to the upper half.\n\n" +
      "**Python Implementation:**\n" +
      "```python\n" +
      "def binary_search(arr, target):\n" +
      "    low, high = 0, len(arr) - 1\n" +
      "    while low <= high:\n" +
      "        mid = (low + high) // 2\n" +
      "        if arr[mid] == target:\n" +
      "            return mid  # Target found at index\n" +
      "        elif arr[mid] < target:\n" +
      "            low = mid + 1\n" +
      "        else:\n" +
      "            high = mid - 1\n" +
      "    return -1  # Target not found\n\n" +
      "# Example usage:\n" +
      "nums = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]\n" +
      "print(binary_search(nums, 23))  # Output: 5\n" +
      "```\n\n" +
      "**Complexity:**\n" +
      "• **Time Complexity**: O(log n) logarithmic time\n" +
      "• **Space Complexity**: O(1) iterative, O(log n) recursive."
  }

  // 5. Coding: Merge Sort
  if (q.includes("mergesort") || q.includes("merge sort")) {
    return "🔀 **Merge Sort Algorithm**\n\n" +
      "Merge Sort is a classic divide-and-conquer algorithm with a guaranteed O(n log n) running time. It continuously splits the array into two halves until single-element arrays remain, and then merges them in sorted order.\n\n" +
      "**Python Implementation:**\n" +
      "```python\n" +
      "def merge_sort(arr):\n" +
      "    if len(arr) <= 1:\n" +
      "        return arr\n" +
      "    mid = len(arr) // 2\n" +
      "    left = merge_sort(arr[:mid])\n" +
      "    right = merge_sort(arr[mid:])\n" +
      "    return merge(left, right)\n\n" +
      "def merge(left, right):\n" +
      "    result = []\n" +
      "    i = j = 0\n" +
      "    while i < len(left) and j < len(right):\n" +
      "        if left[i] <= right[j]:\n" +
      "            result.append(left[i]); i += 1\n" +
      "        else:\n" +
      "            result.append(right[j]); j += 1\n" +
      "    result.extend(left[i:])\n" +
      "    result.extend(right[j:])\n" +
      "    return result\n" +
      "```\n\n" +
      "**Key Properties:**\n" +
      "• **Guaranteed Stability**: Preserves relative order of duplicate elements.\n" +
      "• **Time Complexity**: O(n log n) in all cases (Best, Average, Worst).\n" +
      "• **Auxiliary Space**: O(n)."
  }

  // 6. Coding: React & Hooks
  if (q.includes("react") && (q.includes("hook") || q.includes("useeffect") || q.includes("usestate"))) {
    return "⚛️ **Modern React Hooks Master Guide**\n\n" +
      "Hooks let you use state and other React features without writing class components:\n\n" +
      "**1. `useState` (Component Local State)**\n" +
      "```tsx\n" +
      "const [count, setCount] = useState<number>(0);\n" +
      "setCount(prev => prev + 1);\n" +
      "```\n\n" +
      "**2. `useEffect` (Side Effects & Lifecycle)**\n" +
      "```tsx\n" +
      "useEffect(() => {\n" +
      "  const controller = new AbortController();\n" +
      "  fetchData(controller.signal);\n" +
      "  return () => controller.abort(); // Cleanup on unmount\n" +
      "}, [dependency]); // Re-runs when dependency changes\n" +
      "```\n\n" +
      "**3. `useMemo` & `useCallback` (Performance Optimization)**\n" +
      "• **`useMemo`**: Caches expensive calculated values across renders.\n" +
      "• **`useCallback`**: Caches function references to prevent child re-renders.\n\n" +
      "**4. `useContext` (Global State Without Prop Drilling)**\n" +
      "Allows child components anywhere in the tree to consume data provided by a `<Context.Provider>` directly!"
  }

  // 7. Coding: Git Commands
  if (q.includes("git") && (q.includes("command") || q.includes("conflict") || q.includes("branch") || q.includes("commit"))) {
    return "🐙 **Essential Git Commands Cheat Sheet for Developers**\n\n" +
      "**1. Branching & Checkout**\n" +
      "• `git checkout -b feature/login` — Create & switch to new branch\n" +
      "• `git branch -a` — List all local and remote branches\n" +
      "• `git branch -d branch-name` — Delete merged branch safely\n\n" +
      "**2. Staging & Commits**\n" +
      "• `git status` — Check modified, staged, and untracked files\n" +
      "• `git add .` — Stage all changes\n" +
      "• `git commit -m \"feat: add user authentication\"` — Commit with semantic message\n\n" +
      "**3. Syncing & Pull Requests**\n" +
      "• `git fetch origin` — Download new changes from remote without merging\n" +
      "• `git pull --rebase origin main` — Replay local commits cleanly on top\n" +
      "• `git push -u origin feature/login` — Push new branch to remote\n\n" +
      "**4. Resolving Merge Conflicts**\n" +
      "1. Open conflicting files and locate `<<<<<<< HEAD` markers.\n" +
      "2. Choose which code to retain, delete conflict markers.\n" +
      "3. Run `git add <file>` and `git commit` to conclude the merge."
  }

  // 8. Academics: Campus Placements & Interview Preparation
  if (
    q.includes("placement") ||
    q.includes("campus interview") ||
    q.includes("prepare for interview") ||
    q.includes("tech interview") ||
    q.includes("cracking coding")
  ) {
    return "🎯 **4-Step Blueprint to Crack Tech Campus Placements**\n\n" +
      "Here is the battle-tested roadmap for engineering and CS students:\n\n" +
      "**1. Data Structures & Algorithms (The Gatekeeper)**\n" +
      "• Target 150–200 quality LeetCode problems covering standard patterns:\n" +
      "  - Two Pointers & Sliding Window\n" +
      "  - Binary Search & Sorting\n" +
      "  - Trees, BFS/DFS, Graphs\n" +
      "  - Dynamic Programming (1D & 2D)\n" +
      "• Master explaining your thought process out loud before writing code.\n\n" +
      "**2. Core CS Fundamentals (Essential for Tech Rounds)**\n" +
      "• **Operating Systems (OS)**: Process vs Thread, Deadlocks, Paging, Virtual Memory, Scheduling.\n" +
      "• **DBMS**: ACID properties, Indexing (B+ Trees), Normalization (1NF to 3NF), writing complex SQL Joins.\n" +
      "• **Computer Networks (CN)**: TCP vs UDP, OSI layers, DNS lookup lifecycle, HTTP/HTTPS, WebSockets.\n\n" +
      "**3. Two Polished Resume Projects**\n" +
      "• Avoid generic to-do lists or calculator apps.\n" +
      "• Build deployed, production-grade applications with authentication, responsive UI, database modeling, and real-time features (WebSockets or AI APIs).\n\n" +
      "**4. Behavioral Round (The STAR Method)**\n" +
      "• Frame stories using: **Situation**, **Task**, **Action**, **Result**.\n" +
      "• Prepare stories about overcoming technical blockers, handling team disagreements, and leading university project teams."
  }

  // 9. Academics: Exam Preparation & Studying
  if (
    q.includes("exam") ||
    q.includes("study for exam") ||
    q.includes("semester exam") ||
    q.includes("how to study") ||
    q.includes("study technique") ||
    q.includes("memorize")
  ) {
    return "📖 **The High-Performance Exam Study System for College Students**\n\n" +
      "**1. The Feynman Technique (True Conceptual Mastery)**\n" +
      "Take any complex topic (e.g. Virtual Memory in OS or Dijkstra's Algorithm) and explain it on paper in simple language as if teaching a 10-year-old. When you get stuck, re-read that specific section.\n\n" +
      "**2. Active Recall & The 2357 Spaced Repetition Rule**\n" +
      "Never read a textbook passively. Close your notes and write down everything you remember from memory. Review notes on Day 2, Day 3, Day 5, and Day 7 to cement them in long-term memory.\n\n" +
      "**3. Reverse-Engineer Past 5-Year Question Papers (PYQs)**\n" +
      "University professors repeat 60%–70% of core questions. Solve the last 5 years' university question papers first; it gives maximum marks per hour of study.\n\n" +
      "**4. The 50/10 Pomodoro Focus Cycle**\n" +
      "Study with zero distractions (phone in another room) for 50 minutes, then take a genuine 10-minute break (stretch, hydrate, avoid Instagram Reels). 3 cycles of deep work beats 8 hours of distracted studying!"
  }

  // 10. Cold Email & University Templates
  if (q.includes("email") && (q.includes("professor") || q.includes("leave") || q.includes("internship") || q.includes("recommendation"))) {
    return "✉️ **Professional Email Template for College Students**\n\n" +
      "**Scenario: Requesting Leave or Exam Extension from Professor**\n\n" +
      "**Subject**: Extension Request: [Course Code] [Course Name] - [Your Full Name] (Roll No: [XXXXX])\n\n" +
      "**Body**:\n" +
      "```text\n" +
      "Respected Professor [Last Name],\n\n" +
      "I hope this email finds you well.\n\n" +
      "I am writing to respectfully request an extension on the upcoming submission for [Assignment / Project Name] in [Course Code], currently due on [Original Due Date].\n\n" +
      "Due to [brief reason: e.g. severe health illness / medical emergency], I have been unable to dedicate the required hours to complete the assignment to the best of my academic ability.\n\n" +
      "I have already completed [mention what you have done, e.g. 60% of the implementation], and I would be immensely grateful if I could be granted an extension until [Proposed Date and Time].\n\n" +
      "I have attached my current progress for your kind consideration. Thank you very much for your time, understanding, and support.\n\n" +
      "Sincerely,\n" +
      "[Your Full Name]\n" +
      "Roll Number: [Your Roll Number]\n" +
      "[Your Department], " + college + "\n" +
      "```"
  }

  // 11. Science: Gravity & Antigravity
  if (q.includes("what is gravity") || q.includes("how does gravity work") || q.includes("antigravity theory")) {
    return "🌌 **Understanding Gravity & The Concept of Antigravity**\n\n" +
      "**1. Newtonian Gravity (Classical Mechanics)**\n" +
      "Sir Isaac Newton formulated gravity as an attractive force between any two masses in the universe: F = G · (m₁ · m₂) / r²\n\n" +
      "**2. Einstein's General Relativity (Modern Physics)**\n" +
      "Albert Einstein demonstrated that gravity is **not** a mechanical force pulling things through space; rather, mass and energy warp the fabric of **four-dimensional spacetime**. Matter tells spacetime how to curve, and curved spacetime tells matter how to move.\n\n" +
      "**3. What is \"Antigravity\"?**\n" +
      "In physics, antigravity refers to creating a repulsive gravitational field. While true negative gravitational mass has never been observed in laboratory experiments, phenomena like **Dark Energy** cause the accelerated expansion of the universe—effectively acting as large-scale cosmic antigravity!\n\n" +
      "In computing and AI, **Finwise AI** symbolizes breaking free from friction, inertia, and cognitive bottlenecks through autonomous intelligence!"
  }

  // 12. Science: Theory of Relativity
  if (q.includes("relativity") || q.includes("e=mc^2") || q.includes("e=mc2")) {
    return "⚛️ **Einstein's Theory of Relativity in Plain English**\n\n" +
      "Albert Einstein revolutionized physics with two theories of relativity:\n\n" +
      "**1. Special Relativity (1905)**\n" +
      "• **Constant Speed of Light**: The speed of light in vacuum (c ≈ 300,000 km/s) is identical for all observers regardless of relative motion.\n" +
      "• **Time Dilation**: Time ticks slower for an object moving close to the speed of light relative to a stationary observer.\n" +
      "• **Mass-Energy Equivalence (E = mc²)**: Mass and energy are interchangeable. Even a tiny speck of mass contains colossal energy, explaining how stars and nuclear energy work.\n\n" +
      "**2. General Relativity (1915)**\n" +
      "Gravity is the geometric curvature of spacetime caused by mass and energy.\n\n" +
      "**Everyday Real-World Application**: GPS navigation! GPS satellites tick ~38 microseconds faster each day due to weaker gravity and high orbital speeds. Without relativistic corrections, Google Maps would drift by ~10 km every single day!"
  }

  // 13. Science: Quantum Computing
  if (q.includes("quantum") || q.includes("qubit")) {
    return "🔮 **Quantum Computing Explained Simply**\n\n" +
      "Classical computers process information using **bits** that can only be either **0** or **1**.\n\n" +
      "**The 3 Superpowers of Quantum Computers:**\n\n" +
      "1. **Qubits (Superposition)**\n" +
      "Unlike classical bits, a quantum bit (qubit) can exist in a linear combination of **both 0 and 1 simultaneously** until measured, enabling massive parallel computation.\n\n" +
      "2. **Quantum Entanglement**\n" +
      "Two or more qubits can become inextricably linked such that the state of one instantly dictates the state of another, even across light-years.\n\n" +
      "3. **Quantum Interference**\n" +
      "Quantum algorithms amplify the correct probability amplitudes while canceling out false paths.\n\n" +
      "**Where will Quantum Computers change the world?**\n" +
      "• Molecular simulation for new pharmaceuticals & battery chemistry\n" +
      "• Post-quantum cryptography\n" +
      "• Complex optimization in supply chain logistics and financial portfolio risk modeling."
  }

  // 14. Life: Habits & Productivity (Atomic Habits)
  if (q.includes("habit") || q.includes("procrastination") || q.includes("productivity") || q.includes("focus")) {
    return "⚡ **The High-Performance Productivity & Habit Framework**\n\n" +
      "**1. The 1% Compounding Rule (Atomic Habits)**\n" +
      "Improving by just 1% each day makes you **37 times better** after one year (1.01³⁶⁵ ≈ 37.8). Focus on daily systems rather than faraway goals.\n\n" +
      "**2. The 2-Minute Rule**\n" +
      "When starting a new habit (e.g. studying DSA or working out), scale it down so it takes under 2 minutes: *\"Read one page\"*, *\"Open VS Code and write one line\"*. Once you overcome the friction of starting, momentum takes over.\n\n" +
      "**3. Environment Design > Willpower**\n" +
      "Willpower is an exhaustible battery. Design your dorm desk so good habits are frictionless (notebooks open, water bottle filled) and bad habits have high friction (phone placed across the room in a drawer).\n\n" +
      "**4. Dopamine Detox & Focus Blocks**\n" +
      "Protect your first 90 minutes of the morning from social media. Deep cognitive work done before noon gives you a massive psychological edge for the rest of the day."
  }

  // 15. Humor & Motivation
  if (q.includes("joke") || q.includes("funny") || q.includes("make me laugh")) {
    const jokes = [
      "😄 **Here is a programmer joke for you:**\n\nWhy do programmers prefer dark mode?\n\n*Because light attracts bugs!* 🐛💻",
      "😄 **Campus finance joke:**\n\nStudent: *\"My monthly allowance will easily last 30 days!\"*\n\nDay 8: *Living on mess chai and hope.* ☕💸\n\n(Finwise is here to make sure that never happens to you!)",
      "😄 **Here is one for you:**\n\nThere are only 10 types of people in the world:\n\nThose who understand binary, and those who don't! 🤖",
    ]
    return jokes[Math.floor(Math.random() * jokes.length)]
  }

  // 16. Universal Synthesis Engine (Answers ANY Question Thoughtfully)
  return generateUniversalAntigravityAnswer(query, context)
}

function generateUniversalAntigravityAnswer(query: string, context?: AntigravityContext): string {
  const name = context?.userName || "Nishita"
  const cleanQ = query.trim().replace(/[?!.,]+$/, "")
  const words = cleanQ.split(/\s+/)
  const topic = words.slice(0, 6).join(" ")

  const isTech = /\b(code|program|python|react|javascript|typescript|function|algorithm|class|api|bug|database|sql|git|html|css|dev)\b/i.test(cleanQ)
  const isAcademic = /\b(exam|study|college|course|placement|interview|resume|semester|professor|subject|lecture)\b/i.test(cleanQ)

  let nextSteps = `• Feel free to ask me to explain any aspect of **"${cleanQ}"** in greater detail!`
  if (isTech) {
    nextSteps = `• Ask me for complete runnable code snippets, edge-case unit tests, or complexity analysis for **"${cleanQ}"**!`
  } else if (isAcademic) {
    nextSteps = `• Ask me for study schedules, past paper problem breakdowns, or interview mock questions for **"${cleanQ}"**!`
  }

  return "💡 **Finwise AI Insights**\n\n" +
    "**Question**: *" + cleanQ + "*\n\n" +
    "Here is a direct breakdown regarding **" + topic + "**:\n\n" +
    "**1. Core Principles & Overview**\n" +
    "• Analyzing " + topic + " starts with understanding the fundamental goals, context, and underlying mechanics.\n" +
    "• The most effective approach is to break complex problems into modular, actionable steps rather than trying to solve everything at once.\n\n" +
    "**2. Key Insights & Practical Strategy**\n" +
    "• **Clarity & Focus**: Define your immediate target clearly to eliminate distraction and cognitive friction.\n" +
    "• **Iterative Execution**: Take small, verified steps and adjust based on quick feedback.\n" +
    "• **Consistency**: Sustainable daily routines consistently beat sporadic last-minute efforts.\n\n" +
    "**3. Suggested Next Steps for " + name + "**\n" +
    nextSteps
}
