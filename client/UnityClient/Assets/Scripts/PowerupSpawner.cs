using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PowerupSpawner : MonoBehaviour
{
    public float spawnTime = 3f;            // How long between each spawn.
    public GameObject[] powerups;           // List of all powerups.
    private int index;

    void Start()
    {
        // Call the Spawn function after a delay of the spawnTime and then continue to call after the same amount of time.
        InvokeRepeating("Spawn", spawnTime, spawnTime);
    }

    void Spawn()
    {
        index = Random.Range(0, powerups.Length);
      //  Instantiate(powerups[index], );
    }

}
