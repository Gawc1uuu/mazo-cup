export interface Player {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: "player" | "captain1" | "captain2";
}