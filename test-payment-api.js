// Quick test of the payment API endpoint
async function testPaymentAPI() {
  const testSessionId = 'test-' + Date.now();

  try {
    console.log('🧪 Testing payment API with session ID:', testSessionId);

    const response = await fetch('https://login-selfie-v01-light.vercel.app/api/create-payment-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionId: testSessionId }),
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log('📊 Response data:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('✅ Payment API test PASSED');
      console.log('💳 Payment URL:', data.paymentUrl);
      return true;
    } else {
      console.log('❌ Payment API test FAILED');
      console.log('🐛 Error:', data.error);
      return false;
    }
  } catch (error) {
    console.log('💥 Payment API test ERROR:', error.message);
    return false;
  }
}

// Run the test
testPaymentAPI().then(success => {
  console.log(success ? '🎉 TEST PASSED' : '💔 TEST FAILED');
});