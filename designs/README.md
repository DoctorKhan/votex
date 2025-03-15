# Design Documents Directory

This directory contains design documents for approved proposals that are pending implementation.

## Structure

Each approved proposal gets its own subdirectory named after the proposal's slug (a URL-friendly version of the title). Inside each subdirectory, there is a `design.md` file that contains the design document.

Example:
```
designs/
├── README.md
├── add-dark-mode/
│   └── design.md
└── improve-search-functionality/
    └── design.md
```

## Lifecycle

1. When a proposal is approved (receives enough votes), a design document is automatically created in this directory.
2. The design document serves as a specification for implementing the proposal using test-driven development.
3. Once the implementation is complete and tests are passing, the design document is automatically deleted.

## Design Document Template

Design documents follow a standard template that includes:

- Overview
- Requirements
- Implementation Plan
- Test-Driven Development Approach
- Technical Considerations
- Resources Required
- Timeline
- Status

The template can be found at `src/templates/design-document-template.md`.

## Automation

The creation and deletion of design documents is handled by the `PersonaMonitorIntegration` class, which integrates the Jamie Developer persona with the Conversation Monitor Service.

To manually trigger the process:

```bash
./activate-jamie.sh
```

or

```bash
./activate-jamie-node.sh