// Test script to verify party code generation
console.log('🧪 Testing Party Code Generation...\n');

// Test the new party code format (8 characters in 2 segments of 4)
function generatePartyCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generate 10 test codes
console.log('Generated party codes:');
for (let i = 0; i < 10; i++) {
  const code = generatePartyCode();
  console.log(`  ${i + 1}. ${code}`);
}

console.log('\n✅ Party code generation test complete!');
console.log('Expected format: XXXX-XXXX (8 characters total)');
console.log('Old format was: PARTY-XXXXXX (11 characters total)'); 