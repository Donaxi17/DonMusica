import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Title, Meta } from '@angular/platform-browser';
import { SvgIconComponent } from '../shared/svg-icon/svg-icon.component';

@Component({
    selector: 'app-converter',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './converter.component.html',
    styleUrls: ['./converter.component.css']
})
export class ConverterComponent implements OnInit {

    constructor(
        private titleService: Title,
        private metaService: Meta
    ) { }

    ngOnInit() {
        this.titleService.setTitle('Convertidor MP3 - DonMusica');
        this.metaService.updateTag({
            name: 'description',
            content: 'Descarga música MP3 directamente desde nuestra web.'
        });
    }
}
