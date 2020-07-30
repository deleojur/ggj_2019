import { Cell } from '../grid/grid';
import { Hex } from 'honeycomb-grid';
import { BehaviorInformation } from '../entities/entity';

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

export interface TurnInformationData extends RequestData
{
	turnCommands: { 
		name: string; //the mame of the command.
		originEntityGuid: number;
		targetEntityName: string; //the name of the target entity.
		originCell: PositionData;
		targetCell: PositionData;
		behaviorInformation: BehaviorInformation
	}[];
}

export interface TurnConfirmData extends RequestData
{
	turnConfirmed: boolean;
}