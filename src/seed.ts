import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import axios from 'axios';
import { createCanvas } from 'canvas';

dotenv.config({});

function avatarColor(): string {
    return '#'+('00000' + (Math.random() * 0xFFFFFF<<0).toString(16)).slice(-6);
}

function generateAvatar(text: string, backgroundColor: string, foregroundColor: string = 'white'): string {
    const canvas = createCanvas(200, 200);
    const context = canvas.getContext('2d');

    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.font = 'normal 80px sans-serif';
    context.fillStyle = foregroundColor;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    return canvas.toDataURL('image/png');
}

async function seedUserData(count: number): Promise<void> {
    let i: number = 1;

    try {
        while (i <= count) {
            const username: string = faker.person.firstName().toLowerCase() + faker.person.lastName().toLowerCase();
            const color: string = avatarColor();
            const avatar: string = generateAvatar(username.charAt(0).toUpperCase(), color, 'black');

            const body = {
                username,
                email: faker.internet.email(),
                password: 'Password@123',
                confirmPassword: 'Password@123',
                avatarColor: color,
                avatarImage: avatar
            };

            console.log(`***SEEDING USER TO DATABASE*** - ${i} - ${username}`);

            await axios.post(`${process.env.API}/signup`, body);

            i++;
        }
    }
    catch (err: any) {
        console.log(err);
    }
}

seedUserData(10);