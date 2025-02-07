export default () => ({
  NODE_ENV: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10) || 3001,
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    name: process.env.DATABASE_NAME,
  },
  jwt: { secret: process.env.JWT_SECRET },
});
