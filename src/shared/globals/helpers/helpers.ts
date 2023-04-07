import { parse } from 'dotenv';

export class Helpers {
    public static firstLetterUppercase(str: string): string {
        const valueString = str.toLowerCase();
        return valueString.split(' ').map((value: string) => `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`).join(' ');
    }

    public static lowercase(str: string): string {
        return str.toLowerCase();
    }

    public static generateRandomIntegers(integerLength: number): number {
        const characters = '0123456789';
        let result = '';

        for (let i=0;i<integerLength;i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        return parseInt(result, 10);
    }

    public static parseJson(prop: string): any {
        try {
            return JSON.parse(prop);
        }
        catch (err) {
            return prop;
        }
    }

    public static isDataUrl(data: string): boolean {
        const dataUrlRegex: RegExp = /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&', ()*+;=\-._~:@\\/?%\s]*)\s*$/i;
        return dataUrlRegex.test(data);
    }
}
