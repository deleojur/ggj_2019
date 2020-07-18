import { Cell } from '../grid/grid';
import { Hex } from 'honeycomb-grid';

export interface RequestData
{
    id: string;
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
	
}

export interface TurnData extends RequestData
{

}