import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-browse',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './browse.component.html'
})
export class BrowseComponent {

    scrollToLink(event: MouseEvent, nav: HTMLElement) {
        const target = event.currentTarget as HTMLElement;
        const containerLeft = nav.getBoundingClientRect().left;
        const targetLeft = target.getBoundingClientRect().left;
        const currentScroll = nav.scrollLeft;

        // Calculate the position to scroll to so the element is at the start (with some padding)
        // newScrollLeft = currentScroll + (targetLeft - containerLeft) - padding
        const padding = 20; // px
        nav.scrollTo({
            left: currentScroll + (targetLeft - containerLeft) - padding,
            behavior: 'smooth'
        });
    }
}
