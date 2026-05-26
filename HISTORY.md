# Project History & Origin

This document captures the history of how the **Nubbly Plant Identifier** project came to be and its evolution within the Antigravity IDE ecosystem.

## 1. The Origin: Transition from Nubbly Finance Analytics
* **Date:** May 26, 2026
* **Previous Context:** The user was working on a mobile finance application called **Nubbly Finance Analytics** (located in `c:\Users\ianbr\OneDrive\Documents\Antigravity`).
* **The Inquiry:** During the conversation in `6a1d0184-82b6-434e-a2ba-704556125c32`, we discussed:
  - How to build and distribute iOS versions of React Native/Expo apps using EAS Build.
  - Options for testing on simulators vs. physical iOS/iPadOS devices (using Ad-Hoc provisioning profiles).
  - Apple TestFlight distribution without needing individual device UDID registrations (Option 3).
  - The process for initializing a new, separate mobile application.

## 2. Setting Up the New Project (Option 2)
The user inquired about starting a brand-new project on a different mobile app within the Antigravity IDE. We discussed two paths:
1. **Option 1:** Create it as a subfolder inside the current workspace.
2. **Option 2:** Initialize an entirely separate directory using the Expo CLI and open it as a fresh workspace.

The user chose **Option 2** and executed:
```bash
npx create-expo-app@latest ./
```
inside a new directory, creating **NubblyPlantIdentifier** (`c:\Users\ianbr\NubblyPlantIdentifier`).

## 3. The New Workspace
The user opened `c:\Users\ianbr\NubblyPlantIdentifier` in the IDE. This project is configured with:
- **Expo Framework:** `~56.0.5`
- **React version:** `19.2.3`
- **React Native version:** `0.85.3`
- **Routing:** File-based routing using `expo-router (~56.2.7)`
- **Styling & Assets:** Native styling with modern design frameworks, Expo symbols, images, and reanimated integration.

## 4. Current Directive
We are aligning on the application's full specification (**the spec**) before any source code is written, ensuring a well-planned, professional architecture for the **Nubbly Plant Identifier** mobile application.
