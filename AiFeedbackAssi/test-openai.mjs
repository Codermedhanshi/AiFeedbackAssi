// test-openai.mjs
import fetch from 'node-fetch';

const run = async () => {
  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });
    const data = await res.json();
    console.log('✅ Connection successful:', data);
  } catch (err) {
    console.error('❌ Connection failed:', err);
  }
};

run();