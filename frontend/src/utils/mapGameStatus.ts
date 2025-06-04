// Definicja typu dla statusów gry - upewnij się, że zgadza się z tym, czego używasz
type GameStatus = 'waiting' | 'picking_teams' | 'ready';

interface StatusTranslations {
    waiting: string;
    picking_teams: string; // Poprawiono z 'teams_picking' na 'picking_teams'
    ready: string;
}

const statusTranslations: StatusTranslations = {
    waiting: 'Oczekiwanie',
    picking_teams: 'Wybieranie drużyn', // Poprawiono klucz
    ready: 'Gotowe',
};

export const translateGameStatus = (status: GameStatus): string => {
    return statusTranslations[status] || 'Nieznany status';
};