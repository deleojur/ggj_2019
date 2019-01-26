using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PowerupBaseClass : MonoBehaviour
{
    public PlayerController player;
    public float seconds = 5f;

    private float timer;
    private bool startTimer;

    private void Update()
    {
        if (startTimer)
        {
            timer += Time.deltaTime;
            if (timer > seconds)
            {
                StopPowerup();
                timer = 0f;
            }
        }
        else
        {
            timer += Time.deltaTime;
            if (timer > 10f)
            {
                Destroy(gameObject);
                timer = 0f;
            }
        }
    }

    public virtual void StopPowerup()
    {
        // Stop powerup
        startTimer = false;
        timer = 0f;
        Destroy(gameObject);
    }

    private void OnTriggerEnter(Collider other)
    {
        if (other.gameObject.CompareTag("Player"))
        {
            player = other.gameObject.GetComponent<PlayerController>();
            ActivatePowerup();

            startTimer = true;
            timer = 0f;
        }
    }

    public virtual void ActivatePowerup()
    {
        gameObject.GetComponent<MeshRenderer>().enabled = false;
    }
}
