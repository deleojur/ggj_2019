import { BuyableItemModel, Resource, ResourceType } from 'src/app/ui/menu-item/buyableItem-model';
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
		this.merchandiseMap.set('town', new BuyableItemModel('Town', '', [new Resource(ResourceType.Gold, 2), new Resource(ResourceType.Food, 5), new Resource(ResourceType.Population, 2)], [new Resource(ResourceType.Gold, 1), new Resource(ResourceType.Population, -1)]));
		this.merchandiseMap.set('village', new BuyableItemModel('Village', '', [new Resource(ResourceType.Gold, 2), new Resource(ResourceType.Food, 5), new Resource(ResourceType.Population, 2)]));
		this.merchandiseMap.set('city', new BuyableItemModel('City', 'upgrade town to a village', [new Resource(ResourceType.Gold, 5)]));
	}

	public getMerchandise(name: string): BuyableItemModel
	{
		return this.merchandiseMap.get(name);
	}

	public getPlaceholderItems(): BuyableItemModel[]
	{
		return Array.from(this.merchandiseMap.values());
	}
}