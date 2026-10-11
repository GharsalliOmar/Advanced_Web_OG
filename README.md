# Project ReMotion – Investigation Portal

Investigate the failure of an AI-assisted rehabilitation robot.

## About

Project ReMotion is a browser-based investigation platform built around a fictional incident.
During a pre-demonstration calibration test, the AI-assisted rehabilitation robot **ReMotion**
loaded the wrong calibration profile and triggered its emergency stop. This application lets an
investigator review the evidence, people, locations, and timeline surrounding the incident, and
build up a working hypothesis about what happened.

This repository contains an existing vanilla-JavaScript (no frameworks used) investigation application. The system is
functional but has accumulated technical debt and inconsistent implementation decisions. Your task
during the course will be to analyse, maintain, refactor, migrate, and extend it.

## Running the application

This application uses `fetch()` to load its case data from local JSON files, so it must be served
over HTTP — opening `index.html` directly from the filesystem (`file://`) will not work in most
browsers.

Any static file server will do. For example, from the project root:

```bash
# Python 3
python -m http.server 8080

# Node.js (no install required)
npx serve .

# VS Code
# Use the "Live Server" extension
```

Then open `http://localhost:8080` (or whatever port your server prints) in your browser.

## Features

- **Dashboard** — case summary and key statistics calculated from the loaded case data.
- **Evidence catalogue** — search, filter (by type, person, location, status, relevance), sort,
  bookmark, and open detailed evidence records.
- **People & Locations** — profile cards for the investigation team and the six key locations.
- **Timeline** — chronological view of case events with filtering and links to related evidence.
- **Investigator workspace** — bookmarked evidence, personal notes, and a hypothesis draft form.
  Workspace data is saved to your browser's local storage and will still be there when you reload
  the page.

## React source structure (`src/`)

The React version (`react.html`, migration since Exercise 3) is organised **by feature**, not by
file type:

```
src/
├─ main.tsx              entry point (providers + <App>)
├─ shell/                app frame: App, router, Header/NavBar/NavButton, Footer,
│                        LoadingOverlay, NotFoundPage, route definitions
├─ data/                 shared data: CaseDataProvider / WorkspaceProvider + their hooks
├─ components/           shared UI used by 2+ features: Badge, PagePlaceholder
└─ features/
   ├─ dashboard/         DashboardPage + its cards/lists (IntroCard, StatCard, MiniListItem, …)
   ├─ people-locations/  PeoplePage, PersonCard, LocationCard, Card
   ├─ timeline/          TimelinePage, TimelineFilters, TimelineList, TimelineItem
   ├─ evidence/          EvidencePage (placeholder until Exercise 5)
   └─ workspace/         WorkspacePage (placeholder until Exercise 5)
```

**Rule for shared vs. feature-local:** a file starts in the feature folder that uses it. It moves to
`components/` (UI) or `data/` (state/data) only once a **second** feature imports it. Example:
`Badge` is used by the dashboard _and_ the timeline → `components/`. `Card` is generic, but only
People & Locations uses it → stays in `features/people-locations/`. Features never import from
each other, only from `shell/`, `data/` and `components/`.

## Browser requirements

A recent version of any evergreen desktop browser (Chrome, Firefox, Edge, Safari). JavaScript must
be enabled. The layout targets common desktop and tablet widths.

## Project status

This is an existing brownfield application, not a fresh scaffold. It works for everyday use, but
you should expect to find rough edges, inconsistent patterns, and a handful of bugs as you work
with it — that discovery process is part of the course.
