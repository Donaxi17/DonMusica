import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HapticService } from '../../services/haptic.service';
import { SeoService } from '../../services/seo.service';
import { MusicApiService } from '../../services/music-api.service';
import { GameService, GameCategory } from '../../services/game.service';

type GameMode = 'menu' | 'famous' | 'impostor';
type GameState = 'setup' | 'passing' | 'playing' | 'revealing' | 'round-result' | 'game-over';

interface Player {
    id: number;
    name: string;
    role: string;
    content: string;
    seen: boolean;
    score: number;
}

@Component({
    selector: 'app-games',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './games.component.html',
    styleUrl: './games.component.css'
})
export class GamesComponent {
    private hapticService = inject(HapticService);
    private seoService = inject(SeoService);
    private musicApi = inject(MusicApiService);
    private gameApi = inject(GameService);

    mode = signal<GameMode>('menu');
    state = signal<GameState>('setup');
    selectedCategory = signal<GameCategory>('random');
    targetScore = signal<number>(5);

    numPlayers = signal<number>(2);
    players = signal<Player[]>([]);
    currentPlayerIndex = signal<number>(0);
    showContent = signal<boolean>(false);
    isLoading = signal<boolean>(false);

    roundWinners = signal<number[]>([]); // IDs of players who scored this round

    categoriesList: { id: GameCategory, icon: string, label: string, desc: string }[] = [
        { id: 'singers', icon: '🎤', label: 'Música', desc: 'Artistas que suenan en Colombia' },
        { id: 'soccer', icon: '⚽', label: 'Fútbol', desc: 'Cracks de nuestra Selección' },
        { id: 'food', icon: '🥘', label: 'Comida', desc: 'Platos típicos y delicias' },
        { id: 'cities', icon: '🏙️', label: 'Ciudades', desc: 'Pueblos y capitales' },
        { id: 'tv', icon: '📺', label: 'Farándula', desc: 'TV y Personajes' },
        { id: 'random', icon: '🎲', label: 'Azar', desc: 'Mezcla de todo un poco' }
    ];

    ngOnInit() {
        this.seoService.setSeoData(
            'DonMusica Games | Diversión en grupo',
            'Juegos sociales con temática colombiana. Famosos, Impostor y más categorías dinámicas.'
        );
    }

    setMode(newMode: GameMode) {
        this.hapticService.medium();
        this.mode.set(newMode);

        // Ajuste automático de jugadores mínimos por modo
        if (newMode === 'impostor' && this.numPlayers() < 3) {
            this.selectNumPlayers(3);
        } else if (newMode === 'famous' && this.numPlayers() < 2) {
            this.selectNumPlayers(2);
        }

        this.state.set('setup');
        this.resetGame(true);
    }

    resetGame(resetScores: boolean = false) {
        if (resetScores) {
            this.players.set([]);
            this.selectNumPlayers(this.numPlayers());
        } else {
            const currentPlayers = this.players();
            currentPlayers.forEach(p => {
                p.seen = false;
                p.content = '';
                p.role = '';
            });
            this.players.set([...currentPlayers]);
        }
        this.currentPlayerIndex.set(0);
        this.showContent.set(false);
        this.roundWinners.set([]);
    }

    selectNumPlayers(n: number) {
        this.hapticService.light();
        this.numPlayers.set(n);
        const newPlayers: Player[] = [];
        for (let i = 0; i < n; i++) {
            newPlayers.push({
                id: i + 1,
                name: `Jugador ${i + 1}`,
                role: '',
                content: '',
                seen: false,
                score: 0
            });
        }
        this.players.set(newPlayers);
    }

    selectCategory(cat: GameCategory) {
        this.hapticService.light();
        this.selectedCategory.set(cat);
    }

    setTargetScore(score: number) {
        this.hapticService.light();
        this.targetScore.set(score);
    }

    startGame() {
        this.hapticService.success();
        this.isLoading.set(true);
        const n = this.numPlayers();

        if (this.players().length !== n) {
            this.selectNumPlayers(n);
        }

        const currentPlayers = [...this.players()];

        if (this.mode() === 'famous') {
            this.gameApi.getFamousPool(this.selectedCategory()).subscribe({
                next: (pool) => {
                    const shuffled = [...pool].sort(() => Math.random() - 0.5);
                    for (let i = 0; i < n; i++) {
                        currentPlayers[i].role = 'Famoso';
                        currentPlayers[i].content = shuffled[i % shuffled.length] || 'Personaje';
                        currentPlayers[i].seen = false;
                    }
                    this.finalizeStart(currentPlayers);
                },
                error: () => this.handleCallError()
            });
        } else if (this.mode() === 'impostor') {
            this.gameApi.getGameWord().subscribe({
                next: (word) => {
                    const impostorIndex = Math.floor(Math.random() * n);
                    for (let i = 0; i < n; i++) {
                        currentPlayers[i].role = i === impostorIndex ? 'IMPOSTOR' : 'Ciudadano';
                        currentPlayers[i].content = i === impostorIndex ? '¡Eres el IMPOSTOR!' : word;
                        currentPlayers[i].seen = false;
                    }
                    this.finalizeStart(currentPlayers);
                },
                error: () => this.handleCallError()
            });
        }
    }

    private finalizeStart(ps: Player[]) {
        this.players.set(ps);
        this.isLoading.set(false);
        this.state.set('passing');
        this.currentPlayerIndex.set(0);
    }

    private handleCallError() {
        this.isLoading.set(false);
        // Fallback local en caso de error de red crítico
        const ps = this.players();
        ps.forEach(p => { p.role = 'Error'; p.content = 'Reintenta'; });
        this.players.set([...ps]);
    }

    revealForPlayer() {
        this.hapticService.medium();
        this.showContent.set(true);
    }

    confirmSeen() {
        this.hapticService.light();
        const current = this.currentPlayerIndex();
        this.players.update(ps => {
            ps[current].seen = true;
            return [...ps];
        });

        this.showContent.set(false);

        if (current < this.numPlayers() - 1) {
            this.currentPlayerIndex.set(current + 1);
        } else {
            this.state.set('playing');
        }
    }

    finishGame() {
        this.hapticService.success();
        this.state.set('revealing');
    }

    toggleRoundWinner(playerId: number) {
        this.hapticService.light();
        this.roundWinners.update(winners => {
            if (winners.includes(playerId)) {
                return winners.filter(id => id !== playerId);
            }
            return [...winners, playerId];
        });
    }

    confirmRound() {
        this.hapticService.success();
        const winners = this.roundWinners();

        this.players.update(ps => {
            ps.forEach(p => {
                if (winners.includes(p.id)) {
                    p.score += 1;
                }
            });
            return [...ps];
        });

        const maxScore = Math.max(...this.players().map(p => p.score));
        if (maxScore >= this.targetScore()) {
            this.state.set('game-over');
        } else {
            this.nextRound();
        }
    }

    getWinner() {
        return [...this.players()].sort((a, b) => b.score - a.score)[0];
    }

    backToMenu() {
        this.hapticService.light();
        this.mode.set('menu');
        this.state.set('setup');
        this.resetGame(true);
    }

    nextRound() {
        this.hapticService.medium();
        this.state.set('setup');
        this.resetGame(false);
    }
}
