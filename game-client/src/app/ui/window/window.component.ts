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
    buttons: string[] = ['Buy', 'Harvest', 'Invade'];
    showWindow: boolean;
    constructor(private gameService: GameService) { }

    ngOnInit() 
    {
        this.gameService.onCellSelected.subscribe((hex: Hex<Cell>) => this.hexSelected(hex));
    }

    private getStyle(top: number): any
    {
        return {
            width: '65%',
            left: '20%', 
            position: 'absolute',
            top: top + '%'
        };
    }

    getButtonStyle(index: number): any
    {
        return this.getStyle(38 + index * 16);
    }

    getTextStyle(index: number): any
    {
        const textStyle = this.getStyle(41 + index * 16);
        textStyle.fontFamily = 'FenwickWood';
        textStyle.color = 'orange';
        textStyle.pointerEvents = 'none';
        return textStyle;
    }

    hexSelected(hex: Hex<Cell>): void
    {
        this.showWindow = true;
    }

    closeWindow(): void
    {
        this.showWindow = false;
    }
}