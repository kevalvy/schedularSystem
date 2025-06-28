
import { Pool } from 'pg';
import ENV_CONFIG from '../lib/constant.js';

class PostgresHelper {
    constructor() {
        this.client = new Pool({
            host: ENV_CONFIG.DB_HOST,
            database: ENV_CONFIG.DB_NAME,
            user: ENV_CONFIG.DB_USER,
            password:ENV_CONFIG.DB_PASSWORD,
            port:ENV_CONFIG.DB_PORT,
        });
    }

    // Read query (SELECT)
    readQuery(dbQuery, params = []) {
        return new Promise((resolve, reject) => {
            this.client.query(dbQuery, params)
                .then(res => {
                    resolve(res ? res.rows : res);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    // Write query (INSERT, UPDATE, DELETE)
    writeQuery(dbQuery, params = []) {
        return new Promise((resolve, reject) => {
            this.client.query(dbQuery, params)
                .then(res => {
                    resolve(res ? res.rows : res);
                })
                .catch(err => {
                    // errorNotifier.notify(err, dbQuery); // Optional: add custom logging
                    reject(err);
                });
        });
    }
}

const postgresHelper = new PostgresHelper();
export default postgresHelper;
