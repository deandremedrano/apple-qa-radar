import { useState } from "react";

const API_URL = "http://localhost:11434/api/chat";

const CUSTOM_TEST_SYSTEM = `You are a senior Apple QA engineer. When given an app name and description, generate exactly 8 structured test cases in this JSON format only, no other text:
[
  {
    "id": "CUSTOM-001",
    "area": "Area Name",
    "title": "Test case title",
    "steps": ["Step 1", "Step 2", "Step 3"],
    "expected": "Expected result",
    "severity": "Critical"
  }
]
Severity must be Critical, High, Medium, or Low.`;

const ACCESSIBILITY_SYSTEM = `You are an Apple accessibility expert with 15 years of experience. When given a URL or app description, generate a detailed accessibility audit report.

Respond in this exact JSON format only, no other text:
{
  "score": 85,
  "grade": "B",
  "summary": "One sentence summary",
  "violations": [
    {
      "id": "AX-001",
      "wcag": "1.1.1",
      "level": "A",
      "severity": "Critical",
      "element": "img tags",
      "issue": "Description of issue",
      "recommendation": "How to fix it",
      "appleGuideline": "Apple HIG reference"
    }
  ],
  "passes": [
    {
      "id": "AX-PASS-001",
      "criterion": "What passes",
      "detail": "Why it passes"
    }
  ],
  "recommendations": ["Top recommendation 1", "Top recommendation 2", "Top recommendation 3"]
}`;

const BUILD_NOTES_SYSTEM = `You are a senior Apple QA engineer. When given release notes or a feature description, generate test cases for each new feature mentioned.

Respond in this exact JSON format only, no other text:
{
  "version": "version number or unknown",
  "features": [
    {
      "name": "Feature name",
      "testCases": [
        {
          "id": "BN-001",
          "title": "Test case title",
          "steps": ["Step 1", "Step 2", "Step 3"],
          "expected": "Expected result",
          "severity": "High",
          "area": "Area"
        }
      ]
    }
  ]
}`;

const MATRIX_SYSTEM = `You are a senior Apple QA engineer. When given a feature list, generate a test matrix mapping features to Apple devices and OS versions.

Respond in this exact JSON format only, no other text:
{
  "devices": ["iPhone 15", "iPhone 16", "iPad Air", "MacBook Pro", "Apple Watch"],
  "features": [
    {
      "name": "Feature name",
      "priority": "Critical",
      "coverage": {
        "iPhone 15": "required",
        "iPhone 16": "required",
        "iPad Air": "recommended",
        "MacBook Pro": "optional",
        "Apple Watch": "not applicable"
      },
      "notes": "Any special testing notes"
    }
  ]
}`;

const SYSTEM_INFO = {
  os: "macOS 26.5",
  machine: "Apple M3 (arm64)",
  browser: "Google Chrome 144",
  screen: "2880 × 1864 Retina",
  python: "3.13.12"
};

const APP_TEST_PLANS = {
  mail: {
    name: "Mail", icon: "📧", version: "16.0",
    areas: ["Compose", "Inbox", "Search", "Attachments", "Formatting", "Accessibility"],
    tests: [
      { id: "MAIL-001", area: "Compose", title: "Compose and send new email", steps: ["Open Mail", "Click Compose", "Enter recipient", "Enter subject", "Type body", "Click Send"], expected: "Email sent and appears in Sent folder", severity: "Critical" },
      { id: "MAIL-002", area: "Compose", title: "Send email with attachment", steps: ["Open Mail", "Click Compose", "Click attachment icon", "Select file", "Click Send"], expected: "Email sends with attachment visible to recipient", severity: "High" },
      { id: "MAIL-003", area: "Compose", title: "CC and BCC fields function correctly", steps: ["Open Mail", "Click Compose", "Expand CC/BCC", "Add recipients", "Send"], expected: "CC recipients visible to each other, BCC hidden", severity: "High" },
      { id: "MAIL-004", area: "Inbox", title: "New email appears in inbox", steps: ["Send email to test account", "Open Mail", "Check inbox"], expected: "Email appears with sender, subject, preview", severity: "Critical" },
      { id: "MAIL-005", area: "Inbox", title: "Mark as read and unread toggles", steps: ["Open Mail", "Right-click unread email", "Select Mark as Read", "Right-click again", "Mark as Unread"], expected: "Bold indicator toggles correctly", severity: "Medium" },
      { id: "MAIL-006", area: "Inbox", title: "Delete moves email to Trash", steps: ["Open Mail", "Select email", "Press Delete"], expected: "Email moves to Trash immediately", severity: "High" },
      { id: "MAIL-007", area: "Search", title: "Search by sender name", steps: ["Open Mail", "Click Search", "Type sender name", "Press Enter"], expected: "All emails from sender appear in results", severity: "High" },
      { id: "MAIL-008", area: "Search", title: "Search by subject keyword", steps: ["Open Mail", "Click Search", "Type subject keyword", "Press Enter"], expected: "Matching emails appear in results", severity: "High" },
      { id: "MAIL-009", area: "Formatting", title: "Bold formatting applies correctly", steps: ["Open compose window", "Type text", "Select text", "Press CMD+B"], expected: "Selected text becomes bold", severity: "Medium" },
      { id: "MAIL-010", area: "Accessibility", title: "VoiceOver reads email content", steps: ["Enable VoiceOver CMD+F5", "Open Mail", "Navigate to inbox", "Open email"], expected: "VoiceOver reads sender, subject, body correctly", severity: "High" },
      { id: "MAIL-011", area: "Attachments", title: "Preview attachment inline", steps: ["Open email with image attachment", "Click attachment"], expected: "Image previews inline without external app", severity: "Medium" },
      { id: "MAIL-012", area: "Compose", title: "Draft saves automatically", steps: ["Open compose window", "Type partial email", "Close without sending"], expected: "Draft appears in Drafts folder automatically", severity: "High" }
    ]
  },
  safari: {
    name: "Safari", icon: "🧭", version: "18.0",
    areas: ["Navigation", "Tabs", "Bookmarks", "Privacy", "Accessibility", "Performance"],
    tests: [
      { id: "SAF-001", area: "Navigation", title: "Navigate to URL successfully", steps: ["Open Safari", "Click address bar", "Type valid URL", "Press Enter"], expected: "Page loads correctly within 3 seconds", severity: "Critical" },
      { id: "SAF-002", area: "Navigation", title: "Back and forward navigation", steps: ["Open Safari", "Visit two pages", "Click Back", "Click Forward"], expected: "Browser navigates correctly between pages", severity: "Critical" },
      { id: "SAF-003", area: "Tabs", title: "Open new tab with CMD+T", steps: ["Open Safari", "Press CMD+T"], expected: "New empty tab opens with focus", severity: "High" },
      { id: "SAF-004", area: "Tabs", title: "Close tab with CMD+W", steps: ["Open Safari with multiple tabs", "Press CMD+W"], expected: "Tab closes, focus moves to adjacent tab", severity: "High" },
      { id: "SAF-005", area: "Privacy", title: "Private browsing activates", steps: ["Open Safari", "Press CMD+Shift+N"], expected: "Private window opens with dark address bar", severity: "High" },
      { id: "SAF-006", area: "Privacy", title: "Cookies blocked in private mode", steps: ["Open private window", "Visit cookie site", "Close and reopen normally"], expected: "No cookies persist from private session", severity: "Critical" },
      { id: "SAF-007", area: "Bookmarks", title: "Bookmark page with CMD+D", steps: ["Open Safari", "Navigate to page", "Press CMD+D", "Click Add"], expected: "Page appears in bookmarks", severity: "Medium" },
      { id: "SAF-008", area: "Performance", title: "Page load under 3 seconds", steps: ["Open Safari", "Navigate to apple.com", "Measure load time"], expected: "Page loads within 3 seconds on fast connection", severity: "High" },
      { id: "SAF-009", area: "Accessibility", title: "Reader mode activates on articles", steps: ["Open Safari", "Navigate to article", "Click Reader Mode"], expected: "Article displays in clean Reader view", severity: "Medium" },
      { id: "SAF-010", area: "Navigation", title: "Invalid URL shows error page", steps: ["Open Safari", "Type invalid URL", "Press Enter"], expected: "Safari displays helpful error page", severity: "Medium" }
    ]
  },
  messages: {
    name: "Messages", icon: "💬", version: "18.0",
    areas: ["Send", "Receive", "Media", "Reactions", "Search", "Accessibility"],
    tests: [
      { id: "MSG-001", area: "Send", title: "Send iMessage successfully", steps: ["Open Messages", "Select conversation", "Type message", "Press Enter"], expected: "Message sends with blue bubble and delivered status", severity: "Critical" },
      { id: "MSG-002", area: "Send", title: "Send SMS to non-iPhone user", steps: ["Open Messages", "Start conversation with non-iPhone number", "Type message", "Send"], expected: "Message sends as green SMS bubble", severity: "Critical" },
      { id: "MSG-003", area: "Media", title: "Send photo from camera roll", steps: ["Open Messages", "Open conversation", "Click attachment", "Select photo", "Send"], expected: "Photo sends and displays inline", severity: "High" },
      { id: "MSG-004", area: "Reactions", title: "Add tapback reaction", steps: ["Open Messages", "Long press received message", "Select tapback emoji"], expected: "Reaction appears on message for both parties", severity: "Medium" },
      { id: "MSG-005", area: "Search", title: "Search messages by keyword", steps: ["Open Messages", "Pull down for search", "Type keyword"], expected: "Matching messages appear with keyword highlighted", severity: "High" },
      { id: "MSG-006", area: "Accessibility", title: "Dynamic type scales text", steps: ["Settings > Accessibility > Text Size", "Increase size", "Open Messages"], expected: "Text scales to match system setting", severity: "High" },
      { id: "MSG-007", area: "Send", title: "Message fails gracefully offline", steps: ["Disable WiFi and cellular", "Open Messages", "Send message"], expected: "Message shows failed status with retry option", severity: "High" },
      { id: "MSG-008", area: "Media", title: "Send audio message", steps: ["Open conversation", "Hold microphone button", "Record message", "Release to send"], expected: "Audio sends and plays back correctly", severity: "Medium" }
    ]
  },
  notes: {
    name: "Notes", icon: "📝", version: "18.0",
    areas: ["Create", "Edit", "Sync", "Search", "Formatting", "Accessibility"],
    tests: [
      { id: "NOTE-001", area: "Create", title: "Create new note", steps: ["Open Notes", "Press CMD+N", "Type content"], expected: "Note created and saved automatically", severity: "Critical" },
      { id: "NOTE-002", area: "Edit", title: "Edit existing note autosaves", steps: ["Open Notes", "Select note", "Click body", "Edit content"], expected: "Changes save without manual action", severity: "Critical" },
      { id: "NOTE-003", area: "Formatting", title: "Heading formatting applies", steps: ["Open Notes", "Type text", "Select text", "Apply Heading from Format menu"], expected: "Text displays as heading style", severity: "Medium" },
      { id: "NOTE-004", area: "Search", title: "Search by content keyword", steps: ["Open Notes", "Click Search", "Type keyword"], expected: "Notes with keyword appear in results", severity: "High" },
      { id: "NOTE-005", area: "Sync", title: "Note syncs via iCloud", steps: ["Create note on Mac", "Wait 30 seconds", "Check iPhone same account"], expected: "Note appears on iPhone within 30 seconds", severity: "Critical" },
      { id: "NOTE-006", area: "Accessibility", title: "VoiceOver reads note content", steps: ["Enable VoiceOver", "Open Notes", "Navigate to note"], expected: "VoiceOver reads title and content accurately", severity: "High" }
    ]
  },
  calendar: {
    name: "Calendar", icon: "📅", version: "14.0",
    areas: ["Events", "Alerts", "Sync", "Views", "Accessibility"],
    tests: [
      { id: "CAL-001", area: "Events", title: "Create new event", steps: ["Open Calendar", "Double-click date", "Enter title", "Set time", "Click Done"], expected: "Event appears at correct date and time", severity: "Critical" },
      { id: "CAL-002", area: "Events", title: "Edit existing event", steps: ["Open Calendar", "Double-click event", "Modify title or time", "Click Done"], expected: "Event updates with new information", severity: "High" },
      { id: "CAL-003", area: "Events", title: "Delete event", steps: ["Open Calendar", "Click event", "Press Delete", "Confirm"], expected: "Event removed immediately", severity: "High" },
      { id: "CAL-004", area: "Alerts", title: "Event alert fires on time", steps: ["Create event with 5 min alert", "Wait for alert time"], expected: "Notification fires exactly 5 min before event", severity: "Critical" },
      { id: "CAL-005", area: "Views", title: "Switch between day week month", steps: ["Open Calendar", "Click Day", "Click Week", "Click Month"], expected: "Views switch with accurate data", severity: "High" },
      { id: "CAL-006", area: "Sync", title: "Event syncs to iPhone", steps: ["Create event on Mac", "Wait 30 seconds", "Check iPhone Calendar"], expected: "Event appears on iPhone within 30 seconds", severity: "Critical" }
    ]
  }
};

const RADAR_TEMPLATE = (bugId, appName, test, result, systemInfo) => `================================================================================
RADAR BUG REPORT — ${bugId}
Apple QA Radar Portfolio | Filed by Deandre Medrano
================================================================================

SUMMARY
-------
[${appName}] ${test.title} — ${result.actualResult}

METADATA
--------
Radar ID:     ${bugId}
Date Filed:   ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
Reporter:     Deandre Medrano
App:          ${appName}
Area:         ${test.area}
Test Case:    ${test.id}
Severity:     ${result.severity || test.severity}
Priority:     ${result.severity === "Critical" ? "P1" : result.severity === "High" ? "P2" : "P3"}
Status:       Open

ENVIRONMENT (Auto-Detected)
----------------------------
OS:           ${systemInfo.os}
Machine:      ${systemInfo.machine}
Browser:      ${systemInfo.browser}
Screen:       ${systemInfo.screen}

STEPS TO REPRODUCE
------------------
${test.steps.map((s, i) => `  ${i + 1}. ${s}`).join("\n")}

EXPECTED RESULT
---------------
${test.expected}

ACTUAL RESULT
-------------
${result.actualResult}

IMPACT
------
${result.impact || "Users unable to complete this core workflow."}

REGRESSION
----------
${result.regression || "Unknown — requires investigation"}

POSSIBLE ROOT CAUSE
-------------------
${result.rootCause || "Under investigation"}

ATTACHMENTS
-----------
[ ] Screenshot
[ ] Screen recording
[ ] Console logs
[ ] Crash report

================================================================================
END OF RADAR — ${bugId}
================================================================================`;

export default function App() {
  const [screen, setScreen] = useState("home");
  const [selectedApp, setSelectedApp] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [activeTest, setActiveTest] = useState(null);
  const [radarView, setRadarView] = useState(null);
  const [radars, setRadars] = useState([]);
  const [copied, setCopied] = useState(null);
  const [failureForm, setFailureForm] = useState({ actualResult: "", impact: "", rootCause: "", regression: "", severity: "" });
  const [customApp, setCustomApp] = useState({ name: "", description: "", version: "" });
  const [customTests, setCustomTests] = useState([]);
  const [customLoading, setCustomLoading] = useState(false);
  const [customStatus, setCustomStatus] = useState("");
  const [customResults, setCustomResults] = useState({});
  const [customActive, setCustomActive] = useState(null);
  const [customFailureForm, setCustomFailureForm] = useState({ actualResult: "", impact: "", rootCause: "", regression: "", severity: "" });
  const [isCustomSession, setIsCustomSession] = useState(false);
  const [axUrl, setAxUrl] = useState("");
  const [axLoading, setAxLoading] = useState(false);
  const [axStatus, setAxStatus] = useState("");
  const [axReport, setAxReport] = useState(null);
  const [buildNotes, setBuildNotes] = useState("");
  const [buildLoading, setBuildLoading] = useState(false);
  const [buildStatus, setBuildStatus] = useState("");
  const [buildReport, setBuildReport] = useState(null);
  const [matrixFeatures, setMatrixFeatures] = useState("");
  const [matrixLoading, setMatrixLoading] = useState(false);
  const [matrixStatus, setMatrixStatus] = useState("");
  const [matrixReport, setMatrixReport] = useState(null);

  const generateRadarId = () => `FB${Math.floor(10000000 + Math.random() * 90000000)}`;

  const selectApp = (key) => { setSelectedApp(key); setTestResults({}); setIsCustomSession(false); setScreen("testplan"); };

  const markTest = (id, status) => {
    if (status === "fail") { setActiveTest(id); setFailureForm({ actualResult: "", impact: "", rootCause: "", regression: "", severity: "" }); setScreen("failureform"); }
    else setTestResults(p => ({ ...p, [id]: { status } }));
  };

  const markCustomTest = (id, status) => {
    if (status === "fail") { setCustomActive(id); setCustomFailureForm({ actualResult: "", impact: "", rootCause: "", regression: "", severity: "" }); setScreen("customfailure"); }
    else setCustomResults(p => ({ ...p, [id]: { status } }));
  };

  const submitFailure = () => {
    const app = APP_TEST_PLANS[selectedApp];
    const test = app.tests.find(t => t.id === activeTest);
    const id = generateRadarId();
    const report = RADAR_TEMPLATE(id, app.name, test, failureForm, SYSTEM_INFO);
    setRadars(p => [...p, { id, appName: app.name, title: test.title, severity: failureForm.severity || test.severity, date: new Date().toLocaleDateString(), report }]);
    setTestResults(p => ({ ...p, [activeTest]: { status: "fail", radarId: id } }));
    setScreen("testplan");
  };

  const submitCustomFailure = () => {
    const test = customTests.find(t => t.id === customActive);
    const id = generateRadarId();
    const report = RADAR_TEMPLATE(id, customApp.name, test, customFailureForm, SYSTEM_INFO);
    setRadars(p => [...p, { id, appName: customApp.name, title: test.title, severity: customFailureForm.severity || test.severity, date: new Date().toLocaleDateString(), report }]);
    setCustomResults(p => ({ ...p, [customActive]: { status: "fail", radarId: id } }));
    setScreen("customtests");
  };

  const callAI = async (system, userMessage) => {
    const res = await fetch(API_URL, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "mistral-nemo:latest", messages: [{ role: "system", content: system }, { role: "user", content: userMessage }], stream: false })
    });
    const data = await res.json();
    return data.message.content;
  };

  const generateCustomTests = async () => {
    if (!customApp.name.trim() || !customApp.description.trim() || customLoading) return;
    setCustomLoading(true); setCustomStatus("Generating test plan…"); setCustomTests([]);
    try {
      const content = await callAI(CUSTOM_TEST_SYSTEM, `App: ${customApp.name}\nVersion: ${customApp.version || "Latest"}\nDescription: ${customApp.description}`);
      const match = content.match(/\[[\s\S]*\]/);
      if (match) { setCustomTests(JSON.parse(match[0])); setCustomResults({}); setIsCustomSession(true); setCustomStatus(""); setScreen("customtests"); }
      else setCustomStatus("Error parsing — try again");
    } catch { setCustomStatus("Error — is Ollama running?"); }
    setCustomLoading(false);
  };

  const runAccessibilityAudit = async () => {
    if (!axUrl.trim() || axLoading) return;
    setAxLoading(true); setAxStatus("Running accessibility audit…"); setAxReport(null);
    try {
      const content = await callAI(ACCESSIBILITY_SYSTEM, `Perform a comprehensive accessibility audit for: ${axUrl}\n\nEvaluate against WCAG 2.1 and Apple Human Interface Guidelines. Be specific and realistic.`);
      const match = content.match(/\{[\s\S]*\}/);
      if (match) { setAxReport(JSON.parse(match[0])); setAxStatus(""); }
      else setAxStatus("Error parsing — try again");
    } catch { setAxStatus("Error — is Ollama running?"); }
    setAxLoading(false);
  };

  const parseBuildNotes = async () => {
    if (!buildNotes.trim() || buildLoading) return;
    setBuildLoading(true); setBuildStatus("Parsing release notes…"); setBuildReport(null);
    try {
      const content = await callAI(BUILD_NOTES_SYSTEM, `Parse these release notes and generate test cases:\n\n${buildNotes}`);
      const match = content.match(/\{[\s\S]*\}/);
      if (match) { setBuildReport(JSON.parse(match[0])); setBuildStatus(""); }
      else setBuildStatus("Error parsing — try again");
    } catch { setBuildStatus("Error — is Ollama running?"); }
    setBuildLoading(false);
  };

  const generateMatrix = async () => {
    if (!matrixFeatures.trim() || matrixLoading) return;
    setMatrixLoading(true); setMatrixStatus("Building test matrix…"); setMatrixReport(null);
    try {
      const content = await callAI(MATRIX_SYSTEM, `Generate a test matrix for these features:\n\n${matrixFeatures}`);
      const match = content.match(/\{[\s\S]*\}/);
      if (match) { setMatrixReport(JSON.parse(match[0])); setMatrixStatus(""); }
      else setMatrixStatus("Error parsing — try again");
    } catch { setMatrixStatus("Error — is Ollama running?"); }
    setMatrixLoading(false);
  };

  const copyToClipboard = (text, id) => { navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(null), 2000); };

  const getStats = (tests, results) => {
    const passed = tests.filter(t => results[t.id]?.status === "pass").length;
    const failed = tests.filter(t => results[t.id]?.status === "fail").length;
    return { total: tests.length, passed, failed, pending: tests.length - passed - failed };
  };

  const sevColor = (s) => ({ Critical: "#ff3b30", High: "#ff9500", Medium: "#ffcc00", Low: "#34c759" })[s] || "#8e8e93";
  const statColor = (s) => ({ pass: "#34c759", fail: "#ff3b30" })[s] || "#8e8e93";
  const gradeColor = (g) => ({ A: "#34c759", B: "#0071e3", C: "#ff9500", D: "#ff3b30", F: "#ff3b30" })[g] || "#8e8e93";
  const coverageColor = (c) => ({ required: "#34c759", recommended: "#0071e3", optional: "#ff9500", "not applicable": "#e5e5ea" })[c] || "#8e8e93";

  const C = {
    wrap: { display: "flex", height: "100vh", background: "#f5f5f7", fontFamily: "-apple-system, 'SF Pro Text', 'SF Pro Display', 'Helvetica Neue', sans-serif", color: "#1d1d1f" },
    sidebar: { width: "220px", background: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px)", borderRight: "0.5px solid rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", flexShrink: 0 },
    sidebarTop: { padding: "20px 16px 12px" },
    appMark: { marginBottom: "20px" },
    navSection: { fontSize: "10px", color: "#8e8e93", fontWeight: 600, letterSpacing: "0.06em", padding: "0 16px", marginBottom: "4px", textTransform: "uppercase" },
    navItem: (active) => ({ display: "flex", alignItems: "center", gap: "8px", padding: "7px 12px", margin: "0 4px", borderRadius: "8px", cursor: "pointer", background: active ? "rgba(0,113,227,0.1)" : "transparent", color: active ? "#0071e3" : "#1d1d1f", fontSize: "13px", fontWeight: active ? 500 : 400, transition: "all 0.15s" }),
    navIcon: { fontSize: "12px", width: "16px", textAlign: "center" },
    sidebarDivider: { height: "0.5px", background: "rgba(0,0,0,0.08)", margin: "8px 16px" },
    sidebarFooter: { marginTop: "auto", padding: "12px 16px 20px" },
    sessionCard: { background: "rgba(0,113,227,0.06)", border: "0.5px solid rgba(0,113,227,0.15)", borderRadius: "10px", padding: "10px 12px" },
    sessionLabel: { fontSize: "10px", color: "#0071e3", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "4px" },
    sessionName: { fontSize: "12px", fontWeight: 600, color: "#1d1d1f", marginBottom: "3px" },
    sessionStats: { fontSize: "11px", color: "#8e8e93" },
    main: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },
    topbar: { height: "52px", background: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px)", borderBottom: "0.5px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", padding: "0 24px", gap: "10px", flexShrink: 0 },
    topbarTitle: { fontSize: "13px", fontWeight: 600, color: "#1d1d1f", letterSpacing: "-0.01em" },
    topbarSub: { fontSize: "12px", color: "#8e8e93" },
    topbarActions: { marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" },
    content: { flex: 1, overflowY: "auto", padding: "28px 32px" },
    heroTitle: { fontSize: "28px", fontWeight: 700, letterSpacing: "-0.03em", color: "#1d1d1f", marginBottom: "6px" },
    heroSub: { fontSize: "15px", color: "#6e6e73", marginBottom: "28px", fontWeight: 400 },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "10px" },
    appCard: { background: "#fff", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: "16px", padding: "20px 16px", cursor: "pointer", transition: "all 0.2s", textAlign: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
    tag: (color) => ({ display: "inline-flex", alignItems: "center", padding: "2px 7px", borderRadius: "4px", background: color + "15", color, fontSize: "10px", fontWeight: 600, letterSpacing: "0.02em" }),
    statRow: { display: "flex", gap: "8px", marginBottom: "20px" },
    statBox: (color) => ({ flex: 1, background: "#fff", border: `0.5px solid ${color}30`, borderRadius: "10px", padding: "12px 14px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }),
    statNum: (color) => ({ fontSize: "24px", fontWeight: 700, color, letterSpacing: "-0.02em", lineHeight: 1 }),
    statLabel: { fontSize: "11px", color: "#8e8e93", marginTop: "2px" },
    card: { background: "#fff", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: "12px", padding: "14px 18px", marginBottom: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", transition: "all 0.15s" },
    testId: { fontSize: "10px", color: "#8e8e93", fontFamily: "SF Mono, Monaco, monospace", letterSpacing: "0.04em" },
    testTitle: { fontSize: "14px", fontWeight: 500, color: "#1d1d1f", margin: "4px 0", letterSpacing: "-0.01em" },
    testExpected: { fontSize: "12px", color: "#6e6e73" },
    btn: (bg, text, small) => ({ padding: small ? "5px 11px" : "8px 16px", borderRadius: "8px", background: bg, color: text || "#fff", border: "none", cursor: "pointer", fontSize: small ? "11px" : "13px", fontWeight: 500, letterSpacing: "-0.01em", transition: "opacity 0.15s", whiteSpace: "nowrap" }),
    outlineBtn: (color) => ({ padding: "5px 11px", borderRadius: "8px", background: "transparent", color, border: `0.5px solid ${color}`, cursor: "pointer", fontSize: "11px", fontWeight: 500 }),
    inputWrap: { marginBottom: "14px" },
    inputLabel: { fontSize: "11px", color: "#6e6e73", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "6px", display: "block" },
    input: { width: "100%", background: "#fff", border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: "8px", color: "#1d1d1f", padding: "10px 12px", fontSize: "14px", outline: "none", fontFamily: "inherit", boxSizing: "border-box" },
    textarea: { width: "100%", background: "#fff", border: "0.5px solid rgba(0,0,0,0.15)", borderRadius: "8px", color: "#1d1d1f", padding: "10px 12px", fontSize: "14px", outline: "none", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box" },
    formCard: { background: "#fff", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" },
    radarCard: { background: "#fff", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: "12px", padding: "16px 20px", marginBottom: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
    radarPre: { fontSize: "11px", color: "#1d1d1f", whiteSpace: "pre-wrap", fontFamily: "SF Mono, Monaco, monospace", background: "#f5f5f7", padding: "14px", borderRadius: "8px", lineHeight: 1.65, marginTop: "10px" },
    emptyState: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", color: "#8e8e93", textAlign: "center" },
    statusDot: (color) => ({ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }),
    infoRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 16px", background: "#fff", borderRadius: "8px", marginBottom: "6px", border: "0.5px solid rgba(0,0,0,0.06)" },
    infoKey: { fontSize: "12px", color: "#6e6e73", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500 },
    infoVal: { fontSize: "12px", color: "#1d1d1f", fontFamily: "SF Mono, Monaco, monospace" },
  };

  const renderTestCard = (test, result, onMark) => (
    <div key={test.id} style={{ ...C.card, borderLeft: `3px solid ${result ? statColor(result.status) : "#e5e5ea"}` }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", flexWrap: "wrap" }}>
            <span style={C.testId}>{test.id}</span>
            <span style={C.tag(sevColor(test.severity))}>{test.severity}</span>
            <span style={{ fontSize: "11px", color: "#8e8e93" }}>{test.area}</span>
            {result?.radarId && <span style={C.tag("#0071e3")}>{result.radarId}</span>}
          </div>
          <div style={C.testTitle}>{test.title}</div>
          <div style={C.testExpected}>Expected: {test.expected}</div>
        </div>
        <div style={{ display: "flex", gap: "6px", flexShrink: 0, alignItems: "center" }}>
          {!result ? (
            <>
              <button onClick={() => onMark(test.id, "pass")} style={C.btn("#34c759", "#fff", true)}>Pass</button>
              <button onClick={() => onMark(test.id, "fail")} style={C.btn("#ff3b30", "#fff", true)}>Fail</button>
            </>
          ) : (
            <span style={{ fontSize: "12px", color: statColor(result.status), fontWeight: 600 }}>
              {result.status === "pass" ? "✓ Passed" : "✗ Failed"}
            </span>
          )}
        </div>
      </div>
      <details style={{ marginTop: "8px" }}>
        <summary style={{ fontSize: "11px", color: "#8e8e93", cursor: "pointer", userSelect: "none" }}>Steps to reproduce ({test.steps.length})</summary>
        <div style={{ marginTop: "6px", paddingLeft: "8px", borderLeft: "2px solid #e5e5ea" }}>
          {test.steps.map((step, i) => <div key={i} style={{ fontSize: "12px", color: "#6e6e73", padding: "2px 0" }}>{i + 1}. {step}</div>)}
        </div>
      </details>
    </div>
  );

  const renderStats = (tests, results) => {
    const st = getStats(tests, results);
    return (
      <div style={C.statRow}>
        {[{ l: "Total", v: st.total, c: "#0071e3" }, { l: "Passed", v: st.passed, c: "#34c759" }, { l: "Failed", v: st.failed, c: "#ff3b30" }, { l: "Pending", v: st.pending, c: "#8e8e93" }].map(s => (
          <div key={s.l} style={C.statBox(s.c)}>
            <div style={C.statNum(s.c)}>{s.v}</div>
            <div style={C.statLabel}>{s.l}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderFailureForm = (form, setForm, onSubmit, onCancel, test) => (
    <>
      <div style={C.topbar}>
        <div style={C.statusDot("#ff3b30")} />
        <span style={C.topbarTitle}>File Radar — {test?.id}</span>
        <span style={{ ...C.topbarSub, marginLeft: "8px" }}>{test?.title}</span>
      </div>
      <div style={C.content}>
        <div style={{ maxWidth: "580px" }}>
          <div style={C.formCard}>
            <div style={{ fontSize: "17px", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "4px" }}>File Radar Bug Report</div>
            <div style={{ fontSize: "13px", color: "#6e6e73", marginBottom: "20px" }}>This generates a formatted Radar report added to your portfolio.</div>
            <div style={C.inputWrap}>
              <label style={C.inputLabel}>Actual Result *</label>
              <textarea value={form.actualResult} onChange={e => setForm(p => ({ ...p, actualResult: e.target.value }))} placeholder="Describe what actually happened…" rows={3} style={C.textarea} />
            </div>
            <div style={C.inputWrap}>
              <label style={C.inputLabel}>Severity</label>
              <select value={form.severity} onChange={e => setForm(p => ({ ...p, severity: e.target.value }))} style={{ ...C.input, appearance: "none" }}>
                <option value="">Use default ({test?.severity})</option>
                <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
              </select>
            </div>
            <div style={C.inputWrap}>
              <label style={C.inputLabel}>Impact</label>
              <textarea value={form.impact} onChange={e => setForm(p => ({ ...p, impact: e.target.value }))} placeholder="Who is affected and how severely?" rows={2} style={C.textarea} />
            </div>
            <div style={C.inputWrap}>
              <label style={C.inputLabel}>Possible Root Cause</label>
              <textarea value={form.rootCause} onChange={e => setForm(p => ({ ...p, rootCause: e.target.value }))} placeholder="Your technical hypothesis…" rows={2} style={C.textarea} />
            </div>
            <div style={C.inputWrap}>
              <label style={C.inputLabel}>Regression (optional)</label>
              <input value={form.regression} onChange={e => setForm(p => ({ ...p, regression: e.target.value }))} placeholder="e.g. Worked in previous build, broken in 26.5" style={C.input} />
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
              <button onClick={onSubmit} disabled={!form.actualResult.trim()} style={{ ...C.btn("#0071e3", "#fff"), opacity: !form.actualResult.trim() ? 0.3 : 1 }}>File Radar</button>
              <button onClick={onCancel} style={C.btn("#f5f5f7", "#1d1d1f")}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const navItems = [
    { id: "home", label: "App Library", icon: "⊞" },
    { id: "custom", label: "Custom App", icon: "+" },
    { id: "accessibility", label: "Accessibility Audit", icon: "◎" },
    { id: "buildnotes", label: "Build Notes Parser", icon: "≡" },
    { id: "matrix", label: "Test Matrix", icon: "⊟" },
    { id: "radars", label: "Radar Portfolio", icon: "◈", badge: radars.length },
    { id: "system", label: "System Info", icon: "⌥" }
  ];

  const activeNav = ["home", "testplan", "failureform"].includes(screen) ? "home" :
    ["custom", "customtests", "customfailure"].includes(screen) ? "custom" : screen;

  const currentAppTests = selectedApp ? APP_TEST_PLANS[selectedApp].tests : [];
  const sessionStats = isCustomSession ? getStats(customTests, customResults) : (selectedApp ? getStats(currentAppTests, testResults) : null);

  return (
    <div style={C.wrap}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 0; }
        textarea::placeholder, input::placeholder { color: #c7c7cc; }
        details summary::-webkit-details-marker { display: none; }
        details summary::before { content: "▸ "; }
        details[open] summary::before { content: "▾ "; }
        .app-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08) !important; transform: translateY(-1px); }
        .nav-item:hover { background: rgba(0,0,0,0.04) !important; }
      `}</style>

      {/* Sidebar */}
      <div style={C.sidebar}>
        <div style={C.sidebarTop}>
          <div style={C.appMark}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "1px" }}>
              <span style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.04em", color: "#0071e3" }}>AI</span>
              <span style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.04em", color: "#1d1d1f" }}>dria</span>
              <span style={{ fontSize: "8px", fontWeight: 700, color: "#0071e3", letterSpacing: "0.1em", marginLeft: "3px", alignSelf: "flex-end", marginBottom: "3px" }}>QA</span>
            </div>
            <div style={{ fontSize: "9px", color: "#8e8e93", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "1px" }}>Command Center</div>
          </div>

          <div style={C.navSection}>Testing</div>
          {navItems.slice(0, 2).map(item => (
            <div key={item.id} className="nav-item" style={C.navItem(activeNav === item.id)} onClick={() => setScreen(item.id)}>
              <span style={C.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}

          <div style={{ ...C.sidebarDivider, margin: "8px 16px" }} />
          <div style={C.navSection}>Tools</div>
          {navItems.slice(2, 5).map(item => (
            <div key={item.id} className="nav-item" style={C.navItem(activeNav === item.id)} onClick={() => setScreen(item.id)}>
              <span style={C.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}

          <div style={{ ...C.sidebarDivider, margin: "8px 16px" }} />
          <div style={C.navSection}>Reports</div>
          {navItems.slice(5).map(item => (
            <div key={item.id} className="nav-item" style={C.navItem(activeNav === item.id)} onClick={() => setScreen(item.id)}>
              <span style={C.navIcon}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge > 0 && <span style={{ background: "#0071e3", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "1px 6px", borderRadius: "10px" }}>{item.badge}</span>}
            </div>
          ))}
        </div>

        <div style={C.sidebarFooter}>
          {sessionStats && (
            <div style={C.sessionCard}>
              <div style={C.sessionLabel}>Active Session</div>
              <div style={C.sessionName}>{isCustomSession ? customApp.name : APP_TEST_PLANS[selectedApp]?.name}</div>
              <div style={C.sessionStats}>{sessionStats.passed} passed · {sessionStats.failed} failed · {sessionStats.pending} pending</div>
            </div>
          )}
        </div>
      </div>

      {/* Main */}
      <div style={C.main}>

        {/* Home */}
        {screen === "home" && (
          <>
            <div style={C.topbar}>
              <div style={C.statusDot("#34c759")} />
              <span style={C.topbarTitle}>App Library</span>
              <span style={{ marginLeft: "auto", fontSize: "11px", color: "#8e8e93" }}>Select an app to begin testing</span>
            </div>
            <div style={C.content}>
              <div style={{ animation: "fadeIn 0.3s ease" }}>
                <div style={C.heroTitle}>Apple QA Command Center</div>
                <div style={C.heroSub}>Select an Apple app to generate a structured test plan, execute tests, and file Radar-style bug reports.</div>
                <div style={C.grid}>
                  {Object.entries(APP_TEST_PLANS).map(([key, app]) => (
                    <div key={key} className="app-card" style={C.appCard} onClick={() => selectApp(key)}>
                      <div style={{ fontSize: "32px", marginBottom: "10px" }}>{app.icon}</div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#1d1d1f", marginBottom: "3px", letterSpacing: "-0.01em" }}>{app.name}</div>
                      <div style={{ fontSize: "11px", color: "#8e8e93", marginBottom: "10px" }}>v{app.version} · {app.tests.length} tests</div>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", justifyContent: "center" }}>
                        {app.areas.slice(0, 3).map(a => <span key={a} style={{ fontSize: "10px", color: "#8e8e93", background: "#f5f5f7", padding: "2px 6px", borderRadius: "4px" }}>{a}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Test Plan */}
        {screen === "testplan" && selectedApp && (() => {
          const app = APP_TEST_PLANS[selectedApp];
          const st = getStats(app.tests, testResults);
          return (
            <>
              <div style={C.topbar}>
                <div style={C.statusDot("#0071e3")} />
                <span style={C.topbarTitle}>{app.name}</span>
                <span style={{ ...C.topbarSub, marginLeft: "6px" }}>Test Plan · v{app.version}</span>
                <div style={C.topbarActions}>
                  {st.failed > 0 && <button onClick={() => setScreen("radars")} style={C.outlineBtn("#ff3b30")}>Radars ({st.failed})</button>}
                  <button onClick={() => setScreen("home")} style={C.btn("#f5f5f7", "#1d1d1f", true)}>← Library</button>
                </div>
              </div>
              <div style={C.content}>
                {renderStats(app.tests, testResults)}
                {app.tests.map(test => renderTestCard(test, testResults[test.id], markTest))}
              </div>
            </>
          );
        })()}

        {/* Failure Form */}
        {screen === "failureform" && selectedApp && activeTest && (() => {
          const test = APP_TEST_PLANS[selectedApp].tests.find(t => t.id === activeTest);
          return renderFailureForm(failureForm, setFailureForm, submitFailure, () => setScreen("testplan"), test);
        })()}

        {/* Custom App */}
        {screen === "custom" && (
          <>
            <div style={C.topbar}>
              <div style={C.statusDot("#0071e3")} />
              <span style={C.topbarTitle}>Custom App Testing</span>
              {customStatus && <span style={{ fontSize: "12px", color: "#ff9500", marginLeft: "8px" }}>{customStatus}</span>}
            </div>
            <div style={C.content}>
              <div style={{ maxWidth: "580px", animation: "fadeIn 0.3s ease" }}>
                <div style={C.heroTitle}>Test Any Apple App</div>
                <div style={C.heroSub}>Describe any Apple app or beta feature. AI generates a complete structured test plan automatically.</div>
                <div style={C.formCard}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <div style={{ ...C.inputWrap, flex: 1 }}>
                      <label style={C.inputLabel}>App Name *</label>
                      <input value={customApp.name} onChange={e => setCustomApp(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Freeform, Shortcuts, TestFlight" style={C.input} />
                    </div>
                    <div style={{ ...C.inputWrap, width: "130px" }}>
                      <label style={C.inputLabel}>Version</label>
                      <input value={customApp.version} onChange={e => setCustomApp(p => ({ ...p, version: e.target.value }))} placeholder="e.g. Beta 3" style={C.input} />
                    </div>
                  </div>
                  <div style={C.inputWrap}>
                    <label style={C.inputLabel}>What to Test *</label>
                    <textarea value={customApp.description} onChange={e => setCustomApp(p => ({ ...p, description: e.target.value }))} placeholder="Describe the feature or area you want to test in detail." rows={5} style={C.textarea} />
                  </div>
                  <button onClick={generateCustomTests} disabled={customLoading || !customApp.name.trim() || !customApp.description.trim()} style={{ ...C.btn("#0071e3", "#fff"), opacity: (customLoading || !customApp.name.trim() || !customApp.description.trim()) ? 0.3 : 1 }}>
                    {customLoading ? customStatus : "Generate Test Plan"}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Custom Tests */}
        {screen === "customtests" && customTests.length > 0 && (() => {
          const st = getStats(customTests, customResults);
          return (
            <>
              <div style={C.topbar}>
                <div style={C.statusDot("#0071e3")} />
                <span style={C.topbarTitle}>{customApp.name}</span>
                <span style={{ ...C.topbarSub, marginLeft: "6px" }}>AI-Generated Test Plan</span>
                <div style={C.topbarActions}>
                  {st.failed > 0 && <button onClick={() => setScreen("radars")} style={C.outlineBtn("#ff3b30")}>Radars ({st.failed})</button>}
                  <button onClick={() => setScreen("custom")} style={C.btn("#f5f5f7", "#1d1d1f", true)}>← New App</button>
                </div>
              </div>
              <div style={C.content}>
                <div style={{ background: "#0071e315", border: "0.5px solid #0071e330", borderRadius: "10px", padding: "10px 14px", marginBottom: "16px", fontSize: "12px", color: "#0071e3" }}>
                  <strong>AI Generated</strong> · {customApp.name} {customApp.version} · {customApp.description.slice(0, 100)}…
                </div>
                {renderStats(customTests, customResults)}
                {customTests.map(test => renderTestCard(test, customResults[test.id], markCustomTest))}
              </div>
            </>
          );
        })()}

        {/* Custom Failure */}
        {screen === "customfailure" && customActive && (() => {
          const test = customTests.find(t => t.id === customActive);
          return renderFailureForm(customFailureForm, setCustomFailureForm, submitCustomFailure, () => setScreen("customtests"), test);
        })()}

        {/* Accessibility Audit */}
        {screen === "accessibility" && (
          <>
            <div style={C.topbar}>
              <div style={C.statusDot("#34c759")} />
              <span style={C.topbarTitle}>Accessibility Audit</span>
              {axStatus && <span style={{ fontSize: "12px", color: "#ff9500", marginLeft: "8px" }}>{axStatus}</span>}
            </div>
            <div style={C.content}>
              <div style={{ maxWidth: "720px", animation: "fadeIn 0.3s ease" }}>
                <div style={C.heroTitle}>Accessibility Audit Runner</div>
                <div style={C.heroSub}>Enter a URL or app description to receive a detailed WCAG 2.1 and Apple HIG accessibility audit report.</div>
                <div style={C.formCard}>
                  <div style={C.inputWrap}>
                    <label style={C.inputLabel}>URL or App Description *</label>
                    <input value={axUrl} onChange={e => setAxUrl(e.target.value)} placeholder="e.g. https://apple.com or 'Mail app inbox screen on iOS 18'" style={C.input} />
                  </div>
                  <button onClick={runAccessibilityAudit} disabled={axLoading || !axUrl.trim()} style={{ ...C.btn("#34c759", "#fff"), opacity: (axLoading || !axUrl.trim()) ? 0.3 : 1 }}>
                    {axLoading ? axStatus : "Run Accessibility Audit"}
                  </button>
                </div>

                {axReport && (
                  <div style={{ marginTop: "20px", animation: "fadeIn 0.3s ease" }}>
                    {/* Score */}
                    <div style={{ ...C.formCard, display: "flex", alignItems: "center", gap: "20px", marginBottom: "16px" }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "48px", fontWeight: 800, color: gradeColor(axReport.grade), letterSpacing: "-0.03em", lineHeight: 1 }}>{axReport.grade}</div>
                        <div style={{ fontSize: "11px", color: "#8e8e93", marginTop: "2px" }}>Grade</div>
                      </div>
                      <div style={{ width: "0.5px", height: "48px", background: "#e5e5ea" }} />
                      <div>
                        <div style={{ fontSize: "32px", fontWeight: 700, color: gradeColor(axReport.grade), letterSpacing: "-0.02em", lineHeight: 1 }}>{axReport.score}/100</div>
                        <div style={{ fontSize: "13px", color: "#6e6e73", marginTop: "4px" }}>{axReport.summary}</div>
                      </div>
                    </div>

                    {/* Violations */}
                    {axReport.violations?.length > 0 && (
                      <div style={{ marginBottom: "16px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#ff3b30", marginBottom: "8px", letterSpacing: "-0.01em" }}>✗ Violations ({axReport.violations.length})</div>
                        {axReport.violations.map(v => (
                          <div key={v.id} style={{ ...C.card, borderLeft: `3px solid ${sevColor(v.severity)}` }}>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px", flexWrap: "wrap" }}>
                              <span style={C.testId}>{v.id}</span>
                              <span style={C.tag(sevColor(v.severity))}>{v.severity}</span>
                              <span style={C.tag("#0071e3")}>WCAG {v.wcag}</span>
                              <span style={C.tag("#8e8e93")}>Level {v.level}</span>
                              <span style={{ fontSize: "11px", color: "#8e8e93" }}>{v.element}</span>
                            </div>
                            <div style={{ fontSize: "13px", fontWeight: 500, marginBottom: "4px" }}>{v.issue}</div>
                            <div style={{ fontSize: "12px", color: "#34c759", marginBottom: "2px" }}>Fix: {v.recommendation}</div>
                            <div style={{ fontSize: "11px", color: "#8e8e93" }}>Apple HIG: {v.appleGuideline}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Passes */}
                    {axReport.passes?.length > 0 && (
                      <div style={{ marginBottom: "16px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#34c759", marginBottom: "8px" }}>✓ Passing ({axReport.passes.length})</div>
                        {axReport.passes.map(p => (
                          <div key={p.id} style={{ ...C.card, borderLeft: "3px solid #34c759" }}>
                            <div style={{ fontSize: "13px", fontWeight: 500, marginBottom: "2px" }}>{p.criterion}</div>
                            <div style={{ fontSize: "12px", color: "#6e6e73" }}>{p.detail}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Recommendations */}
                    {axReport.recommendations?.length > 0 && (
                      <div style={C.formCard}>
                        <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "10px" }}>Top Recommendations</div>
                        {axReport.recommendations.map((r, i) => (
                          <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "6px", fontSize: "13px", color: "#1d1d1f" }}>
                            <span style={{ color: "#0071e3", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Build Notes Parser */}
        {screen === "buildnotes" && (
          <>
            <div style={C.topbar}>
              <div style={C.statusDot("#ff9500")} />
              <span style={C.topbarTitle}>Build Notes Parser</span>
              {buildStatus && <span style={{ fontSize: "12px", color: "#ff9500", marginLeft: "8px" }}>{buildStatus}</span>}
            </div>
            <div style={C.content}>
              <div style={{ maxWidth: "720px", animation: "fadeIn 0.3s ease" }}>
                <div style={C.heroTitle}>Build Notes Parser</div>
                <div style={C.heroSub}>Paste Apple release notes or feature descriptions. AI generates test cases for every new feature automatically.</div>
                <div style={C.formCard}>
                  <div style={C.inputWrap}>
                    <label style={C.inputLabel}>Release Notes or Feature Description *</label>
                    <textarea value={buildNotes} onChange={e => setBuildNotes(e.target.value)} placeholder={`Paste release notes here. Example:\n\niOS 18.4 Release Notes\n• Mail now supports rich text formatting in replies\n• Safari adds new Tab Groups sync across devices\n• Messages adds new emoji reactions\n• Calendar adds travel time suggestions`} rows={8} style={C.textarea} />
                  </div>
                  <button onClick={parseBuildNotes} disabled={buildLoading || !buildNotes.trim()} style={{ ...C.btn("#ff9500", "#fff"), opacity: (buildLoading || !buildNotes.trim()) ? 0.3 : 1 }}>
                    {buildLoading ? buildStatus : "Parse & Generate Test Cases"}
                  </button>
                </div>

                {buildReport && (
                  <div style={{ marginTop: "20px", animation: "fadeIn 0.3s ease" }}>
                    <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "16px", letterSpacing: "-0.02em" }}>
                      Generated Test Cases · {buildReport.version}
                      <span style={{ fontSize: "12px", color: "#8e8e93", fontWeight: 400, marginLeft: "8px" }}>
                        {buildReport.features?.reduce((acc, f) => acc + f.testCases.length, 0)} total tests
                      </span>
                    </div>
                    {buildReport.features?.map((feature, fi) => (
                      <div key={fi} style={{ marginBottom: "20px" }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#ff9500", marginBottom: "8px", letterSpacing: "-0.01em" }}>{feature.name}</div>
                        {feature.testCases.map(test => (
                          <div key={test.id} style={{ ...C.card, borderLeft: `3px solid ${sevColor(test.severity)}` }}>
                            <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "4px", flexWrap: "wrap" }}>
                              <span style={C.testId}>{test.id}</span>
                              <span style={C.tag(sevColor(test.severity))}>{test.severity}</span>
                              <span style={{ fontSize: "11px", color: "#8e8e93" }}>{test.area}</span>
                            </div>
                            <div style={C.testTitle}>{test.title}</div>
                            <div style={C.testExpected}>Expected: {test.expected}</div>
                            <details style={{ marginTop: "8px" }}>
                              <summary style={{ fontSize: "11px", color: "#8e8e93", cursor: "pointer" }}>Steps ({test.steps.length})</summary>
                              <div style={{ marginTop: "6px", paddingLeft: "8px", borderLeft: "2px solid #e5e5ea" }}>
                                {test.steps.map((s, i) => <div key={i} style={{ fontSize: "12px", color: "#6e6e73", padding: "2px 0" }}>{i + 1}. {s}</div>)}
                              </div>
                            </details>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Test Matrix */}
        {screen === "matrix" && (
          <>
            <div style={C.topbar}>
              <div style={C.statusDot("#0071e3")} />
              <span style={C.topbarTitle}>Test Matrix Builder</span>
              {matrixStatus && <span style={{ fontSize: "12px", color: "#ff9500", marginLeft: "8px" }}>{matrixStatus}</span>}
            </div>
            <div style={C.content}>
              <div style={{ maxWidth: "900px", animation: "fadeIn 0.3s ease" }}>
                <div style={C.heroTitle}>Test Matrix Builder</div>
                <div style={C.heroSub}>List your features and AI maps them across Apple devices and OS versions, showing required vs optional test coverage.</div>
                <div style={C.formCard}>
                  <div style={C.inputWrap}>
                    <label style={C.inputLabel}>Features to Test *</label>
                    <textarea value={matrixFeatures} onChange={e => setMatrixFeatures(e.target.value)} placeholder={`List features one per line. Example:\nUser login with Face ID\nPush notifications\nDark mode support\niCloud sync\nVoiceOver accessibility\nLandscape orientation`} rows={7} style={C.textarea} />
                  </div>
                  <button onClick={generateMatrix} disabled={matrixLoading || !matrixFeatures.trim()} style={{ ...C.btn("#0071e3", "#fff"), opacity: (matrixLoading || !matrixFeatures.trim()) ? 0.3 : 1 }}>
                    {matrixLoading ? matrixStatus : "Build Test Matrix"}
                  </button>
                </div>

                {matrixReport && (
                  <div style={{ marginTop: "20px", animation: "fadeIn 0.3s ease", overflowX: "auto" }}>
                    <div style={{ fontSize: "15px", fontWeight: 700, marginBottom: "16px", letterSpacing: "-0.02em" }}>Test Coverage Matrix</div>
                    <div style={{ background: "#fff", border: "0.5px solid rgba(0,0,0,0.08)", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                        <thead>
                          <tr style={{ background: "#f5f5f7" }}>
                            <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#1d1d1f", borderBottom: "0.5px solid rgba(0,0,0,0.08)", fontSize: "11px" }}>Feature</th>
                            <th style={{ padding: "10px 10px", textAlign: "center", fontWeight: 600, color: "#6e6e73", borderBottom: "0.5px solid rgba(0,0,0,0.08)", fontSize: "11px" }}>Priority</th>
                            {matrixReport.devices?.map(d => (
                              <th key={d} style={{ padding: "10px 8px", textAlign: "center", fontWeight: 600, color: "#6e6e73", borderBottom: "0.5px solid rgba(0,0,0,0.08)", fontSize: "10px", minWidth: "80px" }}>{d}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {matrixReport.features?.map((feature, i) => (
                            <tr key={i} style={{ borderBottom: "0.5px solid rgba(0,0,0,0.05)" }}>
                              <td style={{ padding: "10px 14px", fontWeight: 500, color: "#1d1d1f" }}>
                                {feature.name}
                                {feature.notes && <div style={{ fontSize: "10px", color: "#8e8e93", marginTop: "2px" }}>{feature.notes}</div>}
                              </td>
                              <td style={{ padding: "10px", textAlign: "center" }}>
                                <span style={C.tag(sevColor(feature.priority))}>{feature.priority}</span>
                              </td>
                              {matrixReport.devices?.map(d => {
                                const coverage = feature.coverage?.[d] || "not applicable";
                                const color = coverageColor(coverage);
                                return (
                                  <td key={d} style={{ padding: "10px 8px", textAlign: "center" }}>
                                    <span style={{ fontSize: "10px", color, fontWeight: 600 }}>
                                      {coverage === "required" ? "●" : coverage === "recommended" ? "◐" : coverage === "optional" ? "○" : "—"}
                                    </span>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div style={{ padding: "10px 14px", background: "#f5f5f7", display: "flex", gap: "16px", fontSize: "11px", color: "#8e8e93" }}>
                        <span><span style={{ color: "#34c759" }}>●</span> Required</span>
                        <span><span style={{ color: "#0071e3" }}>◐</span> Recommended</span>
                        <span><span style={{ color: "#ff9500" }}>○</span> Optional</span>
                        <span>— Not Applicable</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Radar Portfolio */}
        {screen === "radars" && (
          <>
            <div style={C.topbar}>
              <div style={C.statusDot(radars.length > 0 ? "#ff9500" : "#8e8e93")} />
              <span style={C.topbarTitle}>Radar Portfolio</span>
              <span style={{ marginLeft: "auto", fontSize: "11px", color: "#8e8e93" }}>{radars.length} radar{radars.length !== 1 ? "s" : ""} filed</span>
            </div>
            <div style={C.content}>
              {radars.length === 0 ? (
                <div style={C.emptyState}>
                  <div style={{ fontSize: "40px", marginBottom: "12px", opacity: 0.3 }}>◈</div>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: "#1d1d1f", marginBottom: "4px" }}>No Radars Filed</div>
                  <div style={{ fontSize: "13px" }}>Run tests and mark failures to generate Radar reports</div>
                </div>
              ) : radars.map(radar => (
                <div key={radar.id} style={C.radarCard}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <span style={C.tag(sevColor(radar.severity))}>{radar.severity}</span>
                    <span style={{ fontSize: "11px", color: "#0071e3", fontFamily: "SF Mono, Monaco, monospace", fontWeight: 600 }}>{radar.id}</span>
                    <span style={{ fontSize: "11px", color: "#8e8e93" }}>{radar.appName} · {radar.date}</span>
                    <button onClick={() => copyToClipboard(radar.report, radar.id)} style={{ ...C.btn(copied === radar.id ? "#34c759" : "#f5f5f7", copied === radar.id ? "#fff" : "#1d1d1f", true), marginLeft: "auto" }}>
                      {copied === radar.id ? "✓ Copied" : "Copy Report"}
                    </button>
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 500, color: "#1d1d1f", marginBottom: "8px", letterSpacing: "-0.01em" }}>{radar.title}</div>
                  {radarView === radar.id ? (
                    <>
                      <pre style={C.radarPre}>{radar.report}</pre>
                      <button onClick={() => setRadarView(null)} style={{ ...C.btn("#f5f5f7", "#1d1d1f", true), marginTop: "8px" }}>Hide Report</button>
                    </>
                  ) : (
                    <button onClick={() => setRadarView(radar.id)} style={C.outlineBtn("#0071e3")}>View Full Report</button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* System Info */}
        {screen === "system" && (
          <>
            <div style={C.topbar}>
              <div style={C.statusDot("#34c759")} />
              <span style={C.topbarTitle}>System Information</span>
              <span style={{ marginLeft: "auto", fontSize: "11px", color: "#8e8e93" }}>Auto-detected · Included in all Radar reports</span>
            </div>
            <div style={C.content}>
              <div style={{ maxWidth: "480px", animation: "fadeIn 0.3s ease" }}>
                <div style={C.heroTitle}>Your Environment</div>
                <div style={C.heroSub}>Automatically detected and included in every Radar report you file.</div>
                {Object.entries(SYSTEM_INFO).map(([key, val]) => (
                  <div key={key} style={C.infoRow}>
                    <span style={C.infoKey}>{key}</span>
                    <span style={C.infoVal}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}