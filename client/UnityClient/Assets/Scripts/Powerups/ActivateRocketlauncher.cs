using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ActivateRocketlauncher : PowerupBaseClass
{
    void Start()
    {
        //Set the main Color of the Material to green
        gameObject.GetComponent<Renderer>().material.color = Color.yellow;
    }

    public override void ActivatePowerup()
    {
        base.ActivatePowerup();
        player.rocketLauncher = true;
    }

    public override void StopPowerup()
    {
        base.StopPowerup();
        player.rocketLauncher = false;
    }
}
