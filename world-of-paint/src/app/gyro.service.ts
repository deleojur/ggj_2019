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
    addGyroListener(callback)
    {
        gyro.frequency = 10;
        gyro.startTracking(function (o)
        {
            callback(o);
        });
    }
}
