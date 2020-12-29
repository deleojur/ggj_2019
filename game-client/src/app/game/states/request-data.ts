import { Cell } from '../grid/grid';
import { Hex } from 'honeycomb-grid';
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

export interface RequestCardData extends RequestData
{
	amount: number;
	id: string; //clientid
}

export interface RequestDraftCardData extends RequestData
{
	
}

export interface ResponseCardData extends RequestData
{
	cardIds: number[];
}

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
	owner: string;
	name: string; //the mame of the command.
	originEntityGuid: number;
	targetEntityName: string; //the name of the target entity.
	targetEntityGuid: number; //if a new entity is created or another entity is referenced, make sure that the same reference is used.
	path?: PositionData[];
	behaviorInformation: string;
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