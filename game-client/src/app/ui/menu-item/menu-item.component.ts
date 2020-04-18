import { Component, OnInit, Input } from '@angular/core';
import { resource, BuyableItemModel } from './buyableItem-model';
import { merchandiseService } from 'src/services/merchandise.service';

@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss']
})
export class MenuItemComponent implements OnInit
{
	@Input()
	public menuItemName;

	item: BuyableItemModel;

	constructor(private merchandiseService: merchandiseService) { }

    ngOnInit() 
    {
		this.item = this.merchandiseService.merchandise(this.menuItemName);
    }
}