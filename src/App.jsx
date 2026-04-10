import { useState, useRef } from "react";

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

const SYSTEM_INFO = {
  os: "macOS 26.5",
  machine: "Apple M3 (arm64)",
  browser: "Google Chrome 144",
  screen: "2880 x 1864 Retina",
  python: "3.13.12"
};

const APP_TEST_PLANS = {
  mail: {
    name: "Mail", icon: "✉️", version: "16.0",
    areas: ["Compose", "Inbox", "Search", "Attachments", "Formatting", "Accessibility"],
    tests: [
      { id: "MAIL-001", area: "Compose", title: "Compose new email", steps: ["Open Mail app", "Click Compose button", "Enter recipient email address", "Enter subject line", "Type message body", "Click Send"], expected: "Email is sent successfully and appears in Sent folder", severity: "Critical" },
      { id: "MAIL-002", area: "Compose", title: "Send email with attachment", steps: ["Open Mail app", "Click Compose button", "Click attachment icon", "Select a file from Finder", "Click Send"], expected: "Email sends with attachment visible to recipient", severity: "High" },
      { id: "MAIL-003", area: "Compose", title: "CC and BCC fields work correctly", steps: ["Open Mail app", "Click Compose button", "Click CC/BCC button", "Add recipients to CC and BCC fields", "Send email"], expected: "CC recipients see each other, BCC recipients are hidden", severity: "High" },
      { id: "MAIL-004", area: "Inbox", title: "Receive and display new email", steps: ["Send email to test account", "Open Mail app", "Check inbox for new message"], expected: "New email appears in inbox with sender, subject, and preview", severity: "Critical" },
      { id: "MAIL-005", area: "Inbox", title: "Mark email as read/unread", steps: ["Open Mail app", "Right-click an unread email", "Select Mark as Read", "Right-click again", "Select Mark as Unread"], expected: "Email bold indicator toggles correctly", severity: "Medium" },
      { id: "MAIL-006", area: "Inbox", title: "Delete email moves to trash", steps: ["Open Mail app", "Select an email", "Press Delete key"], expected: "Email moves to Trash folder immediately", severity: "High" },
      { id: "MAIL-007", area: "Search", title: "Search by sender name", steps: ["Open Mail app", "Click Search bar", "Type sender name", "Press Enter"], expected: "All emails from that sender appear in results", severity: "High" },
      { id: "MAIL-008", area: "Search", title: "Search by subject keyword", steps: ["Open Mail app", "Click Search bar", "Type keyword from subject", "Press Enter"], expected: "Emails with matching subject appear in results", severity: "High" },
      { id: "MAIL-009", area: "Formatting", title: "Bold text formatting applies correctly", steps: ["Open Mail compose window", "Type some text", "Select the text", "Press CMD+B"], expected: "Selected text becomes bold", severity: "Medium" },
      { id: "MAIL-010", area: "Accessibility", title: "VoiceOver reads email content", steps: ["Enable VoiceOver with CMD+F5", "Open Mail app", "Navigate to inbox", "Open an email"], expected: "VoiceOver reads sender, subject, and body correctly", severity: "High" },
      { id: "MAIL-011", area: "Attachments", title: "Preview attachment inline", steps: ["Open email with image attachment", "Click on attachment"], expected: "Image previews inline without opening external app", severity: "Medium" },
      { id: "MAIL-012", area: "Compose", title: "Draft saves automatically", steps: ["Open compose window", "Type partial email", "Close compose window without sending"], expected: "Draft appears in Drafts folder automatically", severity: "High" }
    ]
  },
  safari: {
    name: "Safari", icon: "🧭", version: "18.0",
    areas: ["Navigation", "Tabs", "Bookmarks", "Privacy", "Accessibility", "Performance"],
    tests: [
      { id: "SAF-001", area: "Navigation", title: "Navigate to URL successfully", steps: ["Open Safari", "Click address bar", "Type a valid URL", "Press Enter"], expected: "Page loads correctly within 3 seconds", severity: "Critical" },
      { id: "SAF-002", area: "Navigation", title: "Back and forward navigation works", steps: ["Open Safari", "Visit two different pages", "Click Back button", "Click Forward button"], expected: "Browser navigates correctly between pages", severity: "Critical" },
      { id: "SAF-003", area: "Tabs", title: "Open new tab with CMD+T", steps: ["Open Safari", "Press CMD+T"], expected: "New empty tab opens and receives focus", severity: "High" },
      { id: "SAF-004", area: "Tabs", title: "Close tab with CMD+W", steps: ["Open Safari with multiple tabs", "Press CMD+W"], expected: "Current tab closes, focus moves to adjacent tab", severity: "High" },
      { id: "SAF-005", area: "Privacy", title: "Private browsing mode activates", steps: ["Open Safari", "Press CMD+Shift+N"], expected: "Private browsing window opens with dark address bar", severity: "High" },
      { id: "SAF-006", area: "Privacy", title: "Cookies blocked in private mode", steps: ["Open private browsing window", "Visit a cookie-dependent site", "Close window and reopen normally"], expected: "No cookies persist from private session", severity: "Critical" },
      { id: "SAF-007", area: "Bookmarks", title: "Bookmark page with CMD+D", steps: ["Open Safari", "Navigate to a page", "Press CMD+D", "Click Add"], expected: "Page appears in bookmarks", severity: "Medium" },
      { id: "SAF-008", area: "Performance", title: "Page load time under 3 seconds", steps: ["Open Safari", "Navigate to apple.com", "Measure load time"], expected: "Page fully loads within 3 seconds on fast connection", severity: "High" },
      { id: "SAF-009", area: "Accessibility", title: "Reader mode activates on articles", steps: ["Open Safari", "Navigate to a news article", "Click Reader Mode button in address bar"], expected: "Article displays in clean Reader view", severity: "Medium" },
      { id: "SAF-010", area: "Navigation", title: "Invalid URL shows error page", steps: ["Open Safari", "Type invalid URL in address bar", "Press Enter"], expected: "Safari displays a helpful error page", severity: "Medium" }
    ]
  },
  messages: {
    name: "Messages", icon: "💬", version: "18.0",
    areas: ["Send", "Receive", "Media", "Reactions", "Search", "Accessibility"],
    tests: [
      { id: "MSG-001", area: "Send", title: "Send iMessage successfully", steps: ["Open Messages app", "Select or start a conversation", "Type a message", "Press Enter or click Send"], expected: "Message sends and shows blue bubble with delivered status", severity: "Critical" },
      { id: "MSG-002", area: "Send", title: "Send SMS to non-iPhone user", steps: ["Open Messages app", "Start conversation with non-iPhone number", "Type message", "Send"], expected: "Message sends as SMS shown in green bubble", severity: "Critical" },
      { id: "MSG-003", area: "Media", title: "Send photo from camera roll", steps: ["Open Messages app", "Open a conversation", "Click attachment icon", "Select photo from library", "Send"], expected: "Photo sends and displays inline in conversation", severity: "High" },
      { id: "MSG-004", area: "Reactions", title: "Add tapback reaction to message", steps: ["Open Messages app", "Long press on a received message", "Select a tapback emoji"], expected: "Reaction appears on message visible to both parties", severity: "Medium" },
      { id: "MSG-005", area: "Search", title: "Search messages by keyword", steps: ["Open Messages app", "Pull down to reveal search bar", "Type a keyword"], expected: "Matching messages appear with keyword highlighted", severity: "High" },
      { id: "MSG-006", area: "Accessibility", title: "Dynamic type scales message text", steps: ["Go to Settings > Accessibility > Display & Text Size", "Increase text size", "Open Messages app"], expected: "Message text scales to match system text size setting", severity: "High" },
      { id: "MSG-007", area: "Send", title: "Message fails gracefully with no connection", steps: ["Turn off WiFi and cellular", "Open Messages", "Try to send a message"], expected: "Message shows failed status with option to retry", severity: "High" },
      { id: "MSG-008", area: "Media", title: "Send audio message", steps: ["Open Messages conversation", "Hold microphone button", "Record audio message", "Release to send"], expected: "Audio message sends and plays back correctly", severity: "Medium" }
    ]
  },
  notes: {
    name: "Notes", icon: "📝", version: "18.0",
    areas: ["Create", "Edit", "Sync", "Search", "Formatting", "Accessibility"],
    tests: [
      { id: "NOTE-001", area: "Create", title: "Create new note", steps: ["Open Notes app", "Click compose button or press CMD+N", "Type note content"], expected: "New note created and saved automatically", severity: "Critical" },
      { id: "NOTE-002", area: "Edit", title: "Edit existing note", steps: ["Open Notes app", "Select an existing note", "Click in the note body", "Edit content"], expected: "Changes save automatically without manual save action", severity: "Critical" },
      { id: "NOTE-003", area: "Formatting", title: "Apply heading formatting", steps: ["Open Notes app", "Create or open a note", "Type text", "Select text", "Apply Heading format from Format menu"], expected: "Text displays as large heading style", severity: "Medium" },
      { id: "NOTE-004", area: "Search", title: "Search notes by content", steps: ["Open Notes app", "Click Search field", "Type keyword from note content"], expected: "Notes containing keyword appear in results", severity: "High" },
      { id: "NOTE-005", area: "Sync", title: "Note syncs across devices via iCloud", steps: ["Create note on Mac", "Wait 30 seconds", "Check same iCloud account on iPhone"], expected: "Note appears on iPhone within 30 seconds", severity: "Critical" },
      { id: "NOTE-006", area: "Accessibility", title: "VoiceOver reads note content", steps: ["Enable VoiceOver", "Open Notes app", "Navigate to a note"], expected: "VoiceOver reads note title and content accurately", severity: "High" }
    ]
  },
  calendar: {
    name: "Calendar", icon: "📅", version: "14.0",
    areas: ["Events", "Alerts", "Sync", "Views", "Accessibility"],
    tests: [
      { id: "CAL-001", area: "Events", title: "Create new event", steps: ["Open Calendar app", "Double-click on a date", "Enter event title", "Set start and end time", "Click Done"], expected: "Event appears on calendar at correct date and time", severity: "Critical" },
      { id: "CAL-002", area: "Events", title: "Edit existing event", steps: ["Open Calendar app", "Double-click on existing event", "Modify title or time", "Click Done"], expected: "Event updates with new information", severity: "High" },
      { id: "CAL-003", area: "Events", title: "Delete event", steps: ["Open Calendar app", "Click on event", "Press Delete key", "Confirm deletion"], expected: "Event removed from calendar immediately", severity: "High" },
      { id: "CAL-004", area: "Alerts", title: "Event alert fires on time", steps: ["Create event with alert 5 minutes before", "Wait for alert time"], expected: "Notification appears exactly 5 minutes before event", severity: "Critical" },
      { id: "CAL-005", area: "Views", title: "Switch between day week month views", steps: ["Open Calendar app", "Click Day view", "Click Week view", "Click Month view"], expected: "Calendar switches views correctly showing accurate data", severity: "High" },
      { id: "CAL-006", area: "Sync", title: "Event syncs to iPhone via iCloud", steps: ["Create event on Mac Calendar", "Wait 30 seconds", "Check iPhone Calendar"], expected: "Event appears on iPhone within 30 seconds", severity: "Critical" }
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
Python:       ${systemInfo.python}

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
${result.impact || "Users are unable to complete this core workflow."}

REGRESSION
----------
${result.regression || "Unknown — requires further investigation"}

POSSIBLE ROOT CAUSE
-------------------
${result.rootCause || "Under investigation"}

ATTACHMENTS
-----------
[ ] Screenshot
[ ] Screen recording
[ ] Console logs
[ ] Crash report (if applicable)

================================================================================
END OF RADAR — ${bugId}
================================================================================`;

export default function App() {
  const [screen, setScreen] = useState("home");
  const [selectedApp, setSelectedApp] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [activeTest, setActiveTest] = useState(null);
  const [radarView, setRadarView] = useState(null);
  const [failureData, setFailureData] = useState({});
  const [radars, setRadars] = useState([]);
  const [copied, setCopied] = useState(null);
  const [failureForm, setFailureForm] = useState({ actualResult: "", impact: "", rootCause: "", regression: "", severity: "" });
  const [customApp, setCustomApp] = useState({ name: "", description: "", icon: "📱", version: "" });
  const [customTests, setCustomTests] = useState([]);
  const [customLoading, setCustomLoading] = useState(false);
  const [customStatus, setCustomStatus] = useState("");
  const [customResults, setCustomResults] = useState({});
  const [customActive, setCustomActive] = useState(null);
  const [customFailureForm, setCustomFailureForm] = useState({ actualResult: "", impact: "", rootCause: "", regression: "", severity: "" });
  const [isCustomSession, setIsCustomSession] = useState(false);

  const generateRadarId = () => `FB${Math.floor(10000000 + Math.random() * 90000000)}`;

  const selectApp = (appKey) => {
    setSelectedApp(appKey);
    setTestResults({});
    setIsCustomSession(false);
    setScreen("testplan");
  };

  const markTest = (testId, status) => {
    if (status === "fail") {
      setActiveTest(testId);
      setFailureForm({ actualResult: "", impact: "", rootCause: "", regression: "", severity: "" });
      setScreen("failureform");
    } else {
      setTestResults(prev => ({ ...prev, [testId]: { status } }));
    }
  };

  const markCustomTest = (testId, status) => {
    if (status === "fail") {
      setCustomActive(testId);
      setCustomFailureForm({ actualResult: "", impact: "", rootCause: "", regression: "", severity: "" });
      setScreen("customfailure");
    } else {
      setCustomResults(prev => ({ ...prev, [testId]: { status } }));
    }
  };

  const submitFailure = () => {
    const app = APP_TEST_PLANS[selectedApp];
    const test = app.tests.find(t => t.id === activeTest);
    const radarId = generateRadarId();
    const report = RADAR_TEMPLATE(radarId, app.name, test, failureForm, SYSTEM_INFO);
    const newRadar = { id: radarId, appName: app.name, testId: activeTest, title: test.title, severity: failureForm.severity || test.severity, date: new Date().toLocaleDateString(), report };
    setRadars(prev => [...prev, newRadar]);
    setTestResults(prev => ({ ...prev, [activeTest]: { status: "fail", radarId } }));
    setScreen("testplan");
  };

  const submitCustomFailure = () => {
    const test = customTests.find(t => t.id === customActive);
    const radarId = generateRadarId();
    const report = RADAR_TEMPLATE(radarId, customApp.name, test, customFailureForm, SYSTEM_INFO);
    const newRadar = { id: radarId, appName: customApp.name, testId: customActive, title: test.title, severity: customFailureForm.severity || test.severity, date: new Date().toLocaleDateString(), report };
    setRadars(prev => [...prev, newRadar]);
    setCustomResults(prev => ({ ...prev, [customActive]: { status: "fail", radarId } }));
    setScreen("customtests");
  };

  const generateCustomTests = async () => {
    if (!customApp.name.trim() || !customApp.description.trim() || customLoading) return;
    setCustomLoading(true);
    setCustomStatus("Generating test plan...");
    setCustomTests([]);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "mistral-nemo:latest",
          messages: [
            { role: "system", content: CUSTOM_TEST_SYSTEM },
            { role: "user", content: `App: ${customApp.name}\nVersion: ${customApp.version || "Latest"}\nDescription: ${customApp.description}` }
          ],
          stream: false
        })
      });
      const data = await res.json();
      const content = data.message.content.trim();
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const tests = JSON.parse(jsonMatch[0]);
        setCustomTests(tests);
        setCustomResults({});
        setCustomStatus("");
        setIsCustomSession(true);
        setScreen("customtests");
      } else {
        setCustomStatus("Error parsing response — try again");
      }
    } catch (err) {
      setCustomStatus("Error — is Ollama running?");
    }
    setCustomLoading(false);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getStats = () => {
    if (!selectedApp) return {};
    const tests = APP_TEST_PLANS[selectedApp].tests;
    const passed = tests.filter(t => testResults[t.id]?.status === "pass").length;
    const failed = tests.filter(t => testResults[t.id]?.status === "fail").length;
    const pending = tests.length - passed - failed;
    return { total: tests.length, passed, failed, pending };
  };

  const getCustomStats = () => {
    const passed = customTests.filter(t => customResults[t.id]?.status === "pass").length;
    const failed = customTests.filter(t => customResults[t.id]?.status === "fail").length;
    const pending = customTests.length - passed - failed;
    return { total: customTests.length, passed, failed, pending };
  };

  const s = {
    app: { display: "flex", height: "100vh", background: "#1c1c1e", color: "#f5f5f7", fontFamily: "-apple-system, 'SF Pro Text', sans-serif" },
    sidebar: { width: "240px", background: "#161618", borderRight: "0.5px solid #2c2c2e", display: "flex", flexDirection: "column", padding: "20px 0", flexShrink: 0 },
    sidebarTitle: { fontSize: "13px", fontWeight: 700, color: "#f5f5f7", padding: "0 16px 16px", borderBottom: "0.5px solid #2c2c2e", marginBottom: "8px" },
    sidebarItem: (active) => ({ padding: "8px 16px", fontSize: "13px", color: active ? "#f5f5f7" : "#8e8e93", background: active ? "rgba(255,255,255,0.07)" : "transparent", cursor: "pointer", borderLeft: active ? "2px solid #0a84ff" : "2px solid transparent", display: "flex", alignItems: "center", gap: "8px" }),
    main: { flex: 1, display: "flex", flexDirection: "column", overflowY: "auto" },
    topbar: { height: "52px", borderBottom: "0.5px solid #2c2c2e", display: "flex", alignItems: "center", padding: "0 24px", gap: "10px", background: "#1c1c1e", flexShrink: 0 },
    dot: (color) => ({ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }),
    content: { flex: 1, padding: "32px", overflowY: "auto" },
    card: { background: "#2c2c2e", border: "0.5px solid #3a3a3c", borderRadius: "12px", padding: "16px 20px", marginBottom: "10px" },
    btn: (color, small) => ({ padding: small ? "5px 12px" : "9px 18px", borderRadius: "8px", background: color, color: "#fff", border: "none", cursor: "pointer", fontSize: small ? "11px" : "13px", fontWeight: 500, transition: "opacity 0.2s" }),
    tag: (color) => ({ padding: "2px 8px", borderRadius: "4px", background: color + "22", color, fontSize: "11px", fontWeight: 600, border: `0.5px solid ${color}44` }),
    input: { background: "#1c1c1e", border: "0.5px solid #3a3a3c", borderRadius: "8px", color: "#f5f5f7", padding: "10px 12px", fontSize: "13px", outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" },
    textarea: { background: "#1c1c1e", border: "0.5px solid #3a3a3c", borderRadius: "8px", color: "#f5f5f7", padding: "10px 12px", fontSize: "13px", outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box", resize: "vertical" },
    label: { fontSize: "11px", color: "#8e8e93", marginBottom: "6px", display: "block", letterSpacing: "0.04em" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" },
    appCard: { background: "#2c2c2e", border: "0.5px solid #3a3a3c", borderRadius: "16px", padding: "24px 20px", cursor: "pointer", transition: "all 0.2s", textAlign: "center" },
    statBox: (color) => ({ background: color + "11", border: `0.5px solid ${color}33`, borderRadius: "10px", padding: "14px 18px", flex: 1 }),
  };

  const severityColor = (s) => ({ Critical: "#ff453a", High: "#ff9f0a", Medium: "#ffd60a", Low: "#30d158" })[s] || "#636366";
  const statusColor = (status) => ({ pass: "#30d158", fail: "#ff453a", pending: "#636366" })[status] || "#636366";

  const renderTestCard = (test, result, onMark) => (
    <div key={test.id} style={{ ...s.card, borderLeft: `3px solid ${result ? statusColor(result.status) : "#3a3a3c"}` }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", color: "#48484a", fontFamily: "monospace" }}>{test.id}</span>
            <span style={s.tag(severityColor(test.severity))}>{test.severity}</span>
            <span style={{ fontSize: "11px", color: "#8e8e93" }}>{test.area}</span>
            {result?.radarId && <span style={s.tag("#0a84ff")}>{result.radarId}</span>}
          </div>
          <div style={{ fontSize: "14px", fontWeight: 500, marginBottom: "6px" }}>{test.title}</div>
          <div style={{ fontSize: "12px", color: "#8e8e93" }}>Expected: {test.expected}</div>
        </div>
        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
          {!result ? (
            <>
              <button onClick={() => onMark(test.id, "pass")} style={s.btn("#30d158", true)}>✓ Pass</button>
              <button onClick={() => onMark(test.id, "fail")} style={s.btn("#ff453a", true)}>✗ Fail</button>
            </>
          ) : (
            <span style={{ fontSize: "12px", color: statusColor(result.status), fontWeight: 600 }}>
              {result.status === "pass" ? "✓ Passed" : "✗ Failed"}
            </span>
          )}
        </div>
      </div>
      <details style={{ marginTop: "8px" }}>
        <summary style={{ fontSize: "11px", color: "#48484a", cursor: "pointer" }}>View steps ({test.steps.length})</summary>
        <div style={{ marginTop: "6px", paddingLeft: "12px" }}>
          {test.steps.map((step, i) => <div key={i} style={{ fontSize: "12px", color: "#8e8e93", marginBottom: "2px" }}>{i + 1}. {step}</div>)}
        </div>
      </details>
    </div>
  );

  const renderFailureForm = (form, setForm, onSubmit, onCancel, test) => (
    <>
      <div style={s.topbar}>
        <div style={s.dot("#ff453a")} />
        <span style={{ fontSize: "13px", fontWeight: 500 }}>File Radar — {test?.id}</span>
      </div>
      <div style={s.content}>
        <div style={{ maxWidth: "640px" }}>
          <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "4px" }}>File Radar Bug Report</div>
          <div style={{ fontSize: "13px", color: "#8e8e93", marginBottom: "24px" }}>{test?.title}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={s.label}>ACTUAL RESULT *</label>
              <textarea value={form.actualResult} onChange={e => setForm(p => ({ ...p, actualResult: e.target.value }))} placeholder="What actually happened?" rows={3} style={s.textarea} />
            </div>
            <div>
              <label style={s.label}>SEVERITY</label>
              <select value={form.severity} onChange={e => setForm(p => ({ ...p, severity: e.target.value }))} style={{ ...s.input, appearance: "none" }}>
                <option value="">Use default ({test?.severity})</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label style={s.label}>IMPACT</label>
              <textarea value={form.impact} onChange={e => setForm(p => ({ ...p, impact: e.target.value }))} placeholder="Who is affected and how severely?" rows={2} style={s.textarea} />
            </div>
            <div>
              <label style={s.label}>POSSIBLE ROOT CAUSE</label>
              <textarea value={form.rootCause} onChange={e => setForm(p => ({ ...p, rootCause: e.target.value }))} placeholder="Your technical hypothesis..." rows={2} style={s.textarea} />
            </div>
            <div>
              <label style={s.label}>REGRESSION (optional)</label>
              <input value={form.regression} onChange={e => setForm(p => ({ ...p, regression: e.target.value }))} placeholder="e.g. Worked in previous build, broken in 26.5" style={s.input} />
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={onSubmit} disabled={!form.actualResult.trim()} style={{ ...s.btn("#ff453a"), opacity: !form.actualResult.trim() ? 0.3 : 1 }}>File Radar Report</button>
              <button onClick={onCancel} style={s.btn("#3a3a3c")}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderStats = (stats) => (
    <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
      {[
        { label: "Total", value: stats.total, color: "#0a84ff" },
        { label: "Passed", value: stats.passed, color: "#30d158" },
        { label: "Failed", value: stats.failed, color: "#ff453a" },
        { label: "Pending", value: stats.pending, color: "#636366" }
      ].map(stat => (
        <div key={stat.label} style={s.statBox(stat.color)}>
          <div style={{ fontSize: "22px", fontWeight: 700, color: stat.color }}>{stat.value}</div>
          <div style={{ fontSize: "11px", color: "#8e8e93" }}>{stat.label}</div>
        </div>
      ))}
    </div>
  );

  const sidebarItems = [
    { id: "home", label: "App Library", icon: "⊞" },
    { id: "custom", label: "Custom App", icon: "＋" },
    { id: "radars", label: `Radar Portfolio (${radars.length})`, icon: "◎" },
    { id: "system", label: "System Info", icon: "⌥" }
  ];

  return (
    <div style={s.app}>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 0; } textarea::placeholder, input::placeholder { color: #48484a; }`}</style>

      <div style={s.sidebar}>
        <div style={s.sidebarTitle}>
          🍎 Apple QA Radar
          <div style={{ fontSize: "10px", color: "#48484a", marginTop: "2px", fontWeight: 400 }}>QA Command Center</div>
        </div>
        {sidebarItems.map(item => (
          <div key={item.id} style={s.sidebarItem(screen === item.id || (item.id === "home" && (screen === "testplan" || screen === "failureform")) || (item.id === "custom" && (screen === "customtests" || screen === "customfailure")))} onClick={() => setScreen(item.id)}>
            <span>{item.icon}</span>{item.label}
          </div>
        ))}
        {selectedApp && !isCustomSession && (
          <div style={{ marginTop: "16px", padding: "0 16px" }}>
            <div style={{ fontSize: "10px", color: "#48484a", marginBottom: "8px", letterSpacing: "0.06em" }}>CURRENT SESSION</div>
            <div style={{ fontSize: "12px", color: "#0a84ff" }}>{APP_TEST_PLANS[selectedApp].icon} {APP_TEST_PLANS[selectedApp].name}</div>
            {(() => { const st = getStats(); return <div style={{ fontSize: "11px", color: "#8e8e93", marginTop: "4px" }}>✓ {st.passed} · ✗ {st.failed} · {st.pending} pending</div>; })()}
          </div>
        )}
        {isCustomSession && customTests.length > 0 && (
          <div style={{ marginTop: "16px", padding: "0 16px" }}>
            <div style={{ fontSize: "10px", color: "#48484a", marginBottom: "8px", letterSpacing: "0.06em" }}>CUSTOM SESSION</div>
            <div style={{ fontSize: "12px", color: "#5e5ce6" }}>{customApp.icon} {customApp.name}</div>
            {(() => { const st = getCustomStats(); return <div style={{ fontSize: "11px", color: "#8e8e93", marginTop: "4px" }}>✓ {st.passed} · ✗ {st.failed} · {st.pending} pending</div>; })()}
          </div>
        )}
      </div>

      <div style={s.main}>

        {/* Home */}
        {screen === "home" && (
          <>
            <div style={s.topbar}>
              <div style={s.dot("#0a84ff")} />
              <span style={{ fontSize: "13px", fontWeight: 500 }}>App Library</span>
              <span style={{ marginLeft: "auto", fontSize: "11px", color: "#48484a" }}>Select an app to begin testing</span>
            </div>
            <div style={s.content}>
              <div style={{ marginBottom: "24px" }}>
                <div style={{ fontSize: "22px", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "6px" }}>Apple QA Command Center</div>
                <div style={{ fontSize: "13px", color: "#8e8e93" }}>Select an Apple app to generate a test plan, run tests, and file Radar bug reports.</div>
              </div>
              <div style={s.grid}>
                {Object.entries(APP_TEST_PLANS).map(([key, app]) => (
                  <div key={key} style={s.appCard} onClick={() => selectApp(key)}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "#0a84ff"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "#3a3a3c"}>
                    <div style={{ fontSize: "36px", marginBottom: "10px" }}>{app.icon}</div>
                    <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "4px" }}>{app.name}</div>
                    <div style={{ fontSize: "11px", color: "#8e8e93", marginBottom: "10px" }}>v{app.version} · {app.tests.length} tests</div>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", justifyContent: "center" }}>
                      {app.areas.slice(0, 3).map(a => <span key={a} style={{ fontSize: "10px", color: "#48484a", background: "#3a3a3c", padding: "2px 6px", borderRadius: "4px" }}>{a}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Test Plan */}
        {screen === "testplan" && selectedApp && (() => {
          const app = APP_TEST_PLANS[selectedApp];
          const stats = getStats();
          return (
            <>
              <div style={s.topbar}>
                <div style={s.dot("#30d158")} />
                <span style={{ fontSize: "13px", fontWeight: 500 }}>{app.icon} {app.name} — Test Plan</span>
                <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
                  <button onClick={() => setScreen("home")} style={s.btn("#3a3a3c", true)}>← Back</button>
                  {stats.failed > 0 && <button onClick={() => setScreen("radars")} style={s.btn("#ff453a", true)}>Radars ({stats.failed})</button>}
                </div>
              </div>
              <div style={s.content}>
                {renderStats(stats)}
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
            <div style={s.topbar}>
              <div style={s.dot("#5e5ce6")} />
              <span style={{ fontSize: "13px", fontWeight: 500 }}>Custom App Testing</span>
              {customStatus && <span style={{ fontSize: "12px", color: "#ffd60a", marginLeft: "8px" }}>{customStatus}</span>}
            </div>
            <div style={s.content}>
              <div style={{ maxWidth: "640px" }}>
                <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "4px", letterSpacing: "-0.01em" }}>Test Any Apple App</div>
                <div style={{ fontSize: "13px", color: "#8e8e93", marginBottom: "24px" }}>Enter any app name and describe what you want to test. The AI generates a complete test plan automatically — perfect for beta software, new features, or UI testing.</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={s.label}>APP NAME *</label>
                      <input value={customApp.name} onChange={e => setCustomApp(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Freeform, Shortcuts, TestFlight" style={s.input} />
                    </div>
                    <div style={{ width: "120px" }}>
                      <label style={s.label}>VERSION</label>
                      <input value={customApp.version} onChange={e => setCustomApp(p => ({ ...p, version: e.target.value }))} placeholder="e.g. Beta 3" style={s.input} />
                    </div>
                  </div>
                  <div>
                    <label style={s.label}>WHAT TO TEST *</label>
                    <textarea value={customApp.description} onChange={e => setCustomApp(p => ({ ...p, description: e.target.value }))} placeholder="Describe the feature or area you want to test. Example: Test the new collaboration features in Freeform beta including real-time drawing sync, participant management, and iCloud sharing." rows={5} style={s.textarea} />
                  </div>
                  <button onClick={generateCustomTests} disabled={customLoading || !customApp.name.trim() || !customApp.description.trim()} style={{ ...s.btn("#5e5ce6"), opacity: (customLoading || !customApp.name.trim() || !customApp.description.trim()) ? 0.3 : 1, alignSelf: "flex-start" }}>
                    {customLoading ? customStatus : "Generate Test Plan"}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Custom Tests */}
        {screen === "customtests" && customTests.length > 0 && (() => {
          const stats = getCustomStats();
          return (
            <>
              <div style={s.topbar}>
                <div style={s.dot("#5e5ce6")} />
                <span style={{ fontSize: "13px", fontWeight: 500 }}>{customApp.icon} {customApp.name} — AI Generated Test Plan</span>
                <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
                  <button onClick={() => setScreen("custom")} style={s.btn("#3a3a3c", true)}>← New App</button>
                  {stats.failed > 0 && <button onClick={() => setScreen("radars")} style={s.btn("#ff453a", true)}>Radars ({stats.failed})</button>}
                </div>
              </div>
              <div style={s.content}>
                <div style={{ ...s.card, background: "#5e5ce611", border: "0.5px solid #5e5ce633", marginBottom: "16px" }}>
                  <div style={{ fontSize: "11px", color: "#5e5ce6", fontWeight: 600, marginBottom: "4px" }}>AI GENERATED · {customApp.name} {customApp.version}</div>
                  <div style={{ fontSize: "12px", color: "#8e8e93" }}>{customApp.description}</div>
                </div>
                {renderStats(stats)}
                {customTests.map(test => renderTestCard(test, customResults[test.id], markCustomTest))}
              </div>
            </>
          );
        })()}

        {/* Custom Failure Form */}
        {screen === "customfailure" && customActive && (() => {
          const test = customTests.find(t => t.id === customActive);
          return renderFailureForm(customFailureForm, setCustomFailureForm, submitCustomFailure, () => setScreen("customtests"), test);
        })()}

        {/* Radar Portfolio */}
        {screen === "radars" && (
          <>
            <div style={s.topbar}>
              <div style={s.dot("#ff9f0a")} />
              <span style={{ fontSize: "13px", fontWeight: 500 }}>Radar Portfolio</span>
              <span style={{ marginLeft: "auto", fontSize: "11px", color: "#48484a" }}>{radars.length} radar{radars.length !== 1 ? "s" : ""} filed</span>
            </div>
            <div style={s.content}>
              {radars.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#48484a" }}>
                  <div style={{ fontSize: "32px", marginBottom: "12px" }}>◎</div>
                  <div style={{ fontSize: "14px" }}>No radars filed yet</div>
                  <div style={{ fontSize: "12px", marginTop: "4px" }}>Run tests and mark failures to generate Radar reports</div>
                </div>
              ) : (
                radars.map(radar => (
                  <div key={radar.id} style={s.card}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                      <span style={s.tag(severityColor(radar.severity))}>{radar.severity}</span>
                      <span style={{ fontSize: "12px", fontFamily: "monospace", color: "#0a84ff" }}>{radar.id}</span>
                      <span style={{ fontSize: "11px", color: "#48484a" }}>{radar.appName} · {radar.date}</span>
                      <button onClick={() => copyToClipboard(radar.report, radar.id)} style={{ ...s.btn("#3a3a3c", true), marginLeft: "auto" }}>
                        {copied === radar.id ? "✓ Copied!" : "Copy Report"}
                      </button>
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: 500, marginBottom: "8px" }}>{radar.title}</div>
                    {radarView === radar.id ? (
                      <>
                        <pre style={{ fontSize: "11px", color: "#8e8e93", whiteSpace: "pre-wrap", fontFamily: "monospace", background: "#1c1c1e", padding: "12px", borderRadius: "8px", lineHeight: 1.6 }}>{radar.report}</pre>
                        <button onClick={() => setRadarView(null)} style={{ ...s.btn("#3a3a3c", true), marginTop: "8px" }}>Hide</button>
                      </>
                    ) : (
                      <button onClick={() => setRadarView(radar.id)} style={s.btn("#3a3a3c", true)}>View Full Report</button>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* System Info */}
        {screen === "system" && (
          <>
            <div style={s.topbar}>
              <div style={s.dot("#30d158")} />
              <span style={{ fontSize: "13px", fontWeight: 500 }}>System Information</span>
            </div>
            <div style={s.content}>
              <div style={{ maxWidth: "480px" }}>
                <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px" }}>Auto-Detected Environment</div>
                {Object.entries(SYSTEM_INFO).map(([key, val]) => (
                  <div key={key} style={{ ...s.card, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px" }}>
                    <span style={{ fontSize: "12px", color: "#8e8e93", textTransform: "uppercase", letterSpacing: "0.04em" }}>{key}</span>
                    <span style={{ fontSize: "13px", color: "#f5f5f7", fontFamily: "monospace" }}>{val}</span>
                  </div>
                ))}
                <div style={{ marginTop: "16px", fontSize: "11px", color: "#48484a" }}>System info is automatically included in every Radar report you file.</div>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}