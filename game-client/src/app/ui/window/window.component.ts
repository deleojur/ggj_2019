import { Cell } from './../../game/grid/grid';
import { Component, OnInit } from '@angular/core';
import { GameService } from 'src/services/game.service';
import { Subject } from 'rxjs';
import { Hex } from 'honeycomb-grid';

@Component({
  selector: 'app-ui-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.scss']
})
export class WindowComponent implements OnInit
{
    buttons: string[] = [''];
    showWindow: boolean = true;
    constructor(private gameService: GameService) { }

    ngOnInit()
    {
		this.gameService.onCellSelected.subscribe((hex: Hex<Cell>) => this.hexSelected(hex));
    }

    hexSelected(hex: Hex<Cell>): void
    {
        this.showWindow = true;
    }

    closeWindow($event): void
    {
        const closeWindow = $event.target.classList.contains('close-ui-window');
        if (closeWindow)
        {
            this.showWindow = false;
        }
    }
}
