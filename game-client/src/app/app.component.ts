import { Component } from '@angular/core';

@Component
({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})

export class AppComponent
{ 
    appHeight()
    {
        const doc = document.documentElement
        doc.style.setProperty('--app-height', `${window.innerHeight}px`)
    }
    constructor()
    {
        window.addEventListener('resize', this.appHeight)
        this.appHeight();
    }
}
