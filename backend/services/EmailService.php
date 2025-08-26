<?php
// Email service using PHPMailer for SMTP

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class EmailService {
    private $config;
    
    public function __construct() {
        global $config;
        $this->config = $config['email'];
    }
    
    private function createMailer() {
        $mail = new PHPMailer(true);
        
        if ($this->config['smtp_enabled']) {
            $mail->isSMTP();
            $mail->Host = $this->config['smtp_host'];
            $mail->SMTPAuth = true;
            $mail->Username = $this->config['smtp_username'];
            $mail->Password = $this->config['smtp_password'];
            $mail->SMTPSecure = $this->config['smtp_encryption'];
            $mail->Port = $this->config['smtp_port'];
        }
        
        $mail->setFrom($this->config['from_email'], $this->config['from_name']);
        $mail->isHTML(true);
        
        return $mail;
    }
    
    public function sendEmailVerification($email, $token, $businessName) {
        try {
            $mail = $this->createMailer();
            
            $mail->addAddress($email);
            $mail->Subject = 'Verify your Lingora account';
            
            $verificationLink = $this->config['app_url'] . "/verify-email?token=" . $token;
            
            $mail->Body = $this->getEmailTemplate('verification', [
                'business_name' => $businessName,
                'verification_link' => $verificationLink,
            ]);
            
            $mail->send();
            return true;
            
        } catch (Exception $e) {
            error_log("Email verification failed: " . $e->getMessage());
            return false;
        }
    }
    
    public function sendPasswordReset($email, $token) {
        try {
            $mail = $this->createMailer();
            
            $mail->addAddress($email);
            $mail->Subject = 'Reset your Lingora password';
            
            $resetLink = $this->config['app_url'] . "/reset-password?token=" . $token;
            
            $mail->Body = $this->getEmailTemplate('password_reset', [
                'reset_link' => $resetLink,
            ]);
            
            $mail->send();
            return true;
            
        } catch (Exception $e) {
            error_log("Password reset email failed: " . $e->getMessage());
            return false;
        }
    }
    
    public function sendContactMessage($providerEmail, $messageData, $adminBcc = true) {
        try {
            $mail = $this->createMailer();
            
            $mail->addAddress($providerEmail);
            
            if ($adminBcc) {
                $mail->addBCC($this->config['admin_email']);
            }
            
            $mail->Subject = 'New inquiry: ' . $messageData['subject'];
            
            $mail->Body = $this->getEmailTemplate('contact_message', $messageData);
            
            $mail->send();
            return true;
            
        } catch (Exception $e) {
            error_log("Contact message email failed: " . $e->getMessage());
            return false;
        }
    }
    
    public function sendContactAutoReply($customerEmail, $messageData) {
        try {
            $mail = $this->createMailer();
            
            $mail->addAddress($customerEmail);
            $mail->Subject = 'We received your message - Lingora';
            
            $mail->Body = $this->getEmailTemplate('contact_auto_reply', $messageData);
            
            $mail->send();
            return true;
            
        } catch (Exception $e) {
            error_log("Auto-reply email failed: " . $e->getMessage());
            return false;
        }
    }
    
    public function sendProviderApproval($providerEmail, $businessName) {
        try {
            $mail = $this->createMailer();
            
            $mail->addAddress($providerEmail);
            $mail->Subject = 'Your Lingora profile has been approved!';
            
            $mail->Body = $this->getEmailTemplate('provider_approved', [
                'business_name' => $businessName,
                'dashboard_link' => $this->config['app_url'] . '/dashboard',
            ]);
            
            $mail->send();
            return true;
            
        } catch (Exception $e) {
            error_log("Provider approval email failed: " . $e->getMessage());
            return false;
        }
    }
    
    public function sendProviderRejection($providerEmail, $businessName, $reason) {
        try {
            $mail = $this->createMailer();
            
            $mail->addAddress($providerEmail);
            $mail->Subject = 'Lingora profile update required';
            
            $mail->Body = $this->getEmailTemplate('provider_rejected', [
                'business_name' => $businessName,
                'reason' => $reason,
                'contact_email' => $this->config['admin_email'],
            ]);
            
            $mail->send();
            return true;
            
        } catch (Exception $e) {
            error_log("Provider rejection email failed: " . $e->getMessage());
            return false;
        }
    }
    
    private function getEmailTemplate($template, $variables = []) {
        $templates = [
            'verification' => '
                <h2>Welcome to Lingora!</h2>
                <p>Thank you for registering <strong>{business_name}</strong> with Lingora.</p>
                <p>Please click the link below to verify your email address:</p>
                <p><a href="{verification_link}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Verify Email Address</a></p>
                <p>If you cannot click the link, copy and paste this URL into your browser:</p>
                <p>{verification_link}</p>
                <p>Best regards,<br>The Lingora Team</p>
            ',
            
            'password_reset' => '
                <h2>Reset Your Password</h2>
                <p>We received a request to reset your password for your Lingora account.</p>
                <p>Click the link below to reset your password:</p>
                <p><a href="{reset_link}" style="background: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a></p>
                <p>If you cannot click the link, copy and paste this URL into your browser:</p>
                <p>{reset_link}</p>
                <p>If you did not request this password reset, please ignore this email.</p>
                <p>Best regards,<br>The Lingora Team</p>
            ',
            
            'contact_message' => '
                <h2>New inquiry from {sender_name}</h2>
                <p><strong>From:</strong> {sender_name} ({sender_email})</p>
                <p><strong>Preferred Language:</strong> {preferred_language}</p>
                <p><strong>Subject:</strong> {subject}</p>
                <p><strong>Message:</strong></p>
                <div style="background: #f5f5f5; padding: 16px; border-radius: 6px; margin: 16px 0;">
                    {message}
                </div>
                <p>You can reply directly to this email to respond to the inquiry.</p>
                <p>Best regards,<br>The Lingora Team</p>
            ',
            
            'contact_auto_reply' => '
                <h2>Thank you for your inquiry</h2>
                <p>Dear {sender_name},</p>
                <p>We have received your message and forwarded it to the service provider. They will contact you directly regarding your inquiry.</p>
                <p><strong>Your message:</strong></p>
                <div style="background: #f5f5f5; padding: 16px; border-radius: 6px; margin: 16px 0;">
                    <strong>Subject:</strong> {subject}<br><br>
                    {message}
                </div>
                <p>Best regards,<br>The Lingora Team</p>
            ',
            
            'provider_approved' => '
                <h2>Congratulations! Your profile has been approved</h2>
                <p>Dear {business_name},</p>
                <p>Great news! Your Lingora provider profile has been approved and is now live on our platform.</p>
                <p>You can now:</p>
                <ul>
                    <li>Receive inquiries from potential clients</li>
                    <li>Manage your profile and services</li>
                    <li>Track your messages and analytics</li>
                </ul>
                <p><a href="{dashboard_link}" style="background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Access Your Dashboard</a></p>
                <p>Best regards,<br>The Lingora Team</p>
            ',
            
            'provider_rejected' => '
                <h2>Profile Update Required</h2>
                <p>Dear {business_name},</p>
                <p>Thank you for your interest in joining Lingora. We need some additional information before we can approve your profile.</p>
                <p><strong>Reason:</strong> {reason}</p>
                <p>Please update your profile and resubmit for approval. If you have any questions, please contact us at {contact_email}.</p>
                <p>Best regards,<br>The Lingora Team</p>
            ',
        ];
        
        $html = $templates[$template] ?? '<p>Template not found</p>';
        
        // Replace variables
        foreach ($variables as $key => $value) {
            $html = str_replace('{' . $key . '}', htmlspecialchars($value), $html);
        }
        
        return $html;
    }
}
?>