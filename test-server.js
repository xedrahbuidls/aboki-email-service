// test-server.js
require('dotenv').config();
const express = require('express');
const AbokiEmailService = require('./aboki-email-service');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize email service
const emailService = new AbokiEmailService();

// Middleware to validate email service
app.use((req, res, next) => {
    try {
        emailService.validateConfig();
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Email service configuration error',
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'ABOKI Email Service is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Test basic email sending
app.post('/test/send-basic-email', async (req, res) => {
    try {
        const { email, name, subject, message } = req.body;
        
        if (!email || !name) {
            return res.status(400).json({
                success: false,
                message: 'Email and name are required'
            });
        }
        
        const emailData = {
            subject: subject || "Test Email from ABOKI",
            recipients: [{ email, name }],
            htmlContent: `
                <h2>Test Email from ABOKI</h2>
                <p>Hello ${name},</p>
                <p>${message || 'This is a test email from ABOKI!'}</p>
                <p>If you received this email, the integration is working perfectly!</p>
                <p>Best regards,<br>ABOKI Team</p>
            `,
            textContent: `Test Email from ABOKI. Hello ${name}, ${message || 'This is a test email from ABOKI!'} If you received this email, the integration is working perfectly! Best regards, ABOKI Team`
        };
        
        const result = await emailService.sendEmail(emailData);
        
        res.json({
            success: true,
            message: 'Test email sent successfully',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to send test email',
            error: error.message
        });
    }
});

// Test welcome email
app.post('/test/welcome-email', async (req, res) => {
    try {
        const { email, name } = req.body;
        
        if (!email || !name) {
            return res.status(400).json({
                success: false,
                message: 'Email and name are required'
            });
        }
        
        const result = await emailService.sendWelcomeEmail(email, name);
        
        res.json({
            success: true,
            message: 'Welcome email sent successfully',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to send welcome email',
            error: error.message
        });
    }
});

// Test deposit confirmation email
app.post('/test/deposit-confirmation', async (req, res) => {
    try {
        const { email, name, amount, transactionId, paymentMethod } = req.body;
        
        if (!email || !name || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Email, name, and amount are required'
            });
        }
        
        const result = await emailService.sendDepositConfirmation(
            email,
            name,
            parseFloat(amount),
            transactionId || `TXN${Date.now()}`,
            paymentMethod || 'Bank Transfer'
        );
        
        res.json({
            success: true,
            message: 'Deposit confirmation email sent successfully',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to send deposit confirmation email',
            error: error.message
        });
    }
});

// Test transaction completion email
app.post('/test/transaction-complete', async (req, res) => {
    try {
        const { email, name, transactionType, amount, recipient, transactionId } = req.body;
        
        if (!email || !name || !transactionType || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Email, name, transactionType, and amount are required'
            });
        }
        
        const result = await emailService.sendTransactionComplete(
            email,
            name,
            transactionType,
            parseFloat(amount),
            recipient || null,
            transactionId || `TXN${Date.now()}`
        );
        
        res.json({
            success: true,
            message: 'Transaction completion email sent successfully',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to send transaction completion email',
            error: error.message
        });
    }
});

// Test monthly greeting
app.post('/test/monthly-greeting', async (req, res) => {
    try {
        const { email, name } = req.body;
        
        if (!email || !name) {
            return res.status(400).json({
                success: false,
                message: 'Email and name are required'
            });
        }
        
        const result = await emailService.sendMonthlyGreeting(email, name);
        
        res.json({
            success: true,
            message: 'Monthly greeting email sent successfully',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to send monthly greeting email',
            error: error.message
        });
    }
});

// Test Monday motivation
app.post('/test/monday-motivation', async (req, res) => {
    try {
        const { email, name } = req.body;
        
        if (!email || !name) {
            return res.status(400).json({
                success: false,
                message: 'Email and name are required'
            });
        }
        
        const result = await emailService.sendMondayMotivation(email, name);
        
        res.json({
            success: true,
            message: 'Monday motivation email sent successfully',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to send Monday motivation email',
            error: error.message
        });
    }
});

// Test bulk email sending
app.post('/test/bulk-emails', async (req, res) => {
    try {
        const { emailType, users, delayMs } = req.body;
        
        if (!emailType || !users || !Array.isArray(users)) {
            return res.status(400).json({
                success: false,
                message: 'emailType and users array are required'
            });
        }
        
        // Validate email type
        const validTypes = ['monthly', 'monday', 'welcome'];
        if (!validTypes.includes(emailType)) {
            return res.status(400).json({
                success: false,
                message: `Invalid emailType. Must be one of: ${validTypes.join(', ')}`
            });
        }
        
        // Validate users array structure
        for (const user of users) {
            if (!user.email || !user.name) {
                return res.status(400).json({
                    success: false,
                    message: 'Each user must have email and name properties'
                });
            }
        }
        
        const result = await emailService.sendBulkEmails(emailType, users, delayMs || 200);
        
        res.json({
            success: true,
            message: `Bulk ${emailType} emails processed`,
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to send bulk emails',
            error: error.message
        });
    }
});

// Test template-based email (if you create templates in Brevo dashboard)
app.post('/test/template-email', async (req, res) => {
    try {
        const { templateId, email, name, params } = req.body;
        
        if (!templateId || !email || !name) {
            return res.status(400).json({
                success: false,
                message: 'templateId, email, and name are required'
            });
        }
        
        const result = await emailService.sendTemplateEmail(
            parseInt(templateId),
            email,
            name,
            params || {}
        );
        
        res.json({
            success: true,
            message: 'Template email sent successfully',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to send template email',
            error: error.message
        });
    }
});

// Get all available test endpoints
app.get('/test/endpoints', (req, res) => {
    res.json({
        success: true,
        message: 'Available test endpoints',
        endpoints: [
            {
                method: 'GET',
                path: '/health',
                description: 'Health check'
            },
            {
                method: 'POST',
                path: '/test/send-basic-email',
                description: 'Send basic test email',
                requiredFields: ['email', 'name'],
                optionalFields: ['subject', 'message']
            },
            {
                method: 'POST',
                path: '/test/welcome-email',
                description: 'Send welcome email',
                requiredFields: ['email', 'name']
            },
            {
                method: 'POST',
                path: '/test/deposit-confirmation',
                description: 'Send deposit confirmation email',
                requiredFields: ['email', 'name', 'amount'],
                optionalFields: ['transactionId', 'paymentMethod']
            },
            {
                method: 'POST',
                path: '/test/transaction-complete',
                description: 'Send transaction completion email',
                requiredFields: ['email', 'name', 'transactionType', 'amount'],
                optionalFields: ['recipient', 'transactionId']
            },
            {
                method: 'POST',
                path: '/test/monthly-greeting',
                description: 'Send monthly greeting email',
                requiredFields: ['email', 'name']
            },
            {
                method: 'POST',
                path: '/test/monday-motivation',
                description: 'Send Monday motivation email',
                requiredFields: ['email', 'name']
            },
            {
                method: 'POST',
                path: '/test/bulk-emails',
                description: 'Send bulk emails',
                requiredFields: ['emailType', 'users'],
                optionalFields: ['delayMs'],
                note: 'emailType must be: monthly, monday, or welcome. users must be array of {email, name}'
            },
            {
                method: 'POST',
                path: '/test/template-email',
                description: 'Send template-based email',
                requiredFields: ['templateId', 'email', 'name'],
                optionalFields: ['params']
            }
        ]
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server Error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        availableEndpoints: '/test/endpoints'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 ABOKI Email Test Server running on port ${PORT}`);
    console.log(`📧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`📋 Available endpoints: http://localhost:${PORT}/test/endpoints`);
    
    // Validate configuration on startup
    try {
        emailService.validateConfig();
        console.log('✅ Email service configuration validated');
    } catch (error) {
        console.error('❌ Email service configuration error:', error.message);
        console.log('💡 Please check your .env file and ensure BREVO_API_KEY is set');
    }
});

module.exports = app;