# Firebase Note Taking App

A comprehensive note-taking application built with React and Firebase, offering advanced note management capabilities including rich text editing, organization with notebooks, favorites, trash management, PDF export, and sharing functionality.

## Features

- **User Authentication**: Secure login and registration with Firebase Authentication and Google Sign-in
- **Rich Text Editing**: Comprehensive text formatting using React-Quill
- **Note Organization**: Categorize notes with notebooks and tags
- **Favorites**: Mark important notes as favorites for quick access
- **Trash Management**: Soft delete functionality with option to restore or permanently delete notes
- **PDF Export**: Export notes as PDF documents for sharing or printing
- **Note Sharing**: Share notes with other users via unique links
- **Responsive Design**: Mobile-friendly interface that works across devices

## Firebase Setup

To use this application, you need to configure Firebase:

1. **Create a Firebase Project**:
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one
   - Enable Firestore Database and Authentication services

2. **Configure Firestore Security Rules**:
   - Go to Firestore Database > Rules
   - Update your rules to allow read/write access for authenticated users:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

3. **Enable Authentication**:
   - Go to Authentication > Sign-in method
   - Enable Email/Password and Google authentication
   - Add your app's domain to the authorized domains list

4. **Set Up Environment Variables**:
   - Create a `.env.local` file in the root directory
   - Add your Firebase configuration:
   ```
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure Firebase as described above
4. Start the development server: `npm run dev`

## Technologies Used

- React
- Firebase Authentication & Firestore
- React-Quill for rich text editing
- HTML2PDF for PDF export
- Express for backend API support
- Vanilla CSS for styling
