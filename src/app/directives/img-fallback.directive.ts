import { Directive, HostListener, Input, ElementRef } from '@angular/core';

@Directive({
    selector: 'img[appImgFallback]',
    standalone: true
})
export class ImgFallbackDirective {
    @Input() appImgFallback: string = 'assets/icons/icon-512x512.png'; // Default fallback

    constructor(private el: ElementRef) { }

    @HostListener('error')
    onError() {
        const element: HTMLImageElement = this.el.nativeElement;
        if (element.src !== this.appImgFallback) {
            element.src = this.appImgFallback;
            // Add a class to indicate it's a fallback if needed for styling
            element.classList.add('img-fallback-active');
        }
    }
}
