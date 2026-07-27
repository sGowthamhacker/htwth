const fs = require('fs');
let content = fs.readFileSync('pages/AdminDashboardPage.tsx', 'utf8');

content = content.replace(`        try {
            const promises = targetUserIds.map(userId =>
                createNotification(userId, title, message, 'broadcast', fromPayload)
            );
            await Promise.all(promises);`, `        try {
            const notifications = targetUserIds.map(userId => ({
                userId,
                title,
                message,
                type: 'broadcast',
                isRead: false,
                from: adminUser.name,
                fromAvatar: adminUser.avatar,
                targetType: 'system' as any
            }));
            await sendGlobalNotifications(notifications);`);

fs.writeFileSync('pages/AdminDashboardPage.tsx', content, 'utf8');
