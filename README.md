# SnapSense

SnapSense is a small React Native / Expo app for organising screenshots. It imports
screenshots from an Android device, stores their metadata locally, and lets a user
search, filter, mark important items, and schedule reminders. Optional AI analysis
extracts the visible text and gives each screenshot a category.

## Run the project

1. Install the Expo Go app on an Android phone.
2. In this folder, run `npm install` and then `npm start`.
3. Scan the QR code shown in the terminal.
4. Allow photo access. If the Screenshots album is not available, press **Add** and choose images manually.

Before opening a pull request, run `npm run typecheck`.

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

The app deliberately uses two screens and a single `selectedId` state value instead
of a navigation library. This keeps the project focused and makes the data flow easy
to explain.

## How the data flows

1. `useGallery` requests photo permission and reads the phone's Screenshots album.
2. `database.ts` stores each image URI and its creation date in SQLite. `INSERT OR IGNORE` means a repeated sync does not erase an existing analysis.
3. The gallery asks SQLite for rows that match the current search text and filters.
4. When a screenshot opens, `useDetail` loads it. If it has never been analysed, it sends a resized image to Gemini once and saves the result locally.
5. Favourite and reminder actions update the same SQLite row. The notification ID is also saved so a reminder can be cancelled later.

## Useful review answers

**Why use SQLite?** Screenshot records need to remain after the app closes. SQLite is local, fast, and works without a server.

**Why keep AI in a service?** The screen should only display UI. Keeping the network request in `services/gemini.ts` means it can be replaced later without rewriting the screen.

**What happens if a user denies photo permission?** The gallery shows an Add option, which uses the image picker instead of reading the whole gallery.

**Why is the Gemini key not production-ready?** Variables beginning with `EXPO_PUBLIC_` are included in an Expo app bundle. A production app would call a backend that keeps the key secret.

## Known limitations

- AI analysis needs internet and a valid API key; saved results remain available locally afterwards.
- Reading a full screenshots album can behave differently across Android devices, so the manual picker is included as a fallback.
- The project uses local notifications only; it does not send cloud notifications.
