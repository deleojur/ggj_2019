using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ActivateMachinegun : PowerupBaseClass
{
    void Start()
    {
        //Set the main Color of the Material to green
        gameObject.GetComponent<Renderer>().material.color = Color.cyan;
    }

    public override void ActivatePowerup()
    {
        base.ActivatePowerup();
        player.machineGun = true;
    }

    public override void StopPowerup()
    {
        base.StopPowerup();
        player.machineGun = false;
    }
}
