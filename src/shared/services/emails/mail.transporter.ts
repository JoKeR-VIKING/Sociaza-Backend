import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import Logger from 'bunyan';
import { Config } from '@root/config';
import sendGridMail from '@sendgrid/mail';
import { BadRequestError } from '@globals/helpers/errorHandler';

interface IMailOptions {
    from: string;
    to: string;
    subject: string;
    html: string;
}

Config.validateConfig();
const log: Logger = Config.createLogger('mail');
sendGridMail.setApiKey(Config.SENDGRID_API_KEY as string);

class MailTransport {
    public async sendEmail(receiverEmail: string, subject: string, body: string): Promise<void> {
        if (Config.NODE_ENV === 'test' || Config.NODE_ENV === 'development') {
            this.developmentEmailSender(receiverEmail, subject, body);
        }
        else {
            this.productionEmailSender(receiverEmail, subject, body);
        }
    }

    private async developmentEmailSender(receiverEmail: string, subject: string, body: string): Promise<void> {
        const transporter: Mail = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: Config.SENDER_EMAIL,
                pass: Config.SENDER_PASSWORD,
            },
        });

        const mailOptions: IMailOptions = {
            from: `Sociaza <${Config.SENDER_EMAIL}>`,
            to: receiverEmail,
            subject: subject,
            html: body,
        }

        try {
            await transporter.sendMail(mailOptions);
            log.info('Email sent successfully.');
        }
        catch (err) {
            log.error('Error sending email', err);
            throw new BadRequestError('Could not send email.')
        }
    }

    private async productionEmailSender (receiverEmail: string, subject: string, body: string): Promise<void> {
        const mailOptions: IMailOptions = {
            from: `Sociaza <${Config.SENDGRID_SENDER}>`,
            to: receiverEmail,
            subject: subject,
            html: body,
        }

        try {
            await sendGridMail.send(mailOptions);
            log.info('Email sent successfully.');
        }
        catch (err) {
            log.error('Error sending email', err);
            throw new BadRequestError('Could not send email.')
        }
    }
}

export const mailTransport = new MailTransport();