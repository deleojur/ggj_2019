using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GravityWell : PowerupBaseClass
{
    public float pullForce;
    private bool startPullForce;

    void Start()
    {
        //Set the main Color of the Material to green
        gameObject.GetComponent<Renderer>().material.color = Color.blue;
    }

    void FixedUpdate()
    {
        if (startPullForce)
        {
            Vector3 forceDirection = transform.position - player.gameObject.transform.position;
            player.Rigidbody.AddForce(forceDirection.normalized * pullForce * Time.deltaTime);
        }
    }

    public override void ActivatePowerup()
    {
        startPullForce = true;
        base.ActivatePowerup();
    }

    public override void StopPowerup()
    {
        startPullForce = false;
        base.StopPowerup();
    }
}
