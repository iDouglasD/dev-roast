import "dotenv/config";
import { faker } from "@faker-js/faker";
import { drizzle } from "drizzle-orm/node-postgres";
import { roastDiffLines, roastIssues, roasts } from "./schema";

const db = drizzle(process.env.DATABASE_URL!, { casing: "snake_case" });

// ── Helpers ────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], min: number, max: number): T[] {
  const count = faker.number.int({ min, max });
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

type Verdict =
  | "needs_serious_help"
  | "try_harder"
  | "not_terrible"
  | "almost_decent"
  | "mass_respect";
type Severity = "critical" | "warning" | "good";
type Language =
  | "javascript"
  | "typescript"
  | "python"
  | "java"
  | "csharp"
  | "go"
  | "rust"
  | "ruby"
  | "php"
  | "sql"
  | "html"
  | "css"
  | "other";

function scoreToVerdict(score: number): Verdict {
  if (score <= 3.0) return "needs_serious_help";
  if (score <= 5.0) return "try_harder";
  if (score <= 7.0) return "not_terrible";
  if (score <= 8.5) return "almost_decent";
  return "mass_respect";
}

// ── Code Snippets ──────────────────────────────────────

const codeSnippets: Record<string, string[]> = {
  javascript: [
    `function auth(u, p) {\n  if (u == "admin" && p == "123") {\n    return true;\n  }\n  return false;\n}`,
    `var total = 0;\nfor (var i = 0; i < items.length; i++) {\n  total = total + items[i].price;\n}\nreturn total;`,
    `function fetchData() {\n  var xhr = new XMLHttpRequest();\n  xhr.open("GET", "/api/data", false);\n  xhr.send();\n  return JSON.parse(xhr.responseText);\n}`,
    `document.getElementById("btn").onclick = function() {\n  eval(document.getElementById("input").value);\n}`,
    `function sleep(ms) {\n  var start = new Date().getTime();\n  while (new Date().getTime() < start + ms);\n}`,
    `var x = new Array();\nfor (var i = 0; i < 1000; i++) {\n  x.push(i);\n  if (x.length > 500) {\n    x = x.slice(100);\n  }\n}`,
    `function validateEmail(email) {\n  if (email.indexOf("@") > -1) {\n    return true;\n  }\n  return false;\n}`,
    `function deepClone(obj) {\n  return JSON.parse(JSON.stringify(obj));\n}`,
  ],
  typescript: [
    `function getUser(id: any): any {\n  const user: any = db.query("SELECT * FROM users WHERE id = " + id);\n  return user;\n}`,
    `const handler = (req: any, res: any) => {\n  const data = req.body as any;\n  // @ts-ignore\n  db.save(data);\n  res.send("ok");\n}`,
    `export const config: any = {\n  apiKey: "sk-1234567890abcdef",\n  secret: "super_secret_key_123",\n  debug: true,\n}`,
    `function processItems(items: any[]) {\n  let result: any = [];\n  items.forEach((item: any) => {\n    result.push(item.value as any);\n  });\n  return result as any;\n}`,
  ],
  python: [
    `def auth(username, password):\n    if username == "admin" and password == "password123":\n        return True\n    return False`,
    `eval(input("Enter code: "))\nprint("seems safe")`,
    `import pickle\ndata = pickle.loads(user_input)`,
    `def fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n-1) + fibonacci(n-2)`,
    `passwords = []\ndef store_password(pw):\n    passwords.append(pw)\n    with open("passwords.txt", "a") as f:\n        f.write(pw + "\\n")`,
    `from time import sleep\ndef retry(func):\n    while True:\n        try:\n            return func()\n        except:\n            sleep(1)`,
  ],
  sql: [
    `SELECT * FROM users\nWHERE id = '\${userId}'`,
    `DELETE FROM orders WHERE 1=1;\nDROP TABLE users;--`,
    `SELECT *\nFROM users u, orders o, products p\nWHERE u.id = o.user_id\nAND o.product_id = p.id`,
    `UPDATE accounts\nSET balance = balance - 100\nWHERE user_id = 1;\n-- forgot to add to other account lol`,
  ],
  java: [
    `public class UserService {\n  public User getUser(String id) {\n    String sql = "SELECT * FROM users WHERE id = '" + id + "'";\n    return db.execute(sql);\n  }\n}`,
    `public void processFile(String path) {\n  try {\n    FileReader fr = new FileReader(path);\n    // do stuff\n  } catch (Exception e) {\n    // swallow exception\n  }\n}`,
    `public static ArrayList list = new ArrayList();\npublic static void add(Object item) {\n  list.add(item);\n}`,
  ],
  go: [
    `func handler(w http.ResponseWriter, r *http.Request) {\n\tbody, _ := ioutil.ReadAll(r.Body)\n\tvar data map[string]interface{}\n\tjson.Unmarshal(body, &data)\n\tfmt.Fprintf(w, "ok")\n}`,
    `func divide(a, b int) int {\n\treturn a / b // what could go wrong?\n}`,
    `func fetchAll() []Item {\n\titems := []Item{}\n\tfor {\n\t\titem, err := getNext()\n\t\tif err != nil {\n\t\t\tbreak\n\t\t}\n\t\titems = append(items, item)\n\t}\n\treturn items\n}`,
  ],
  php: [
    `<?php\n$user = $_GET['user'];\n$pass = $_GET['pass'];\n$sql = "SELECT * FROM users WHERE user='$user' AND pass='$pass'";\n$result = mysql_query($sql);`,
    `<?php\nfunction upload($file) {\n  move_uploaded_file($file['tmp_name'], '/uploads/' . $file['name']);\n  echo "uploaded!";\n}`,
  ],
  rust: [
    `fn main() {\n    let data: Vec<i32> = vec![1, 2, 3];\n    unsafe {\n        let ptr = data.as_ptr();\n        println!("{}", *ptr.offset(100));\n    }\n}`,
    `fn parse_input(input: &str) -> i32 {\n    input.parse().unwrap()\n}`,
  ],
  ruby: [
    `def execute(cmd)\n  system(cmd)\nend\n\nexecute(params[:command])`,
    `class User\n  def initialize(name)\n    @@users ||= []\n    @@users << self\n    @name = name\n  end\nend`,
  ],
  html: [
    `<form action="/login" method="GET">\n  <input type="text" name="user">\n  <input type="text" name="password">\n  <button>Login</button>\n</form>`,
    `<marquee><blink>\n  <font size="7" color="red">\n    WELCOME TO MY WEBSITE\n  </font>\n</blink></marquee>`,
  ],
  css: [
    `* {\n  !important;\n}\nbody {\n  font-size: 1px !important;\n}\n.container {\n  width: 99999px;\n  position: fixed;\n  z-index: 99999;\n}`,
    `.btn {\n  margin-left: -9999px;\n  padding: 100px 200px 50px 300px;\n  font-size: 72px;\n  background: red;\n  color: red;\n}`,
  ],
};

// ── Roast Comments ─────────────────────────────────────

const roastComments = [
  "this code looks like it was written during a power outage... in 2005.",
  "I've seen better code written by a cat walking across a keyboard.",
  "this is what happens when Stack Overflow is down.",
  "congratulations, you've invented a new category of technical debt.",
  "this code doesn't just have bugs, it IS the bug.",
  "I showed this to a junior developer and they cried.",
  "the only design pattern here is 'chaos'.",
  "this code is so bad it made my linter file a restraining order.",
  "were you trying to write code or a horror novel?",
  "I've seen spaghetti with better structure than this.",
  "this makes me want to mass-delete my node_modules... and my career.",
  "if code reviews were court trials, this would be a felony.",
  "did you write this with your eyes closed? because that would actually explain a lot.",
  "this code has more red flags than a communist parade.",
  "the person who wrote this owes an apology to every CPU that ran it.",
  "I wouldn't push this to a branch. I wouldn't even push this to a twig.",
  "somewhere, a computer science professor just felt a disturbance in the force.",
  "this code runs on pure luck and a prayer.",
  "you didn't just reinvent the wheel — you made it square.",
  "this is the kind of code that makes open source contributors quit.",
  "I asked ChatGPT to explain this and it responded with 'I'm sorry'.",
  "even COBOL developers are looking at this with concern.",
  "this code has more vulnerabilities than a screen door on a submarine.",
  "the runtime errors here have runtime errors.",
  "if this code was a building, it would fail every inspection known to mankind.",
  "actually decent code. I had my insult ready and everything. well played.",
  "not bad at all — you clearly know what you're doing. boring, but correct.",
  "clean, readable, and well-structured. are you sure you're a developer?",
  "this is mass-respect-worthy code. I'm genuinely impressed.",
  "okay, this is actually good. I hate it when that happens.",
];

// ── Issue Templates ────────────────────────────────────

const issueTemplates: {
  severity: Severity;
  title: string;
  description: string;
}[] = [
  {
    severity: "critical",
    title: "SQL injection vulnerability",
    description:
      "string concatenation in SQL queries allows attackers to inject arbitrary SQL. use parameterized queries or an ORM instead.",
  },
  {
    severity: "critical",
    title: "hardcoded credentials",
    description:
      "API keys and passwords should never be committed to source code. use environment variables or a secrets manager.",
  },
  {
    severity: "critical",
    title: "eval() usage",
    description:
      "eval() executes arbitrary code and is a massive security hole. there is almost never a legitimate reason to use it.",
  },
  {
    severity: "critical",
    title: "no input validation",
    description:
      "user input is used directly without any sanitization or validation. this is a security incident waiting to happen.",
  },
  {
    severity: "critical",
    title: "synchronous blocking operation",
    description:
      "blocking the event loop or main thread with synchronous operations destroys performance and user experience.",
  },
  {
    severity: "critical",
    title: "unsafe deserialization",
    description:
      "deserializing untrusted data can lead to remote code execution. always validate and sanitize before deserializing.",
  },
  {
    severity: "warning",
    title: "using var instead of const/let",
    description:
      "var is function-scoped and leads to hoisting bugs. use const by default, let when reassignment is needed.",
  },
  {
    severity: "warning",
    title: "imperative loop pattern",
    description:
      "for loops are verbose and error-prone. use .reduce(), .map(), or .filter() for cleaner, functional transformations.",
  },
  {
    severity: "warning",
    title: "empty catch block",
    description:
      "swallowing exceptions silently hides bugs and makes debugging nearly impossible. at minimum, log the error.",
  },
  {
    severity: "warning",
    title: "no error handling",
    description:
      "functions that can fail should handle errors gracefully. uncaught exceptions crash the application and confuse users.",
  },
  {
    severity: "warning",
    title: "global mutable state",
    description:
      "global variables create hidden dependencies between functions and make testing and reasoning about code much harder.",
  },
  {
    severity: "warning",
    title: "magic numbers",
    description:
      "unexplained numeric literals make code hard to understand. extract them into named constants with meaningful names.",
  },
  {
    severity: "warning",
    title: "deeply nested callbacks",
    description:
      "callback hell makes code unreadable. refactor to async/await or break into smaller named functions.",
  },
  {
    severity: "warning",
    title: "missing type safety",
    description:
      "using 'any' everywhere defeats the purpose of TypeScript. define proper interfaces and types for your data.",
  },
  {
    severity: "warning",
    title: "no resource cleanup",
    description:
      "opened files, connections, and streams should be properly closed. use try/finally or context managers.",
  },
  {
    severity: "good",
    title: "clear naming conventions",
    description:
      "variable and function names are descriptive and self-documenting, communicating intent without needing comments.",
  },
  {
    severity: "good",
    title: "single responsibility",
    description:
      "the function does one thing well — no side effects, no mixed concerns, no hidden complexity.",
  },
  {
    severity: "good",
    title: "proper error handling",
    description:
      "errors are caught, logged, and handled gracefully. the happy path and error path are both well-defined.",
  },
  {
    severity: "good",
    title: "immutable data patterns",
    description:
      "data is treated as immutable, reducing bugs caused by unexpected mutations and making the code more predictable.",
  },
  {
    severity: "good",
    title: "consistent code style",
    description:
      "the code follows a consistent formatting and naming convention throughout, making it easy to read and maintain.",
  },
  {
    severity: "good",
    title: "well-structured logic",
    description:
      "control flow is straightforward with minimal nesting. early returns and guard clauses keep the code flat and readable.",
  },
];

// ── Diff Templates ─────────────────────────────────────

const diffTemplates: { removed: string[]; added: string[] }[] = [
  {
    removed: [
      "  var total = 0;",
      "  for (var i = 0; i < items.length; i++) {",
      "    total = total + items[i].price;",
      "  }",
    ],
    added: [
      "  const total = items.reduce((sum, item) => sum + item.price, 0);",
    ],
  },
  {
    removed: [
      '  if (user == "admin" && pass == "123") {',
      "    return true;",
      "  }",
    ],
    added: [
      "  const hashedPass = await bcrypt.hash(pass, 10);",
      "  const user = await db.findUser(username);",
      "  return bcrypt.compare(pass, user.passwordHash);",
    ],
  },
  {
    removed: ["  eval(userInput);"],
    added: [
      "  const sanitized = sanitize(userInput);",
      "  const result = safeEvaluate(sanitized);",
    ],
  },
  {
    removed: [
      "  var xhr = new XMLHttpRequest();",
      '  xhr.open("GET", url, false);',
      "  xhr.send();",
    ],
    added: [
      "  const response = await fetch(url);",
      "  const data = await response.json();",
    ],
  },
  {
    removed: ["  } catch (e) {", "    // swallow exception", "  }"],
    added: [
      "  } catch (error) {",
      "    logger.error('Operation failed:', { error, context });",
      "    throw new AppError('Operation failed', { cause: error });",
      "  }",
    ],
  },
  {
    removed: ['  const sql = "SELECT * FROM users WHERE id = \'" + id + "\'";'],
    added: [
      "  const sql = 'SELECT * FROM users WHERE id = $1';",
      "  const result = await db.query(sql, [id]);",
    ],
  },
  {
    removed: [
      "  let result: any = [];",
      "  items.forEach((item: any) => {",
      "    result.push(item.value as any);",
      "  });",
    ],
    added: ["  const result: number[] = items.map((item) => item.value);"],
  },
  {
    removed: [
      "  passwords.append(pw)",
      '  with open("passwords.txt", "a") as f:',
      '      f.write(pw + "\\n")',
    ],
    added: [
      "  hashed = bcrypt.hashpw(pw.encode(), bcrypt.gensalt())",
      "  db.store_credential(user_id, hashed)",
    ],
  },
  {
    removed: [
      "  function sleep(ms) {",
      "    var start = new Date().getTime();",
      "    while (new Date().getTime() < start + ms);",
      "  }",
    ],
    added: [
      "  function sleep(ms: number): Promise<void> {",
      "    return new Promise((resolve) => setTimeout(resolve, ms));",
      "  }",
    ],
  },
  {
    removed: [
      "  document.getElementById('btn').onclick = function() {",
      "    // inline handler",
      "  }",
    ],
    added: [
      "  const button = document.querySelector<HTMLButtonElement>('#btn');",
      "  button?.addEventListener('click', handleClick);",
    ],
  },
];

// ── Seed Logic ─────────────────────────────────────────

const LANGUAGES: Language[] = [
  "javascript",
  "typescript",
  "python",
  "java",
  "csharp",
  "go",
  "rust",
  "ruby",
  "php",
  "sql",
  "html",
  "css",
];

function getCodeForLanguage(lang: Language): string {
  const snippets = codeSnippets[lang];
  if (snippets && snippets.length > 0) return pick(snippets);
  // Fallback for languages without dedicated snippets (csharp, other)
  return pick(codeSnippets.javascript);
}

function getIssuesForScore(
  score: number,
): { severity: Severity; title: string; description: string }[] {
  const critical = issueTemplates.filter((t) => t.severity === "critical");
  const warning = issueTemplates.filter((t) => t.severity === "warning");
  const good = issueTemplates.filter((t) => t.severity === "good");

  if (score <= 3.0) {
    return [...pickN(critical, 2, 3), ...pickN(warning, 1, 2)];
  }
  if (score <= 5.0) {
    return [
      ...pickN(critical, 1, 2),
      ...pickN(warning, 1, 2),
      ...pickN(good, 0, 1),
    ];
  }
  if (score <= 7.0) {
    return [
      ...pickN(critical, 0, 1),
      ...pickN(warning, 1, 2),
      ...pickN(good, 1, 2),
    ];
  }
  return [...pickN(warning, 0, 1), ...pickN(good, 2, 3)];
}

function getDiffLines(): {
  type: "added" | "removed" | "context";
  content: string;
}[] {
  const template = pick(diffTemplates);
  const lines: { type: "added" | "removed" | "context"; content: string }[] =
    [];

  lines.push({ type: "context", content: "function processData(input) {" });

  for (const line of template.removed) {
    lines.push({ type: "removed", content: line });
  }
  for (const line of template.added) {
    lines.push({ type: "added", content: line });
  }

  lines.push({ type: "context", content: "}" });

  return lines;
}

async function seed() {
  console.log("Cleaning existing data...");
  await db.delete(roastDiffLines);
  await db.delete(roastIssues);
  await db.delete(roasts);

  console.log("Generating 100 roasts...");

  const TOTAL = 100;

  for (let i = 0; i < TOTAL; i++) {
    const lang = pick(LANGUAGES);
    const code = getCodeForLanguage(lang);
    const lineCount = code.split("\n").length;
    const score = faker.number.float({ min: 0.5, max: 9.8, fractionDigits: 1 });
    const verdict = scoreToVerdict(score);
    const roastComment = pick(roastComments);
    const createdAt = faker.date.recent({ days: 30 });

    await db.transaction(async (tx) => {
      const [roast] = await tx
        .insert(roasts)
        .values({
          code,
          language: lang,
          lineCount,
          score,
          verdict,
          roastComment,
          suggestedCode: null,
          createdAt,
        })
        .returning({ id: roasts.id });

      const issues = getIssuesForScore(score);
      if (issues.length > 0) {
        await tx.insert(roastIssues).values(
          issues.map((issue, idx) => ({
            roastId: roast.id,
            severity: issue.severity,
            title: issue.title,
            description: issue.description,
            sortOrder: idx,
          })),
        );
      }

      const diffLines = getDiffLines();
      await tx.insert(roastDiffLines).values(
        diffLines.map((line, idx) => ({
          roastId: roast.id,
          type: line.type,
          content: line.content,
          sortOrder: idx,
        })),
      );
    });

    if ((i + 1) % 25 === 0) {
      console.log(`  ${i + 1}/${TOTAL} roasts inserted`);
    }
  }

  console.log(`Done! Seeded ${TOTAL} roasts with issues and diff lines.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
