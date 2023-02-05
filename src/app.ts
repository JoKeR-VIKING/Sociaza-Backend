import express, { Express } from 'express';
import { SociazaServer } from './setupServer';
import { Config } from './config';
import databaseConnection from './setupDatabase';

class Application {
    public start(): void {
        this.loadConfig();
        databaseConnection();
        const app: Express = express();
        const server: SociazaServer = new SociazaServer(app);
        server.start();
    }

    private loadConfig(): void {
        Config.validateConfig();
    }
}

const application: Application = new Application();
application.start();
