import { BuyableItemModel, resource, ResourceType } from 'src/app/ui/menu-item/buyableItem-model';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class merchandiseService
{
	private merchandiseMap: Map<string, BuyableItemModel>;

	constructor()
	{
		this.merchandiseMap = new Map<string, BuyableItemModel>();
		this.merchandiseMap.set('town', new BuyableItemModel('town', '', [new resource(ResourceType.Gold, 2), new resource(ResourceType.Food, 3)]));
		this.merchandiseMap.set('village', new BuyableItemModel('village', 'upgrade town to a village', [new resource(ResourceType.Gold, 5)]));
	}

	public merchandise(name: string): BuyableItemModel
	{
		return this.merchandiseMap.get(name);
	}
}