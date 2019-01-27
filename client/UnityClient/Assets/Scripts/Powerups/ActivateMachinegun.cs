using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ActivateMachinegun : PowerupBaseClass
{
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
