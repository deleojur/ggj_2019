using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ChangeSpeed : PowerupBaseClass
{
    public float modifier;

    private float defaultSpeed;
    private float modifiedSpeed;

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
