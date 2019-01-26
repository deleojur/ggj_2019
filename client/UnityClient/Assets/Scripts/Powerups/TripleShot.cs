using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class TripleShot : PowerupBaseClass
{
    void Start()
    {
        //Set the main Color of the Material to green
        gameObject.GetComponent<Renderer>().material.color = Color.green;
    }

    public override void ActivatePowerup()
    {
        base.ActivatePowerup();
        player.tripleShot = true;
    }

    public override void StopPowerup()
    {
        base.StopPowerup();
        player.tripleShot = false;
    }
}
