using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ActivateRocketlauncher : PowerupBaseClass
{
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
