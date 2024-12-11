import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import admin from 'firebase-admin';
import cors from 'cors';
dotenv.config();
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const leaderboardRef = db.collection('leaderboard');

const generateXP = async (userInput) => {
  const apiKey = process.env.GROQ_API_KEY;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        {
          role: "system",
          content: `You are an AI designed to analyze daily activities and assign productivity points (XP) based on their significance, effort, and impact. Your goal is to encourage both focused deep work and diverse, balanced productivity. Respond with just the XP value.

  Scoring Guidelines:

  1. Base XP Calculation:
  - Each activity earns 50 XP per hour
  - For activities in the same category, combine hours first, then apply multiplier
  - Maximum of 400 base points before multipliers
  - Cap of 500 total XP per submission

  2. Activity Categories & Multipliers (apply after combining hours):
  FOCUSED WORK (1.5x multiplier)
  - Deep intellectual work (studying, research, mathematics)
  - Creative work (writing, coding, design)
  - Professional work requiring high concentration
  Example: 3h math + 2h coding = 5h × 50 XP × 1.5 = 375 XP

  PHYSICAL ACTIVITIES (1.3x multiplier)
  - Exercise
  - Sports
  - Physical labor

  SKILL DEVELOPMENT (1.2x multiplier)
  - Learning new skills
  - Practice sessions
  - Workshop participation

  MAINTENANCE (1.0x multiplier)
  - Regular tasks
  - Organization
  - Basic self-care

  3. Non-Scoring Activities:
  - Entertainment (gaming, TV, movies)
  - Passive consumption
  - Leisure activities without skill development

  4. Bonus Points:
  Diversity Bonus: +50 XP for combining 2+ different categories
  Achievement Bonus: +40 XP for completing specific goals

  Example Calculation:
  "3 hours of mathematics + 2 hours of coding + 1 hour gaming"
  - Math + Coding: 5 hours in Focused Work category
  - Base: 250 XP (5 hours × 50)
  - Category multiplier: 1.5x
  - Final: 375 XP (gaming doesn't add XP)

  Respond with just the XP value.

`,
        },
        {
          role: "user",
          content: userInput,
        },
      ],
      model: "llama3-70b-8192",
      temperature: 0.5,
      max_tokens: 10,
    }),
  });

  const data = await response.json();
  if (data.choices && data.choices.length > 0) {
    return parseInt(data.choices[0].message.content.trim(), 10) || 0;
  } else {
    throw new Error("Failed to generate XP");
  }
};


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

app.post('/log-activity', async (req, res) => {
  const { username, userActivity } = req.body;

  try {
    const xp = await generateXP(userActivity);

    const userDoc = leaderboardRef.doc(username);
    const userData = await userDoc.get();

    if (userData.exists) {
      const currentXP = userData.data().xp || 0;
      if (xp > currentXP) {
        await userDoc.update({ xp });
        console.log(`Updated XP for ${username}: ${xp}`);
      } else {
        console.log(`No update needed for ${username}, current XP: ${currentXP}, new XP: ${xp}`);
      }
    } else {
      await userDoc.set({ xp });
      console.log(`Created new user ${username} with XP: ${xp}`);
    }

    const updatedData = (await userDoc.get()).data();
    res.json({ message: 'Activity logged successfully!', xp: xp });
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({ message: 'Error logging activity', error: error.message });
  }
});


app.get('/leaderboard', async (req, res) => {
  try {
    const snapshot = await leaderboardRef.orderBy('xp', 'desc').limit(10).get();
    const leaderboard = snapshot.docs.map(doc => ({
      username: doc.id,
      xp: doc.data().xp,
    }));
    res.json({ leaderboard });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching leaderboard', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
