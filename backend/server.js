import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './Routes/authRoutes.js';
import userRoutes from './Routes/userRoutes.js';
import conversationRoutes from './Routes/conversationRoutes.js';
import messageRoutes from './Routes/messageRoutes.js';
import chatRoutes from './Routes/chatRoutes.js';
// import ttsRoutes from './Routes/ttsRoutes.js';  // REMOVED: No longer needed since VoiceOver is disabled
import aiRoutes from './Routes/aiRoutes.js';
import characterRoutes from './Routes/characterRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

// ES modules workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment configuration
dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log(' Environment Debug:');
console.log(`   GROQ_API_KEY present: ${!!process.env.GROQ_API_KEY}`);
console.log(`   GROQ_API_KEY length: ${process.env.GROQ_API_KEY?.length || 0}`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`   Current working directory: ${process.cwd()}`);

const app = express();

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Test route
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Connect to MongoDB
console.log(' Attempting to connect to MongoDB...');
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/chat', chatRoutes);
// app.use('/api/tts', ttsRoutes);  // REMOVED: No longer needed since VoiceOver is disabled
app.use('/api/ai', aiRoutes);
app.use('/api/characters', characterRoutes);

// Serve avatar images
app.use('/avatars', express.static(path.join(__dirname, '..', 'frontend', 'src', 'avatars')));
app.use('/uploads/avatars', express.static(path.join(__dirname, 'uploads', 'avatars')));

// DISABLED: Serve generated audio files - Python TTS functionality disabled
// app.use('/generated-audio', express.static(path.join(__dirname, 'generated-audio')));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error occurred:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS enabled for: ${corsOptions.origin}`);
  console.log(`📁 Static files served from:`);
  console.log(`   - Avatars: ${path.join(__dirname, '..', 'frontend', 'src', 'avatars')}`);
  // console.log(`   - Generated Audio: ${path.join(__dirname, 'generated-audio')}`);  // DISABLED: Python TTS
});

export default app;
