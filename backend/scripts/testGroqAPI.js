import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

// Load environment variables
dotenv.config();

const testGroqAPI = async () => {
  try {
    console.log('🔑 Testing Groq API directly...');
    console.log('🔑 API Key present:', !!process.env.GROQ_API_KEY);
    console.log('🔑 API Key length:', process.env.GROQ_API_KEY?.length);

    const testMessage = "Hello, how are you?";
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: "You are Itsuki Nakano from The Quintessential Quintuplets. Reply briefly and in character."
          },
          {
            role: "user",
            content: testMessage
          }
        ],
        max_tokens: 150,
        temperature: 0.8,
        stream: false
      })
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Groq API Error:', response.status, response.statusText);
      console.error('❌ Error response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Groq API response:', data.choices?.[0]?.message?.content);

  } catch (error) {
    console.error('❌ Error testing Groq API:', error);
  }
};

testGroqAPI();
