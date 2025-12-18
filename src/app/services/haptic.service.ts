import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class HapticService {

    /**
     * Triggers a light haptic feedback (tick).
     * Ideal for small interactions like clicking a button or toggling a switch.
     */
    light(): void {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(10);
        }
    }

    /**
     * Triggers a medium haptic feedback (tap).
     * Ideal for more significant actions like hitting 'Play' or marking a favorite.
     */
    medium(): void {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(25);
        }
    }

    /**
     * Triggers a heavy haptic feedback.
     * Ideal for destructive or very impactful actions.
     */
    heavy(): void {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(50);
        }
    }

    /**
     * Triggers a specific vibration pattern.
     * @param pattern Array of vibration and pause durations.
     */
    vibrate(pattern: number | number[]): void {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    /**
     * Error feedback pattern (two quick vibrations).
     */
    error(): void {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate([40, 30, 40]);
        }
    }

    /**
     * Success feedback pattern (progressive vibrations).
     */
    success(): void {
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate([10, 50, 30]);
        }
    }
}
