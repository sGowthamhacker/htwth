const fs = require('fs');
let content = fs.readFileSync('pages/AdminDashboardPage.tsx', 'utf8');

// Update imports
content = content.replace("sendGlobalNotifications,", "sendGlobalNotifications, addNotificationToDb,");

// Update the send function
const target = `        try {
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
            await sendGlobalNotifications(notifications);`;

const replacement = `        try {
            const promises = targetUserIds.map(userId => 
                addNotificationToDb({
                    userId,
                    title,
                    message,
                    sourceType: 'admin_message',
                    fromUser: {
                        email: adminUser.email,
                        name: adminUser.name,
                        avatar: adminUser.avatar,
                        role: adminUser.role
                    }
                })
            );
            await Promise.all(promises);`;

content = content.replace(target, replacement);

fs.writeFileSync('pages/AdminDashboardPage.tsx', content, 'utf8');
