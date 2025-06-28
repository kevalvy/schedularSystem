
import { Pool } from 'pg';
import constants from './constant.js';

class PostgresHelper {
    constructor() {
        this.client = new Pool({
            host: constants.ENV_CONFIG.PG_HOST,
            database: constants.ENV_CONFIG.PG_DB,
            user: constants.ENV_CONFIG.PG_USER,
            password: constants.ENV_CONFIG.PG_PASSWORD,
            port: constants.ENV_CONFIG.PG_PORT,
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
