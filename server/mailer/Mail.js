require("dotenv").config();
const nodemailer = require("nodemailer");

class Mail {
    source;
    recipient;
    subject;
    content;

    constructor(recipient, subject, content) {
        this.source = {
            user: process.env.NM_MAIL,
            pass: process.env.NM_PASS
        };
        this.recipient = recipient;
        this.subject = subject;
        this.content = content;
    };

    footer() {
        return (
            `<br><strong>Note:</strong> This is an auto-generated email. Please do not reply to this email.
            <br>This email is confidential and may be privileged.
            <br>If you are not the intended recipient, please delete it and notify us immediately.
            <br>You should not copy or use it for any purpose, nor disclose its contents to any other person. Thank you.`
        );
    };

    createTransport() {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: this.source,
            pool: true,
            port: 465,
            secure: true,
            connectionTimeout: 100,
        });
    };

    async send() {
        try {
            if (!validateEmail(this.recipient)) throw new Error("Invalid email")

            const transporter = this.createTransport();
        
            await transporter.sendMail({
                from: this.source.user, 
                to: this.recipient,
                subject: this.subject,
                html: this.content + this.footer(),
            });
            
        }
        catch (err) {
            console.error(err);
        }
    };

    static validateEmail(email) {
        const emailRegex = new RegExp("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$")
        return emailRegex.test(email);
    };
};

module.exports = Mail;