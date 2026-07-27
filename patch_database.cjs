const fs = require('fs');
let content = fs.readFileSync('services/database.ts', 'utf8');

content = content.replace(
    /\.channel\('global_settings_changes'\)/g,
    `.channel('global_settings_changes_' + Math.random().toString(36).substring(7))`
);

content = content.replace(
    /\.channel\('activity_log_changes'\)/g,
    `.channel('activity_log_changes_' + Math.random().toString(36).substring(7))`
);

content = content.replace(
    /\.channel\('chat_messages_changes'\)/g,
    `.channel('chat_messages_changes_' + Math.random().toString(36).substring(7))`
);

content = content.replace(
    /\.channel\('users_changes'\)/g,
    `.channel('users_changes_' + Math.random().toString(36).substring(7))`
);

fs.writeFileSync('services/database.ts', content, 'utf8');
