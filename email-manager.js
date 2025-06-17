// email-manager.js
const AbokiEmailService = require('./aboki-email-service');
const cron = require('node-cron');

class EmailManager {
    constructor() {
        this.emailService = new AbokiEmailService();
        this.emailLog = [];
        
        console.log('EmailManager initialized');
    }

    // Helper method to log email activity
    logEmail(type, recipient, success, error = null) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            type,
            recipient,
            success,
            error
        };
        
        this.emailLog.push(logEntry);
        
        // Keep only last 1000 entries
        if (this.emailLog.length > 1000) {
            this.emailLog = this.emailLog.slice(-1000);
        }
        
        console.log(`📧 Email ${type}: ${recipient} - ${success ? 'SUCCESS' : 'FAILED'}${error ? ` (${error})` : ''}`);
    }

    // Get email statistics
    getEmailStats(hours = 24) {
        const cutoff = new Date(Date.now() - (hours * 60 * 60 * 1000));
        const recentEmails = this.emailLog.filter(log => new Date(log.timestamp) > cutoff);
        
        const stats = {
            total: recentEmails.length,
            successful: recentEmails.filter(log => log.success).length,
            failed: recentEmails.filter(log => !log.success).length,
            types: {}
        };
        
        recentEmails.forEach(log => {
            if (!stats.types[log.type]) {
                stats.types[log.type] = { total: 0, successful: 0, failed: 0 };
            }
            stats.types[log.type].total++;
            if (log.success) {
                stats.types[log.type].successful++;
            } else {
                stats.types[log.type].failed++;
            }
        });
        
        return stats;
    }

    // User registration welcome email
    async handleUserRegistration(userEmail, userName) {
        try {
            const result = await this.emailService.sendWelcomeEmail(userEmail, userName);
            this.logEmail('welcome', userEmail, result.success, result.error);
            return result;
        } catch (error) {
            this.logEmail('welcome', userEmail, false, error.message);
            throw error;
        }
    }

    // Deposit confirmation
    async handleUserDeposit(userEmail, userName, amount, transactionId, paymentMethod = 'Bank Transfer') {
        try {
            const result = await this.emailService.sendDepositConfirmation(
                userEmail, 
                userName, 
                amount, 
                transactionId, 
                paymentMethod
            );
            this.logEmail('deposit', userEmail, result.success, result.error);
            return result;
        } catch (error) {
            this.logEmail('deposit', userEmail, false, error.message);
            throw error;
        }
    }

    // Transaction completion
    async handleTransactionComplete(userEmail, userName, transactionType, amount, recipient, transactionId) {
        try {
            const result = await this.emailService.sendTransactionComplete(
                userEmail, 
                userName, 
                transactionType, 
                amount, 
                recipient, 
                transactionId
            );
            this.logEmail('transaction', userEmail, result.success, result.error);
            return result;
        } catch (error) {
            this.logEmail('transaction', userEmail, false, error.message);
            throw error;
        }
    }

    // Setup automated email campaigns
    setupAutomatedCampaigns() {
        // Monthly greetings - 1st of every month at 9 AM
        cron.schedule('0 9 1 * *', async () => {
            console.log('🗓️ Running monthly greeting campaign...');
            try {
                const users = await this.getAllActiveUsers();
                if (users.length > 0) {
                    const result = await this.emailService.sendBulkEmails('monthly', users);
                    console.log(`📧 Monthly greetings sent: ${result.summary.sent}/${result.summary.total}`);
                }
            } catch (error) {
                console.error('❌ Monthly greeting campaign failed:', error.message);
            }
        });

        // Monday motivation - Every Monday at 8 AM
        cron.schedule('0 8 * * 1', async () => {
            console.log('💪 Running Monday motivation campaign...');
            try {
                const users = await this.getAllActiveUsers();
                if (users.length > 0) {
                    const result = await this.emailService.sendBulkEmails('monday', users);
                    console.log(`📧 Monday motivation sent: ${result.summary.sent}/${result.summary.total}`);
                }
            } catch (error) {
                console.error('❌ Monday motivation campaign failed:', error.message);
            }
        });

        console.log('⏰ Automated email campaigns scheduled');
    }

    // Send custom campaign
    async sendCustomCampaign(emailType, userFilter = 'all') {
        try {
            let users;
            
            switch (userFilter) {
                case 'active':
                    users = await this.getActiveUsers();
                    break;
                case 'new':
                    users = await this.getNewUsers();
                    break;
                case 'inactive':
                    users = await this.getInactiveUsers();
                    break;
                default:
                    users = await this.getAllActiveUsers();
            }
            
            if (users.length === 0) {
                return { success: true, message: 'No users found for campaign', summary: { total: 0, sent: 0, failed: 0 } };
            }
            
            const result = await this.emailService.sendBulkEmails(emailType, users);
            
            // Log campaign results
            result.results.forEach(res => {
                this.logEmail(`campaign_${emailType}`, res.user, res.success, res.error);
            });
            
            return result;
        } catch (error) {
            console.error(`Campaign ${emailType} failed:`, error.message);
            throw error;
        }
    }

    // Database helper methods (implement based on your database)
    async getAllActiveUsers() {
        // TODO: Implement database query to get all active users
        // For testing, return mock data
        return [
            { email: 'test@example.com', name: 'Test User' }
        ];
        
        /* Example implementation:
        const db = require('./database');
        const users = await db.query(`
            SELECT email, CONCAT(first_name, ' ', last_name) as name 
            FROM users 
            WHERE status = 'active' AND email_notifications = true
        `);
        return users;
        */
    }

    async getActiveUsers(days = 30) {
        // TODO: Get users active in last X days
        return [];
    }

    async getNewUsers(days = 7) {
        // TODO: Get users registered in last X days
        return [];
    }

    async getInactiveUsers(days = 90) {
        // TODO: Get users inactive for X days
        return [];
    }

    async getUserDetails(userId) {
        // TODO: Get user details by ID
        return { email: '', name: '', id: userId };
    }

    // Utility methods
    async testEmailConfiguration() {
        try {
            this.emailService.validateConfig();
            
            // Send test email to verify everything works
            const testResult = await this.emailService.sendEmail({
                subject: 'ABOKI Email Service Test',
                recipients: [{ email: process.env.TEST_EMAIL || 'admin@aboki.com', name: 'Admin' }],
                htmlContent: '<h2>Email Service Test</h2><p>If you receive this, the email service is working correctly!</p>',
                textContent: 'Email Service Test. If you receive this, the email service is working correctly!'
            });
            
            return {
                configValid: true,
                testEmailSent: testResult.success,
                message: testResult.success ? 'Email service is working correctly' : 'Email sending failed'
            };
        } catch (error) {
            return {
                configValid: false,
                testEmailSent: false,
                message: error.message
            };
        }
    }

    // Manual trigger methods for testing
    async triggerMonthlyGreetings() {
        const users = await this.getAllActiveUsers();
        return await this.emailService.sendBulkEmails('monthly', users);
    }

    async triggerMondayMotivation() {
        const users = await this.getAllActiveUsers();
        return await this.emailService.sendBulkEmails('monday', users);
    }

    // Email queue management (for high-volume scenarios)
    async queueEmail(emailType, emailData) {
        // TODO: Implement email queue for high-volume sending
        // This could use Redis, database, or message queue
        console.log(`Queued ${emailType} email for ${emailData.recipient}`);
    }

    async processEmailQueue() {
        // TODO: Process queued emails in batches
        console.log('Processing email queue...');
    }
}

module.exports = EmailManager;