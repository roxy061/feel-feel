import mysql, { Pool, PoolOptions } from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var mysqlPool: Pool | undefined;
}

const connectionUri =
  process.env.DATABASE_URL ||
  process.env.MYSQL_URL ||
  process.env.TIDB_URL ||
  "";

const host =
  process.env.DB_HOST ||
  process.env.MYSQL_HOST ||
  process.env.TIDB_HOST ||
  "localhost";

// ตรวจสอบการเปิดใช้งาน SSL สำหรับ Cloud Database (TiDB Cloud, Aiven, PlanetScale, AWS RDS)
const isSslEnabled =
  process.env.DB_SSL === "true" ||
  process.env.MYSQL_SSL === "true" ||
  process.env.TIDB_SSL === "true" ||
  host.includes("tidbcloud.com") ||
  host.includes("aivencloud.com") ||
  host.includes("planetscale.com") ||
  connectionUri.includes("tidbcloud.com") ||
  connectionUri.includes("ssl=");

const sslConfig = isSslEnabled
  ? {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === "true",
      minVersion: "TLSv1.2",
    }
  : undefined;

const poolConfig: PoolOptions = connectionUri
  ? {
      uri: connectionUri,
      waitForConnections: true,
      connectionLimit: 10,
      maxIdle: 10,
      idleTimeout: 60000,
      connectTimeout: 20000,
      ssl: sslConfig,
    }
  : {
      host,
      port:
        Number(
          process.env.DB_PORT ||
            process.env.MYSQL_PORT ||
            process.env.TIDB_PORT
        ) || (host.includes("tidbcloud.com") || process.env.TIDB_HOST ? 4000 : 3306),
      user:
        process.env.DB_USER ||
        process.env.MYSQL_USER ||
        process.env.TIDB_USER ||
        "root",
      password:
        process.env.DB_PASSWORD ||
        process.env.MYSQL_PASSWORD ||
        process.env.TIDB_PASSWORD ||
        "",
      database:
        process.env.DB_NAME ||
        process.env.MYSQL_DATABASE ||
        process.env.TIDB_DATABASE ||
        "3nfm_saas",
      waitForConnections: true,
      connectionLimit: 10,
      maxIdle: 10,
      idleTimeout: 60000,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      connectTimeout: 20000,
      ssl: sslConfig,
    };

// Reuse connection pool across hot reloads in development and serverless invocations
export const db: Pool =
  global.mysqlPool || mysql.createPool(poolConfig);

if (process.env.NODE_ENV !== "production") {
  global.mysqlPool = db;
}

/**
 * Helper to run queries with automatic connection handling
 */
export async function query<T = any>(
  sql: string,
  values?: any[]
): Promise<T> {
  const [results] = await db.query(sql, values);
  return results as T;
}

export default db;
