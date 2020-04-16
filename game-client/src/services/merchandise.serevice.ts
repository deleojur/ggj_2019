import { buyableItemModel, resource, ResourceType } from 'src/app/ui/menu-item/buyableItem-model';

export class merchandiseService
{
	private merchandiseMap: Map<string, buyableItemModel>;

	constructor()
	{
		this.merchandiseMap.set('town', new buyableItemModel('new town', '', [new resource(ResourceType.Gold, 5)]));
		this.merchandiseMap.set('village', new buyableItemModel('upgrade: village', 'upgrade to a village', [new resource(ResourceType.Gold, 5)]));
	}
}