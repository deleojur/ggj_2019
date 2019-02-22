import { Injectable } from '@angular/core';
import gyro from '../lib/gyro';

@Injectable
({
    providedIn: 'root'
})
export class GyroService 
{
    constructor() 
    {
    }
    startTracking(callback)
    {
        gyro.frequency = 10;
        gyro.startTracking(function (o)
        {
            callback(o);
        });
    }
    stopTracking()
    {
        gyro.stopTracking();
    }
}
