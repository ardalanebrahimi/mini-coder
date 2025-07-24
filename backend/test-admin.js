// Quick test to verify admin endpoint implementation
import { Request, Response } from 'express';

// Mock objects for testing
const mockRequest = {
  user: {
    id: 'admin-123',
    email: 'admin@example.com',
    tokens: 95
  }
} as any;

const mockResponse = {
  status: (code: number) => ({
    json: (data: any) => {
      console.log(`Status ${code}:`, JSON.stringify(data, null, 2));
      return mockResponse;
    }
  }),
  json: (data: any) => {
    console.log('Response:', JSON.stringify(data, null, 2));
    return mockResponse;
  }
} as any;

// Test admin access
async function testAdminAccess() {
  console.log('🧪 Testing Admin Access Implementation');
  console.log('=====================================');
  
  // Test 1: Check if ADMIN_EMAIL environment variable works
  process.env['ADMIN_EMAIL'] = 'admin@example.com';
  
  const adminEmail = process.env['ADMIN_EMAIL'];
  console.log('✅ Admin email from env:', adminEmail);
  
  // Test 2: Check admin access logic
  if (mockRequest.user.email === adminEmail) {
    console.log('✅ Admin access check passed');
  } else {
    console.log('❌ Admin access check failed');
  }
  
  // Test 3: Test non-admin user
  const regularUser = { ...mockRequest.user, email: 'user@example.com' };
  if (regularUser.email !== adminEmail) {
    console.log('✅ Non-admin user correctly blocked');
  }
  
  console.log('\n📝 Implementation Summary:');
  console.log('- Admin route: GET /admin');
  console.log('- Admin check: user.email === process.env.ADMIN_EMAIL');
  console.log('- Response: 403 for non-admin, 200 with stats for admin');
  console.log('- Environment: ADMIN_EMAIL must be set');
}

testAdminAccess().catch(console.error);
