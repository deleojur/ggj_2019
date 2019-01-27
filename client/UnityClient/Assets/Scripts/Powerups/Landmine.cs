using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Landmine : PowerupBaseClass
{

    public float expPower, expRadius;


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

