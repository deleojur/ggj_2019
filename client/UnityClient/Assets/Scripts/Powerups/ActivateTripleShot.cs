using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ActivateTripleShot : PowerupBaseClass
{
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
