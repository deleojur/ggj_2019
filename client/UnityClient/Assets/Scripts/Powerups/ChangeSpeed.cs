using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ChangeSpeed : PowerupBaseClass
{
    public float modifier;

    private float defaultSpeed;
    private float modifiedSpeed;

    void Start()
    {
        //Set the main Color of the Material to green
        gameObject.GetComponent<Renderer>().material.color = Color.red;
    }

    public override void ActivatePowerup() {
        base.ActivatePowerup();
        defaultSpeed = player.Speed;
        modifiedSpeed = player.Speed *= modifier;
        player.Speed = modifiedSpeed;
    }

    public override void StopPowerup()
    {
        base.StopPowerup();
        player.Speed = defaultSpeed;
    }
}
