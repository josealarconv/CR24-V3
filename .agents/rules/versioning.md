# Rule: Incremental Versioning Protocol

## Overview
Every feature update, bug fix, or architectural change pushed to production MUST increment the application version number.

## Protocol Rules
1. **Semantic Versioning Structure**:
   - `vX.Y.Z` where `X` is major, `Y` is minor feature update, `Z` is patch/fix.
2. **Synchronized Update Locations**:
   - `package.json`: `"version": "X.Y.Z"`
   - `src/config/assets.js`: `APP_VERSION: 'vX.Y.Z'`
3. **Display Rules**:
   - The version MUST be rendered discreetly in Option A: Bottom of the Left Vertical Sidebar in `Header.jsx`.
   - Font family MUST be `font-mono` (`IBM Plex Mono`).
