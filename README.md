# Apple QA Command Center

A professional QA testing and Radar bug filing system built specifically for Apple ecosystem applications.

## What This Is

A React-based QA command center that mirrors the workflow of Apple's internal QA engineers. Select any Apple app, run through a structured test plan, mark pass/fail results, and automatically generate Radar-style bug reports for any failures found.

## Features

- App Library with test plans for Mail, Safari, Messages, Notes, and Calendar
- Structured test cases covering functional, accessibility, performance, and edge case scenarios
- Interactive test runner — mark each test as Pass or Fail in real time
- Automatic Radar report generation for failed tests
- Auto-detects system environment (OS, browser, machine, screen resolution)
- Radar Portfolio — stores all filed bug reports in one place
- Copy any Radar report to clipboard instantly

## Tech Stack

- React + Vite
- Apple-grade dark UI inspired by macOS design system
- No external dependencies — runs entirely in the browser

## Apps Covered

- Mail (12 test cases)
- Safari (10 test cases)
- Messages (8 test cases)
- Notes (6 test cases)
- Calendar (6 test cases)

## How It Works

1. Select an Apple app from the App Library
2. Review the auto-generated test plan
3. Run each test on your Mac and mark Pass or Fail
4. For failures, fill in the actual result and root cause
5. A complete Radar-style bug report is generated automatically
6. View and copy all filed Radars from the Radar Portfolio

## Why This Exists

Apple QA engineers file bugs using an internal system called Radar. This tool simulates that workflow, allowing me to build a portfolio of real bugs found in Apple applications using the same structured approach Apple uses internally.

## Author

Built by Deandre Medrano
