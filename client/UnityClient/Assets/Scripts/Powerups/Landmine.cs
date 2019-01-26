using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Landmine : PowerupBaseClass
{

    public float expPower, expRadius;

    void Start()
    {
        //Set the main Color of the Material to green
        gameObject.GetComponent<Renderer>().material.color = Color.yellow;
    }

    public override void ActivatePowerup()
    {
        player.Rigidbody.AddExplosionForce(expPower, transform.position, expRadius);
        base.ActivatePowerup();
    }

    public override void StopPowerup()
    {
        base.StopPowerup();
    }
}

