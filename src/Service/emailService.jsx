const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    // Send password reset code email
    async sendPasswordResetCode(email, resetCode, userName = 'User') {
        const mailOptions = {
            from: `"FreelanceHub" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to: email,
            subject: 'Password Reset Code - FreelanceHub',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #6366f1;">FreelanceHub</h1>
                        <h2 style="color: #333;">Password Reset Request</h2>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <p style="font-size: 16px; color: #333; margin-bottom: 15px;">
                            Hello ${userName},
                        </p>
                        <p style="font-size: 16px; color: #333; margin-bottom: 15px;">
                            You requested to reset your password. Use the verification code below to proceed:
                        </p>
                        
                        <div style="text-align: center; margin: 25px 0;">
                            <div style="display: inline-block; background-color: #6366f1; color: white; padding: 15px 30px; border-radius: 8px; font-size: 28px; font-weight: bold; letter-spacing: 5px;">
                                ${resetCode}
                            </div>
                        </div>
                        
                        <p style="font-size: 14px; color: #666; margin-bottom: 15px;">
                            This code will expire in <strong>15 minutes</strong>.
                        </p>
                        
                        <p style="font-size: 14px; color: #666; margin-bottom: 15px;">
                            If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                        <p style="font-size: 12px; color: #999;">
                            © ${new Date().getFullYear()} FreelanceHub. All rights reserved.
                        </p>
                        <p style="font-size: 12px; color: #999;">
                            This is an automated message, please do not reply to this email.
                        </p>
                    </div>
                </div>
            `,
            text: `Password Reset Request\n\nHello ${userName},\n\nYou requested to reset your password. Use this verification code: ${resetCode}\n\nThis code will expire in 15 minutes.\n\nIf you didn't request a password reset, please ignore this email.\n\nThank you,\nFreelanceHub Team`
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Password reset email sent to ${email}`);
            return true;
        } catch (error) {
            console.error('❌ Error sending password reset email:', error);
            throw new Error('Failed to send reset email');
        }
    }

    // Send password reset confirmation email
    async sendPasswordResetConfirmation(email, userName = 'User') {
        const mailOptions = {
            from: `"FreelanceHub" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to: email,
            subject: 'Password Reset Successful - FreelanceHub',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #6366f1;">FreelanceHub</h1>
                        <h2 style="color: #4CAF50;">Password Reset Successful</h2>
                    </div>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <p style="font-size: 16px; color: #333; margin-bottom: 15px;">
                            Hello ${userName},
                        </p>
                        <p style="font-size: 16px; color: #333; margin-bottom: 15px;">
                            Your password has been successfully reset.
                        </p>
                        
                        <div style="text-align: center; margin: 25px 0;">
                            <div style="background-color: #4CAF50; color: white; padding: 10px 20px; border-radius: 50px; display: inline-block;">
                                <span style="font-size: 24px;">✓</span>
                            </div>
                        </div>
                        
                        <p style="font-size: 14px; color: #666; margin-bottom: 15px;">
                            <strong>Security Note:</strong> If you did not perform this action, please contact our support team immediately.
                        </p>
                        
                        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin-top: 20px;">
                            <p style="font-size: 14px; color: #856404; margin: 0;">
                                <strong>Tip:</strong> Use a strong, unique password that you don't use elsewhere.
                            </p>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
                           style="background-color: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                           Login to Your Account
                        </a>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                        <p style="font-size: 12px; color: #999;">
                            © ${new Date().getFullYear()} FreelanceHub. All rights reserved.
                        </p>
                    </div>
                </div>
            `,
            text: `Password Reset Successful\n\nHello ${userName},\n\nYour password has been successfully reset.\n\nIf you did not perform this action, please contact our support team immediately.\n\nThank you,\nFreelanceHub Team`
        };

        try {
            await this.transporter.sendMail(mailOptions);
            console.log(`✅ Password reset confirmation sent to ${email}`);
            return true;
        } catch (error) {
            console.error('❌ Error sending confirmation email:', error);
            // Don't throw error here as password reset is already successful
        }
    }
}

module.exports = new EmailService();