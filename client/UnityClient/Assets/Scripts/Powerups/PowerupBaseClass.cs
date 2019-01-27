using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PowerupBaseClass : MonoBehaviour
{
    public Color[] lerpColors;
    private int currentColor;
    private int nextColor;
    private float colorTimer;

    public PlayerController player;
    public float seconds = 5f;

    private float timer;
    private bool startTimer;

    public GameObject particles;
    private GameObject particlesClone;
    private Material mymat;

    private void Start()
    {
        mymat = GetComponent<ParticleSystemRenderer>().material;

        currentColor = 0;
        nextColor = 1;
    }

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

        // color lerp
        mymat.SetColor("_EmissionColor", Color.Lerp(lerpColors[currentColor], lerpColors[nextColor], colorTimer));
        colorTimer += Time.deltaTime;
        if (colorTimer >= 1.0f)
        {
            colorTimer = 0;
            currentColor++;
            if (currentColor > lerpColors.Length - 1)
                currentColor = 0;
            nextColor++;
            if (nextColor > lerpColors.Length - 1)
                nextColor = 0;
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
            particlesClone = Instantiate(particles, other.transform.position, Quaternion.Euler(-90, transform.rotation.y, transform.rotation.z));

            player = other.gameObject.GetComponent<PlayerController>();
            ActivatePowerup();
        }
    }

    public virtual void ActivatePowerup()
    {
        gameObject.GetComponent<ParticleSystem>().Stop(true, ParticleSystemStopBehavior.StopEmittingAndClear);
        startTimer = true;
        timer = 0f;
    }
}
