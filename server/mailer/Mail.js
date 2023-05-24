require("dotenv").config();
const nodemailer = require("nodemailer");

class Mail {
    source;
    recipient;
    carbon_copy;
    subject;
    content;

    static validateEmail(email) {
        // const emailRegex = new RegExp("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$")
        // return emailRegex.test(email);
    };

    constructor(recipient, subject, content, carbon_copy = null) {
        this.source = {
            user: process.env.NM_MAIL,
            pass: process.env.NM_PASS
        };
        this.recipient = recipient;
        this.carbon_copy = carbon_copy
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
            // if (!Mail.validateEmail(this.recipient)) throw new Error("Invalid email")

            const transporter = this.createTransport();
        
            await transporter.sendMail({
                from: this.source.user, 
                to: this.recipient,
                cc: this.carbon_copy,
                subject: this.subject,
                html: this.content + this.footer(),
            });
            
        }
        catch (err) {
            console.error(err);
        }
    };
};

module.exports = Mail;