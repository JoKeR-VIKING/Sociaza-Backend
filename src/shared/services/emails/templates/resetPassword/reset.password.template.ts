import fs from 'fs';
import ejs from 'ejs';

class ResetPasswordTemplate {
    public template(username: string, email: string, ip: string): string {
        return ejs.render(fs.readFileSync(__dirname + '/reset.password.template.ejs', 'utf-8'), {
            username: username,
            email: email,
            ip: ip
        });
    }
}

export const resetPasswordTemplate: ResetPasswordTemplate = new ResetPasswordTemplate();