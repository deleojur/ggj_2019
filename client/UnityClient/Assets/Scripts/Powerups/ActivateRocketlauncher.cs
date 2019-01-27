using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ActivateRocketlauncher : PowerupBaseClass
{
    void Start()
    {
        Material mymat = GetComponent<ParticleSystemRenderer>().material;
        mymat.SetColor("_EmissionColor", Color.red);
    }

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
