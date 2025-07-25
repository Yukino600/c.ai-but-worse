import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

// Load environment variables
dotenv.config();

const testAIResponse = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find the user (Madridsta)
    const user = await User.findOne({ username: 'Madridsta' });
    const itsuki = await User.findOne({ username: 'Itsuki_Nakano' });
    
    if (!user || !itsuki) {
      console.log('❌ Users not found');
      return;
    }

    // Find conversation
    const conversation = await Conversation.findOne({
      participants: { $all: [user._id, itsuki._id] },
      isGroup: false
    });

    if (!conversation) {
      console.log('❌ Conversation not found');
      return;
    }

    console.log('✅ Found conversation:', conversation._id);

    // Test the AI message endpoint by simulating the request
    const testMessage = "Hello there!";
    
    console.log('📝 Simulating AI message request...');
    console.log('📝 Conversation ID:', conversation._id);
    console.log('📝 Message:', testMessage);
    console.log('📝 User ID:', user._id);

    // Manually call the AI route logic to see what happens
    const requestData = {
      conversationId: conversation._id,
      message: testMessage
    };

    // Simulate the API call
    const apiUrl = 'http://localhost:5000/api/ai/message';
    console.log('🚀 Testing API endpoint...');

    // First get a valid token for the user
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'madrid@gmail.com',
        password: 'madrid123' // Common password pattern
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed, status:', loginResponse.status);
      const errorText = await loginResponse.text();
      console.log('❌ Login error:', errorText);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');

    // Now test the AI message endpoint
    const messageResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      },
      body: JSON.stringify(requestData)
    });

    console.log('📡 AI message response status:', messageResponse.status);
    
    if (!messageResponse.ok) {
      const errorText = await messageResponse.text();
      console.log('❌ AI message error:', errorText);
    } else {
      const responseData = await messageResponse.json();
      console.log('✅ AI responded:', responseData.aiMessage?.content?.substring(0, 100) + '...');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
};

testAIResponse();
