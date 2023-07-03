import express, { Express } from 'express';
import { SociazaServer } from '@root/setupServer';
import { Config } from '@root/config';
import databaseConnection from '@root/setupDatabase';
import Logger from 'bunyan';

const log: Logger = Config.createLogger('app');

class Application {
    public start(): void {
        this.loadConfig();
        databaseConnection();
        const app: Express = express();
        const server: SociazaServer = new SociazaServer(app);
        server.start();
        Application.handleExit();
    }

    private loadConfig(): void {
        Config.validateConfig();
        Config.cloudinaryConfig();
    }

    private static handleExit(): void {
        process.on('uncaughtException', (err: Error) => {
            log.error(`There was an uncaught error: ${err}`);
            Application.shutDownProperly(1);
        });

        process.on('unhandledRejection', (err: Error) => {
            log.error(`There was an unhandled rejection: ${err}`);
            Application.shutDownProperly(2);
        });

        process.on('SIGTERM', () => {
            log.error(`Caught SIGTERM`);
            Application.shutDownProperly(2);
        });

        process.on('SIGINT', (err: Error) => {
            log.error(`Caught SIGINT`);
            Application.shutDownProperly(2);
        });

        process.on('exit', (err: Error) => {
            log.error(`Exiting`);
        });
    }

    private static shutDownProperly(exitCode: number): void {
        Promise.resolve().then(() => {
            log.info('Shutdown complete');
            process.exit(exitCode);
        }).catch((err) => {
            log.error(`Error during shutdown: ${err}`);
            process.exit(1);
        })
    }
}

const application: Application = new Application();
application.start();
