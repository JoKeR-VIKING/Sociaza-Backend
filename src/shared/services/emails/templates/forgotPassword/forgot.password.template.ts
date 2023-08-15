import fs from 'fs';
import ejs from 'ejs';

class ForgotPasswordTemplate {
    public template(username: string, resetLink: string): string {
        return ejs.render(fs.readFileSync('./forgot.password.template.ejs', 'utf-8'), {
            username: username,
            resetLink: resetLink
        });
    }
}

export const forgotPasswordTemplate: ForgotPasswordTemplate = new ForgotPasswordTemplate();