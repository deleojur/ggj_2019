using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SpeedDown : PowerupBaseClass
{
    private float defaultSpeed;
    private float modifiedSpeed;

    void Start()
    {
        //Set the main Color of the Material to green
        gameObject.GetComponent<Renderer>().material.color = Color.red;
    }

    public override void ActivatePowerup() {
        base.ActivatePowerup();
        Debug.Log("Speed Down Powerup Activated");
        defaultSpeed = player.Speed;
        modifiedSpeed = player.Speed *= 0.5f;
        player.Speed = modifiedSpeed;
    }

    public override void StopPowerup()
    {
        Debug.Log("Speed Down Powerup Finished");
        base.StopPowerup();
        player.Speed = defaultSpeed;
    }
}
