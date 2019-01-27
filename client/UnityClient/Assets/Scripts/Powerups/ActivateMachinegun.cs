using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ActivateMachinegun : PowerupBaseClass
{
    void Start()
    {
        Material mymat = GetComponent<ParticleSystemRenderer>().material;
        mymat.SetColor("_EmissionColor", Color.cyan);
    }

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
