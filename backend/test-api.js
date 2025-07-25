import dotenv from 'dotenv';
dotenv.config();

async function testDeepSeekAPI() {
  console.log('🔑 Testing Groq API...');
  console.log('🔑 API Key present:', !!process.env.GROQ_API_KEY);
  console.log('🔑 API Key starts with:', process.env.GROQ_API_KEY?.substring(0, 10) + '...');
  
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are Itsuki Nakano. Respond briefly."
          },
          {
            role: "user",
            content: "Hello!"
          }
        ],
        max_tokens: 100,
        temperature: 0.8
      })
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Groq API Error:', response.status, response.statusText);
      console.error('❌ Error response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Success! Response:', data);
    console.log('🍰 Itsuki says:', data.choices?.[0]?.message?.content);

  } catch (error) {
    console.error('💥 Network/fetch error:', error);
  }
}

testDeepSeekAPI();
