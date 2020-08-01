import { Cell } from '../grid/grid';
import { Hex } from 'honeycomb-grid';
import { BehaviorInformation } from '../entities/entity';
import { Resource } from '../entities/resource';

export interface RequestData
{
    id?: string;
}

export interface RoomData extends RequestData
{
    roomid: string;
};

export interface ClientData extends RequestData
{
    name: string;
    color: string;
	status: string;
	startingPosition: number;
};

export interface PositionData extends RequestData
{
    x: number;
    y: number;
};

export interface EntityData extends RequestData
{
	hex: Hex<Cell>;
	name: string;
}

export interface HostStartGameData extends RequestData
{
	clients: ClientData[];
}

export interface TurnCommandData
{
	name: string; //the mame of the command.
	originEntityGuid: number;
	targetEntityName: string; //the name of the target entity.
	originCell: PositionData;
	targetCell: PositionData;
	behaviorInformation: BehaviorInformation;
}

export interface TurnInformationData extends RequestData
{
	turnCommands: TurnCommandData[];
}

export interface TurnConfirmData extends RequestData
{
	turnConfirmed: boolean;
}

export interface TurnResolveData extends RequestData
{
	validTurnCommands: TurnInformationData;
	resources: Resource[];
}