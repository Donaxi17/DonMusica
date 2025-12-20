import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HapticService } from '../../services/haptic.service';
import { SeoService } from '../../services/seo.service';
import { MusicApiService } from '../../services/music-api.service';

type GameMode = 'menu' | 'famous' | 'impostor';
type GameState = 'setup' | 'passing' | 'playing' | 'revealing' | 'round-result' | 'game-over';
type Category = 'singers' | 'soccer' | 'movies' | 'random';

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

    mode = signal<GameMode>('menu');
    state = signal<GameState>('setup');
    selectedCategory = signal<Category>('random');
    targetScore = signal<number>(5);

    numPlayers = signal<number>(2);
    players = signal<Player[]>([]);
    currentPlayerIndex = signal<number>(0);
    showContent = signal<boolean>(false);
    isLoading = signal<boolean>(false);

    roundWinners = signal<number[]>([]); // IDs of players who scored this round

    // Fallbacks si falla la API
    pools: Record<Category, string[]> = {
        singers: ['Bad Bunny', 'Karol G'],
        soccer: ['Messi', 'Cristiano'],
        movies: ['Spider-Man', 'Joker'],
        random: ['Shakira', 'Neymar']
    };

    categoriesList: { id: Category, icon: string, label: string }[] = [
        { id: 'singers', icon: '🎤', label: 'Música' },
        { id: 'soccer', icon: '⚽', label: 'Fútbol' },
        { id: 'movies', icon: '🎬', label: 'Cine' },
        { id: 'random', icon: '🎲', label: 'Azar' }
    ];

    ngOnInit() {
        this.seoService.setSeoData(
            'Juegos Musicales & Sociales | DonMusica Pro Games',
            'Diviértete con amigos en DonMusica Games con nuevas categorías, marcador de puntos y diseño ultra-responsive.'
        );
    }

    setMode(newMode: GameMode) {
        this.hapticService.medium();
        this.mode.set(newMode);
        this.state.set('setup');
        this.resetGame(true);
    }

    resetGame(resetScores: boolean = false) {
        if (resetScores) {
            this.players.set([]);
        } else {
            // Keep scores for new round
            const currentPlayers = this.players();
            currentPlayers.forEach(p => {
                p.seen = false;
                p.content = '';
            });
            this.players.set(currentPlayers);
        }
        this.currentPlayerIndex.set(0);
        this.showContent.set(false);
        this.roundWinners.set([]);
    }

    selectNumPlayers(n: number) {
        this.hapticService.light();
        this.numPlayers.set(n);
        // Reset players array to match new number
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

    selectCategory(cat: Category) {
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
        const existingPlayers = this.players();

        if (existingPlayers.length === 0) {
            this.selectNumPlayers(n);
        }

        const currentPlayers = this.players();

        if (this.mode() === 'famous') {
            this.musicApi.getGameFamous(this.selectedCategory()).subscribe(pool => {
                const finalPool = pool.length > 0 ? pool : this.pools[this.selectedCategory()];
                const shuffled = [...finalPool].sort(() => Math.random() - 0.5);

                for (let i = 0; i < n; i++) {
                    currentPlayers[i].role = 'Famoso';
                    currentPlayers[i].content = shuffled[i % shuffled.length];
                    currentPlayers[i].seen = false;
                }
                this.players.set([...currentPlayers]);
                this.isLoading.set(false);
                this.state.set('passing');
            });
        } else if (this.mode() === 'impostor') {
            this.musicApi.getGameWord().subscribe(word => {
                const impostorIndex = Math.floor(Math.random() * n);

                for (let i = 0; i < n; i++) {
                    currentPlayers[i].role = i === impostorIndex ? 'IMPOSTOR' : 'Ciudadano';
                    currentPlayers[i].content = i === impostorIndex ? 'Eres el IMPOSTOR' : word;
                    currentPlayers[i].seen = false;
                }
                this.players.set([...currentPlayers]);
                this.isLoading.set(false);
                this.state.set('passing');
            });
        }
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

        // Check for Game Over
        const maxScore = Math.max(...this.players().map(p => p.score));
        if (maxScore >= this.targetScore()) {
            this.state.set('game-over');
        } else {
            this.state.set('setup');
            this.resetGame(false);
        }
    }

    getWinner() {
        const sorted = [...this.players()].sort((a, b) => b.score - a.score);
        return sorted[0];
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
