# Block-Based Fullstack Learning Playground

A visual, hands-on learning environment where developers **plan software architecture with blocks, implement real code inside those blocks, and see their application come to life**.

Instead of asking learners to understand architecture and write an entire application at the same time, this project separates the process into two clear steps:

**Plan → Implement → Test → Assemble**

## 🚀 What is it?

The playground combines a **visual node-based editor** with a **real code editor**.

Users can:

* 🧩 Drag and arrange blocks on a visual canvas
* 🔗 Connect blocks to represent data flow and architecture
* 💻 Click into a block and write its actual logic
* 🧪 Run and test individual blocks instantly
* ✅ Receive immediate feedback on their implementation
* 🟢 See completed blocks change state visually
* ⚡ Assemble implemented blocks into a working application

Each block has a defined **contract** describing its inputs, outputs, props and expected behaviour. This contract becomes the foundation for code completion, validation, testing and architectural feedback.

## 🎯 Core Concept

Traditional coding exercises often look like:

> "Build this entire application."

This makes it difficult to understand whether someone struggles with **architecture, control flow, or implementation**.

This project breaks the problem down:

```text
Visual Architecture
        ↓
     Blocks
        ↓
    Contracts
        ↓
  Scoped Coding
        ↓
   Block Testing
        ↓
   Application
```

The learner can therefore focus on one concept at a time while still working towards a real application.

## 🧩 Example

A simple frontend challenge might look like:

```text
[Input] ───→ [Conditional] ───→ [Text]
                  ↑
               [State]
```

Clicking the `Conditional` block opens a scoped editor:

```ts
function checkValue(value: number): boolean {
  // Implement the condition
}
```

The learner only needs to solve that specific piece of logic.

Once the implementation passes its tests, the block becomes **completed** on the canvas and can participate in the assembled application.

## 📜 Block Contracts

Contracts are the foundation of the system.

A simplified block contract might look like:

```ts
interface BlockContract {
  type: string
  inputs: Record<string, unknown>
  outputs: Record<string, unknown>
  code: string
  tests: TestCase[]
}
```

Contracts allow the platform to:

* Generate scoped code stubs
* Validate block implementations
* Run isolated tests
* Understand connections between blocks
* Detect architectural problems
* Provide meaningful hints
* Reuse the same engine across frontend and backend learning

The schema is intentionally designed to support both:

```text
Frontend Blocks
       +
Backend Blocks
       ↓
Fullstack Blocks
```

## 🛠️ Tech Stack

### Frontend

* **React**
* **TypeScript**
* **React Flow (`@xyflow/react`)**
* **Monaco Editor**
* **Sandpack**
* **Zustand**
* **Tailwind CSS**

### Backend & Infrastructure

* **Node.js**
* **tRPC / NestJS**
* **PostgreSQL**
* **Supabase / Neon**
* **Clerk / Auth.js**
* **Vercel**
* **Railway / Render**

### Future Code Execution

For backend execution and more advanced challenges:

* Judge0
* E2B
* CodeSandbox SDK
* BullMQ
* Redis

## 🗺️ Roadmap

### v1 — Frontend Build

Focus on building frontend applications using visual blocks.

Initial blocks:

* Button
* Input
* Text / Display
* Conditional
* Loop
* State

The goal is to validate the complete learning loop:

**Canvas → Code → Test → Preview**

### v2 — Find & Fix Bugs

Learners receive an already-built application containing intentional flaws.

Examples:

* Incorrect state updates
* Stale closures
* Broken conditionals
* Prop-drilling problems
* Off-by-one loops
* Incorrect component logic

The learner must inspect the architecture, identify the problem and fix the relevant block.

### v3 — Backend Build

Introduce backend concepts:

* API endpoints
* Database models
* Queries
* Authentication
* Server-side logic
* Validation

This phase introduces sandboxed server-side code execution.

### v4 — Backend Bug Hunting

Learners diagnose realistic backend problems such as:

* Broken authentication
* Race conditions
* Incorrect queries
* Validation flaws
* Data consistency issues

### v5 — Fullstack

Frontend and backend blocks become connected.

For example:

```text
[Form]
   ↓
[API Endpoint]
   ↓
[Database]
   ↓
[API Response]
   ↓
[UI State]
   ↓
[Component]
```

The same block and contract architecture allows this to be built as an extension of the earlier versions rather than a complete rebuild.

## 🎓 Learning Tracks

The platform is designed to progressively move from fundamentals to real-world engineering.

Possible tracks include:

* Component Basics
* Conditionals
* Loops
* State Management
* Forms
* API Integration
* Data Flow
* Backend Architecture
* Authentication
* Database Design
* Debugging
* Fullstack Architecture

Challenges can progress from:

**Guided → Semi-guided → Independent → Real-world**

## 🧪 Testing & Feedback

Every block can be tested independently.

Instead of displaying a large application error, the platform can show:

```text
❌ Conditional block

Expected:
true

Received:
false

💡 Hint:
Check whether the value is being compared
correctly before returning the result.
```

This keeps errors scoped and approachable, especially for beginners.

## 🔮 Future: Hiring & Assessments

The same engine can eventually become an engineering assessment platform.

Potential features include:

* Timed coding challenges
* Architecture challenges
* Bug-fixing assessments
* Automated contract testing
* Rubric-based scoring
* Candidate comparison
* Solution replay / timeline
* Architecture quality analysis

This creates a bridge between **learning, practising and hiring** without requiring a separate assessment engine.

## 💡 Why This Approach?

Most coding platforms focus primarily on:

> **"Can you write the code?"**

This project also asks:

> **"Can you design the system before writing the code?"**

That distinction matters in real software engineering.

By making architecture visible and implementation local to individual blocks, the platform aims to teach developers not just how to write code, but **how to think about software structure**.

## 📌 Project Status

**Early-stage / MVP**

The current priority is to validate the fundamental interaction:

```text
Drag a block
      ↓
Connect blocks
      ↓
Click a block
      ↓
Write code
      ↓
Run tests
      ↓
See feedback
      ↓
Build a working app
```

The first milestone is a single fully playable frontend challenge before expanding the block library and content catalogue.

## 📄 Licence

This project is currently under development. Licensing details will be added when the project is ready for public release.
