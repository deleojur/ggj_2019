using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PowerupSpawner : MonoBehaviour
{
    public float spawnTime = 3f;            // How long between each spawn.
    public GameObject[] powerups;           // List of all powerups.
    private int index;
    private Tile tile;

    void Start()
    {
        // Call the Spawn function after a delay of the spawnTime and then continue to call after the same amount of time.
        InvokeRepeating("Spawn", spawnTime, spawnTime);
    }

    void Spawn()
    {
        if (Main.Instance.state != (int)GameState.Game)
            return;

        index = Random.Range(0, powerups.Length);
        tile = Main.Instance.worldManager.worldMap.GetValidPowerUpTile();
        Instantiate(powerups[index], tile.transform.position, Quaternion.Euler(-50, 50, 0));
    }
}
