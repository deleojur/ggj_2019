using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ChangeFireMode : PowerupBaseClass
{

    public bool changeToTriple;

    void Start()
    {
        //Set the main Color of the Material to green
        gameObject.GetComponent<Renderer>().material.color = Color.green;
    }

    public override void ActivatePowerup()
    {
        base.ActivatePowerup();
        if (changeToTriple)
        {
            player.tripleShot = true;
        }
        else
        {
            player.machineGun = true;
        }
    }

    public override void StopPowerup()
    {
        base.StopPowerup();
        if (changeToTriple)
        {
            player.tripleShot = false;
        }
        else
        {
            player.machineGun = false;
        }
    }
}
