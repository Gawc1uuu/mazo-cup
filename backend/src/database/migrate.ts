import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./db";

const migration = async () => {
  try {
    await migrate(db, {
      migrationsFolder: "src/database/migrations",
    });
  } catch (err) {
    throw err;
  }
};

migration()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .then(() => {
    console.log("Migration successful");
    process.exit(0);
  });
