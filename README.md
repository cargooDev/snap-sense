# SnapSense (made with the help of AI)

SnapSense is a small React Native / Expo app for organising screenshots. It imports
screenshots from an Android device, stores their metadata locally, and lets a user
search, filter, mark important items, and schedule reminders. Optional AI analysis
extracts the visible text and gives each screenshot a category.

## Run the project

1. Install the Expo Go app on an Android phone.
2. In this folder, run `npm install` and then `npm start`.
3. Scan the QR code shown in the terminal.
4. Allow photo access. If the Screenshots album is not available, press **Add** and choose images manually.
5. IF none of this works ask AI bruh

Before opening a pull request, run `npm run typecheck` (not worth it).

AI analysis is optional for the rest of the app. To enable it, copy `.env.example`
to `.env`, then set `EXPO_PUBLIC_GEMINI_API_KEY` to a Gemini API key before starting Expo.

For the review, add a receipt, timetable, or payment screenshot before opening the app.

## Project structure

```
App.tsx                 switches between the gallery and detail screens
src/screens/            React Native UI components
src/viewmodels/         screen state and user actions
src/db/database.ts      SQLite database queries
src/services/           phone gallery, notification, and AI integration
src/types.ts            shared TypeScript types
```
