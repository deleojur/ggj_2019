import { Component, OnInit } from '@angular/core';
import { resource } from './buyableItem-model';
import { merchandiseService } from 'src/services/merchandise.serevice';

@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss']
})
export class MenuItemComponent implements OnInit
{
	merchandise: string[] = ['town', 'village', 'farm'];
	constructor() { }

    ngOnInit() 
    {

    }
}