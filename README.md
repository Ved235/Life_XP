# Productivity XP Tracker

🏆 A web application to track and log daily activities, assign productivity points (XP), and display a global leaderboard.

## Features

- Log daily activities and calculate XP based on their significance, effort, and impact
- View a global leaderboard of top users
- Responsive design for both desktop and mobile devices

## Project Structure

```
.
├── .env
├── .gitattributes
├── .gitignore
├── index.html
├── index.js
├── package.json
├── public/
│   ├── script.js
│   └── style.css
└── vercel.json
```

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/productivity-xp-tracker.git
   cd productivity-xp-tracker
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory and add your configuration:
   ```sh
   FIREBASE_TYPE=service_account
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY_ID=your_private_key_id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=your_client_email
   FIREBASE_CLIENT_ID=your_client_id
   FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
   FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
   FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
   FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your_client_email
   GROQ_API_KEY=your_groq_api_key
   ```

4. Start the development server:
   ```sh
   npm start
   ```

   The application will be available at `http://localhost:3000`.

## Deployment

This project is configured for deployment on Vercel. The `vercel.json` configuration file in the root directory contains:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "./index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ]
}
```

## Usage

1. Navigate to `http://localhost:3000` in your web browser
2. Enter your username and log your daily activities
3. View your XP and the global leaderboard
