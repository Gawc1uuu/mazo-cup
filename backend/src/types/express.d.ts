import { UserTable } from "../database/schema";


declare global {
    namespace Express {
        interface Request {
            user?: typeof UserTable._type;
        }
    }
}