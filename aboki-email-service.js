// aboki-email-service.js
require('dotenv').config();
const SibApiV3Sdk = require('@sendinblue/client');

class AbokiEmailService {
    constructor() {
        // Initialize Brevo API client with API key
        this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
        
        // Configure API key
        this.apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
        
        // Default sender configuration
        this.defaultSender = {
            name: process.env.BREVO_SENDER_NAME || "ABOKI",
            email: process.env.BREVO_SENDER_EMAIL || "noreply@aboki.com"
        };
        
        console.log('ABOKI Email Service initialized');
    }

    /**
     * Core email sending function
     */
    async sendEmail(emailData) {
        if (!process.env.BREVO_API_KEY) {
            throw new Error('BREVO_API_KEY not found in environment variables');
        }

        const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
        
        sendSmtpEmail.subject = emailData.subject;
        sendSmtpEmail.sender = emailData.sender || this.defaultSender;
        sendSmtpEmail.to = emailData.recipients;
        sendSmtpEmail.htmlContent = emailData.htmlContent;
        sendSmtpEmail.textContent = emailData.textContent;
        
        if (emailData.templateId) {
            sendSmtpEmail.templateId = emailData.templateId;
            sendSmtpEmail.params = emailData.params;
        }

        try {
            const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
            console.log(`Email sent successfully to ${emailData.recipients[0].email}`);
            return { 
                success: true, 
                messageId: response.messageId || response.body?.messageId || 'sent',
                recipient: emailData.recipients[0].email
            };
        } catch (error) {
            console.error('Email sending failed:', error.response?.body || error.message);
            return { 
                success: false, 
                error: error.response?.body || error.message,
                recipient: emailData.recipients[0].email
            };
        }
    }

    /**
     * Send welcome email to new users
     */
    async sendWelcomeEmail(userEmail, userName) {
        const emailData = {
            subject: "Welcome to ABOKI! 🎉",
            recipients: [{ email: userEmail, name: userName }],
            htmlContent: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0;">Welcome to ABOKI! 🚀</h1>
                    </div>
                    <div style="padding: 30px; background: #f9f9f9;">
                        <h2 style="color: #333;">Hello ${userName}!</h2>
                        <p style="color: #666; line-height: 1.6;">
                            We're thrilled to have you join the ABOKI family! You've just taken the first step 
                            towards smarter financial management.
                        </p>
                        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <h3 style="color: #667eea;">What's Next?</h3>
                            <ul style="color: #666;">
                                <li>Complete your profile setup</li>
                                <li>Make your first deposit</li>
                                <li>Explore our features</li>
                                <li>Start your financial journey</li>
                            </ul>
                        </div>
                        <p style="color: #666;">
                            If you have any questions, our support team is here to help!
                        </p>
                        <p style="color: #666;">
                            Best regards,<br>
                            <strong>The ABOKI Team</strong>
                        </p>
                    </div>
                </div>
            `,
            textContent: `Welcome to ABOKI! Hello ${userName}, We're thrilled to have you join the ABOKI family! You've just taken the first step towards smarter financial management. Complete your profile, make your first deposit, and start exploring our features. If you have any questions, our support team is here to help! Best regards, The ABOKI Team`
        };

        return await this.sendEmail(emailData);
    }

    /**
     * Send deposit confirmation email
     */
    async sendDepositConfirmation(userEmail, userName, amount, transactionId, paymentMethod = 'Bank Transfer') {
        const formattedAmount = new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount);

        const emailData = {
            subject: "Deposit Confirmed - ABOKI ✅",
            recipients: [{ email: userEmail, name: userName }],
            htmlContent: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #4CAF50; padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0;">Deposit Confirmed! ✅</h1>
                    </div>
                    <div style="padding: 30px; background: #f9f9f9;">
                        <h2 style="color: #333;">Hello ${userName}!</h2>
                        <p style="color: #666; font-size: 16px;">
                            Great news! Your deposit has been successfully processed and added to your ABOKI account.
                        </p>
                        <div style="background: white; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #4CAF50;">
                            <h3 style="color: #4CAF50; margin-top: 0;">Transaction Details</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #666; font-weight: bold;">Amount:</td>
                                    <td style="padding: 8px 0; color: #333; font-size: 18px; font-weight: bold;">${formattedAmount}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #666; font-weight: bold;">Transaction ID:</td>
                                    <td style="padding: 8px 0; color: #333;">${transactionId}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #666; font-weight: bold;">Payment Method:</td>
                                    <td style="padding: 8px 0; color: #333;">${paymentMethod}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #666; font-weight: bold;">Date:</td>
                                    <td style="padding: 8px 0; color: #333;">${new Date().toLocaleDateString('en-NG')}</td>
                                </tr>
                            </table>
                        </div>
                        <p style="color: #666;">
                            Your funds are now available in your account and ready for use!
                        </p>
                        <p style="color: #666;">
                            Thank you for choosing ABOKI!
                        </p>
                    </div>
                </div>
            `,
            textContent: `Deposit Confirmed! Hello ${userName}, Your deposit of ${formattedAmount} has been successfully processed. Transaction ID: ${transactionId}. Payment Method: ${paymentMethod}. Date: ${new Date().toLocaleDateString('en-NG')}. Your funds are now available! Thank you for choosing ABOKI!`
        };

        return await this.sendEmail(emailData);
    }

    /**
     * Send transaction completion email
     */
    async sendTransactionComplete(userEmail, userName, transactionType, amount, recipient, transactionId) {
        const formattedAmount = new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount);

        const emailData = {
            subject: `${transactionType} Completed - ABOKI ✅`,
            recipients: [{ email: userEmail, name: userName }],
            htmlContent: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: #2196F3; padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0;">Transaction Completed! ✅</h1>
                    </div>
                    <div style="padding: 30px; background: #f9f9f9;">
                        <h2 style="color: #333;">Hello ${userName}!</h2>
                        <p style="color: #666; font-size: 16px;">
                            Your ${transactionType.toLowerCase()} has been completed successfully.
                        </p>
                        <div style="background: white; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #2196F3;">
                            <h3 style="color: #2196F3; margin-top: 0;">Transaction Summary</h3>
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 8px 0; color: #666; font-weight: bold;">Type:</td>
                                    <td style="padding: 8px 0; color: #333;">${transactionType}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #666; font-weight: bold;">Amount:</td>
                                    <td style="padding: 8px 0; color: #333; font-size: 18px; font-weight: bold;">${formattedAmount}</td>
                                </tr>
                                ${recipient ? `<tr>
                                    <td style="padding: 8px 0; color: #666; font-weight: bold;">Recipient:</td>
                                    <td style="padding: 8px 0; color: #333;">${recipient}</td>
                                </tr>` : ''}
                                <tr>
                                    <td style="padding: 8px 0; color: #666; font-weight: bold;">Transaction ID:</td>
                                    <td style="padding: 8px 0; color: #333;">${transactionId}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #666; font-weight: bold;">Status:</td>
                                    <td style="padding: 8px 0; color: #4CAF50; font-weight: bold;">Completed</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #666; font-weight: bold;">Date:</td>
                                    <td style="padding: 8px 0; color: #333;">${new Date().toLocaleString('en-NG')}</td>
                                </tr>
                            </table>
                        </div>
                        <p style="color: #666;">
                            If you have any questions about this transaction, please don't hesitate to contact our support team.
                        </p>
                        <p style="color: #666;">
                            Thank you for using ABOKI!
                        </p>
                    </div>
                </div>
            `,
            textContent: `Transaction Completed! Hello ${userName}, Your ${transactionType.toLowerCase()} of ${formattedAmount} has been completed successfully. ${recipient ? `Recipient: ${recipient}. ` : ''}Transaction ID: ${transactionId}. Status: Completed. Date: ${new Date().toLocaleString('en-NG')}. Thank you for using ABOKI!`
        };

        return await this.sendEmail(emailData);
    }

    /**
     * Send monthly greeting
     */
    async sendMonthlyGreeting(userEmail, userName) {
        const currentDate = new Date();
        const month = currentDate.toLocaleString('default', { month: 'long' });
        const year = currentDate.getFullYear();

        const monthlyMessages = [
            `Welcome to ${month}! Let's make this month financially successful! 💰`,
            `${month} is here! Time to achieve your financial goals! 🎯`,
            `Happy new month! May ${month} bring you prosperity and growth! 🌱`,
            `${month} ${year} - Another month, another opportunity to excel! ⭐`,
            `Cheers to ${month}! Let's make every day count towards your financial freedom! 🎉`
        ];

        const randomMessage = monthlyMessages[Math.floor(Math.random() * monthlyMessages.length)];

        const emailData = {
            subject: `Happy New Month - ${month} ${year}! 🎉`,
            recipients: [{ email: userEmail, name: userName }],
            htmlContent: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%); padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0;">Happy New Month! 🎉</h1>
                        <h2 style="color: white; margin: 10px 0 0 0;">${month} ${year}</h2>
                    </div>
                    <div style="padding: 30px; background: #f9f9f9;">
                        <h2 style="color: #333;">Hello ${userName}!</h2>
                        <p style="color: #666; font-size: 16px; line-height: 1.6;">
                            ${randomMessage}
                        </p>
                        <div style="background: white; padding: 25px; border-radius: 8px; margin: 25px 0;">
                            <h3 style="color: #ff6b6b;">This Month's Focus:</h3>
                            <ul style="color: #666; line-height: 1.8;">
                                <li>Review your financial goals</li>
                                <li>Track your spending habits</li>
                                <li>Save more with ABOKI</li>
                                <li>Explore new investment opportunities</li>
                            </ul>
                        </div>
                        <p style="color: #666;">
                            We're here to support you every step of the way. Let's make ${month} amazing together!
                        </p>
                        <p style="color: #666;">
                            Best wishes,<br>
                            <strong>The ABOKI Team</strong>
                        </p>
                    </div>
                </div>
            `,
            textContent: `Happy New Month! Hello ${userName}, ${randomMessage} This month, focus on reviewing your financial goals, tracking spending habits, saving more with ABOKI, and exploring new investment opportunities. We're here to support you every step of the way. Let's make ${month} amazing together! Best wishes, The ABOKI Team`
        };

        return await this.sendEmail(emailData);
    }

    /**
     * Send Monday motivation email
     */
    async sendMondayMotivation(userEmail, userName) {
        const motivationalMessages = [
            {
                title: "Start Strong! 💪",
                message: "Monday is your canvas - paint it with determination and success!"
            },
            {
                title: "New Week, New Wins! 🏆",
                message: "Every Monday is a fresh start. Make this week count towards your financial goals!"
            },
            {
                title: "Monday Motivation! ⚡",
                message: "Success starts with a positive Monday mindset. You've got this!"
            },
            {
                title: "Rise and Shine! 🌅",
                message: "Turn your Monday blues into Monday opportunities. Let's achieve greatness!"
            },
            {
                title: "Monday Magic! ✨",
                message: "The week ahead is full of possibilities. Start strong and finish stronger!"
            }
        ];

        const randomMotivation = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

        const emailData = {
            subject: `${randomMotivation.title} - ABOKI`,
            recipients: [{ email: userEmail, name: userName }],
            htmlContent: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0;">${randomMotivation.title}</h1>
                    </div>
                    <div style="padding: 30px; background: #f9f9f9;">
                        <h2 style="color: #333;">Hello ${userName}!</h2>
                        <div style="background: white; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center; border-left: 4px solid #667eea;">
                            <h3 style="color: #667eea; font-size: 20px; margin-bottom: 15px;">💡 Monday Inspiration</h3>
                            <p style="color: #333; font-size: 18px; font-style: italic; line-height: 1.6;">
                                "${randomMotivation.message}"
                            </p>
                        </div>
                        <p style="color: #666; font-size: 16px;">
                            Start your week strong with ABOKI by your side. Whether it's saving, investing, or managing your finances, 
                            we're here to help you achieve your goals!
                        </p>
                        <div style="background: #667eea; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                            <h4 style="margin: 0 0 10px 0;">This Week's Challenge:</h4>
                            <p style="margin: 0;">Set one financial goal and take the first step towards achieving it!</p>
                        </div>
                        <p style="color: #666;">
                            Have a productive and successful week ahead!
                        </p>
                        <p style="color: #666;">
                            Cheers to your success,<br>
                            <strong>The ABOKI Team</strong>
                        </p>
                    </div>
                </div>
            `,
            textContent: `${randomMotivation.title} Hello ${userName}, "${randomMotivation.message}" Start your week strong with ABOKI by your side. Whether it's saving, investing, or managing your finances, we're here to help you achieve your goals! This Week's Challenge: Set one financial goal and take the first step towards achieving it! Have a productive and successful week ahead! Cheers to your success, The ABOKI Team`
        };

        return await this.sendEmail(emailData);
    }

    /**
     * Send bulk emails with rate limiting
     */
    async sendBulkEmails(emailType, userList, delayMs = 200) {
        console.log(`Starting bulk ${emailType} email send to ${userList.length} users...`);
        const results = [];
        
        for (let i = 0; i < userList.length; i++) {
            const user = userList[i];
            let result;
            
            try {
                switch (emailType) {
                    case 'monthly':
                        result = await this.sendMonthlyGreeting(user.email, user.name);
                        break;
                        
                    case 'monday':
                        result = await this.sendMondayMotivation(user.email, user.name);
                        break;
                        
                    case 'welcome':
                        result = await this.sendWelcomeEmail(user.email, user.name);
                        break;
                        
                    default:
                        result = { success: false, error: 'Unknown email type' };
                }
                
                results.push({
                    user: user.email,
                    name: user.name,
                    index: i + 1,
                    total: userList.length,
                    ...result
                });
                
                // Log progress
                console.log(`Sent ${emailType} email ${i + 1}/${userList.length} to ${user.email}: ${result.success ? 'SUCCESS' : 'FAILED'}`);
                
            } catch (error) {
                results.push({
                    user: user.email,
                    name: user.name,
                    index: i + 1,
                    total: userList.length,
                    success: false,
                    error: error.message
                });
                console.error(`Failed to send ${emailType} email to ${user.email}:`, error.message);
            }
            
            // Add delay to avoid rate limiting (Brevo allows 300 emails/day on free plan)
            if (i < userList.length - 1) {
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }
        
        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;
        
        console.log(`Bulk ${emailType} email complete: ${successCount} sent, ${failCount} failed`);
        
        return {
            summary: {
                total: userList.length,
                sent: successCount,
                failed: failCount,
                emailType
            },
            results
        };
    }

    /**
     * Send using Brevo template (for advanced templates created in dashboard)
     */
    async sendTemplateEmail(templateId, userEmail, userName, templateParams = {}) {
        const emailData = {
            templateId: parseInt(templateId),
            recipients: [{ email: userEmail, name: userName }],
            params: {
                name: userName,
                firstName: userName.split(' ')[0],
                ...templateParams
            }
        };

        return await this.sendEmail(emailData);
    }

    /**
     * Validate email configuration
     */
    validateConfig() {
        const requiredVars = ['BREVO_API_KEY'];
        const missing = requiredVars.filter(varName => !process.env[varName]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }
        
        return true;
    }
}

module.exports = AbokiEmailService;