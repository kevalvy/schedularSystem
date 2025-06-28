import dotenv from 'dotenv';

dotenv.config();

const ENV_CONFIG = {
    DB_USER: process.env.DB_USER || 'postgres',
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_NAME: process.env.DB_NAME || 'schedular',
    DB_PASSWORD: process.env.DB_PASSWORD || 'root',
    DB_PORT: Number(process.env.DB_PORT) || 5432,

    PORT: Number(process.env.PORT) || 3000,
};

export default ENV_CONFIG;