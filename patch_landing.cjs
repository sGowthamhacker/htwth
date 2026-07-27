const fs = require('fs');
let content = fs.readFileSync('pages/LandingPage.tsx', 'utf8');

// 1. Update handleSendAdminMessage definition
content = content.replace(
  /const handleSendAdminMessage = async \(name: string, email: string, message: string\): Promise<\{success: boolean\}> => \{/,
  'const handleSendAdminMessage = async (name: string, email: string, message: string): Promise<{success: boolean, error?: string}> => {'
);

// 2. Update handleSendAdminMessage return statements
content = content.replace(
  /return \{ success: true \};\s*\};/g,
  `return { success: true };\n  };`
); // Let's use a regex that matches the whole function instead to be safe.

