/**
 * NIXT Authentication Debug Script
 * نسخ هذا الكود وتشغيله في Console المتصفح للتشخيص السريع
 */

(function() {
  console.clear();
  console.log('%c🔐 NIXT Authentication Debug', 'font-size: 20px; font-weight: bold; color: #3b82f6;');
  console.log('%c=================================', 'color: #6b7280;');
  
  // 1. Check localStorage tokens
  console.log('\n%c1️⃣ localStorage Tokens:', 'font-size: 16px; font-weight: bold; color: #10b981;');
  const token = localStorage.getItem('token');
  const authToken = localStorage.getItem('auth_token');
  
  console.log('  token:', token ? '✅ Present' : '❌ Missing');
  console.log('  auth_token:', authToken ? '✅ Present' : '❌ Missing');
  
  // Auto-sync if needed
  if (token && !authToken) {
    console.log('%c  🔄 Auto-syncing: token → auth_token', 'color: #f59e0b;');
    localStorage.setItem('auth_token', token);
    console.log('%c  ✅ Synced!', 'color: #10b981;');
  }
  
  // 2. Decode token
  const activeToken = authToken || token;
  if (activeToken) {
    console.log('\n%c2️⃣ Decoded Token:', 'font-size: 16px; font-weight: bold; color: #10b981;');
    try {
      const parts = activeToken.split('.');
      const payload = JSON.parse(atob(parts[1]));
      
      console.log('  User ID:', payload.user_id);
      console.log('  Email:', payload.email);
      console.log('  Role:', payload.role);
      console.log('  Permissions:', payload.permissions || 'N/A');
      
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = payload.exp - now;
      const isExpired = expiresIn <= 0;
      
      console.log('  Expires In:', isExpired ? '❌ EXPIRED' : `${Math.floor(expiresIn / 60)}m ${expiresIn % 60}s`);
      console.log('  Expires At:', new Date(payload.exp * 1000).toLocaleString());
      console.log('  Is Valid:', isExpired ? '❌ No' : '✅ Yes');
      
      if (isExpired) {
        console.log('%c  ⚠️ TOKEN EXPIRED! Please login again.', 'color: #ef4444; font-weight: bold;');
      }
    } catch (e) {
      console.error('  ❌ Failed to decode token:', e);
    }
  } else {
    console.log('\n%c2️⃣ No Token Found!', 'font-size: 16px; font-weight: bold; color: #ef4444;');
    console.log('%c  Please login first.', 'color: #f59e0b;');
  }
  
  // 3. Test API Connection
  console.log('\n%c3️⃣ Testing API Connection...', 'font-size: 16px; font-weight: bold; color: #10b981;');
  const apiUrl = 'http://localhost:3003/api/v1/projects/statistics';
  
  fetch(apiUrl, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${activeToken || ''}`
    }
  })
  .then(response => {
    console.log('  Status:', response.status, response.statusText);
    console.log('  Success:', response.ok ? '✅ Yes' : '❌ No');
    return response.json();
  })
  .then(data => {
    console.log('  Response:', data);
    
    if (data.success) {
      console.log('%c  ✅ API Connection Successful!', 'color: #10b981; font-weight: bold;');
    } else {
      console.log('%c  ❌ API Request Failed:', 'color: #ef4444; font-weight: bold;');
      console.log('  Error:', data.message || data.error);
      
      if (data.error === 'MISSING_PERMISSIONS') {
        console.log('%c  💡 Solution: Check user permissions in database', 'color: #f59e0b;');
      }
    }
  })
  .catch(error => {
    console.error('  ❌ API Connection Error:', error.message);
  });
  
  // 4. Test WebSocket Connection
  console.log('\n%c4️⃣ Testing WebSocket Connection...', 'font-size: 16px; font-weight: bold; color: #10b981;');
  const wsUrl = `ws://localhost:8080/ws/chat?token=${activeToken || ''}`;
  
  try {
    const ws = new WebSocket(wsUrl);
    const startTime = Date.now();
    
    ws.onopen = () => {
      const latency = Date.now() - startTime;
      console.log('%c  ✅ WebSocket Connected!', 'color: #10b981; font-weight: bold;');
      console.log('  Latency:', latency + 'ms');
      ws.close();
    };
    
    ws.onerror = (error) => {
      console.error('%c  ❌ WebSocket Connection Failed!', 'color: #ef4444; font-weight: bold;');
      console.error('  Make sure WebSocket server is running on port 8080');
    };
    
    setTimeout(() => {
      if (ws.readyState !== WebSocket.OPEN) {
        console.error('%c  ⏱️ WebSocket Connection Timeout', 'color: #f59e0b; font-weight: bold;');
        ws.close();
      }
    }, 5000);
  } catch (error) {
    console.error('  ❌ WebSocket Error:', error.message);
  }
  
  // 5. Quick Fixes
  console.log('\n%c5️⃣ Quick Fixes:', 'font-size: 16px; font-weight: bold; color: #10b981;');
  console.log('%c  Run these commands if you have issues:', 'color: #6b7280;');
  console.log('');
  console.log('%c  // Sync tokens', 'color: #8b5cf6;');
  console.log('  localStorage.setItem("auth_token", localStorage.getItem("token"))');
  console.log('');
  console.log('%c  // Clear all tokens', 'color: #8b5cf6;');
  console.log('  localStorage.removeItem("token"); localStorage.removeItem("auth_token")');
  console.log('');
  console.log('%c  // Check user role', 'color: #8b5cf6;');
  console.log('  const token = localStorage.getItem("token")');
  console.log('  const payload = JSON.parse(atob(token.split(".")[1]))');
  console.log('  console.log("Role:", payload.role)');
  
  console.log('\n%c=================================', 'color: #6b7280;');
  console.log('%c✅ Debug Complete!', 'font-size: 16px; font-weight: bold; color: #10b981;');
  console.log('%cVisit /debug-auth for detailed UI view', 'color: #60a5fa;');
})();
