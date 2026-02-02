# Study Tree Mobile App

React Native app built with Expo for the Study Tree project.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Update API URLs in the code:
   - For local development on a physical device, replace `localhost` with your computer's IP address in:
     - `app/login.tsx`
     - `app/trees.tsx`

3. Start the development server:
   ```bash
   npm start
   ```

## Development

- Press `i` to open iOS simulator
- Press `a` to open Android emulator
- Scan the QR code with Expo Go app on your device

## Notes

- Full tree editor UI is not yet implemented (use web app)
- This is a basic shell demonstrating:
  - Authentication with secure token storage
  - API integration using shared package
  - Basic navigation
  - Tree listing

## TODO

- Implement full tree/node editor
- Add offline support
- Implement AI features
- Add file attachments
- Improve UI/UX
