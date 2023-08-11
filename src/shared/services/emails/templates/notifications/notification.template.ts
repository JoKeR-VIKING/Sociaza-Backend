import fs from 'fs';
import ejs from 'ejs';
import { INotificationTemplate } from '@notification/interface/notification.interface';

class NotificationTemplate {
    public template(templateParams: INotificationTemplate): string {
        return ejs.render(fs.readFileSync('./notification.template.ejs', 'utf-8'), {
            username: templateParams.username,
            header: templateParams.header,
            message: templateParams.message
        });
    }
}

export const notificationTemplate: NotificationTemplate = new NotificationTemplate();