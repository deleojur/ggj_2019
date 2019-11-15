export interface RequestData
{
    
}

export interface RoomData extends RequestData
{
    roomid: string;
};

export interface ClientData extends RequestData
{
    name: string,
    color: string,
    id: string,
    status: string;
};

export interface PositionData extends RequestData
{
    id: string;
    x: number;
    y: number;
};