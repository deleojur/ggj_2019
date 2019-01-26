using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SpeedDown : Powerup {
    private float defaultSpeed;
    private float modifiedSpeed;

    public override void ActivatePowerup() {
        base.ActivatePowerup();
        Debug.Log("ActivatePowerup");
        defaultSpeed = player.Speed;
        modifiedSpeed = player.Speed *= 0.5f;
        player.Speed = modifiedSpeed;
    }

    public override void StopPowerup()
    {
        base.StopPowerup();
        player.Speed = defaultSpeed;
    }
}
