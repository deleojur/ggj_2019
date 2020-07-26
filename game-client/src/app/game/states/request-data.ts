import { Cell } from '../grid/grid';
import { Hex } from 'honeycomb-grid';

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
	name: string; //the mame of the command.
	originEntity: string; //the name of the origin entity (will be generated on the host side).
	targetEntity: string; //the name of the origin entity (will be generated on the host side).
	originCell: PositionData;
	targetCell: PositionData;
}

export interface TurnConfirmData extends RequestData
{
	turnConfirmed: boolean;
}