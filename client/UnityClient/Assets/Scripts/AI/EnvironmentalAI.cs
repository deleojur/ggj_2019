using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class EnvironmentalAI 
{   
    private float power = 1f;                    // increases over time

    private float BASE_MAX_TIMER = 1f;
    private float maxTimer = 5f;                 // recalculated when required based on power
    private float timer = 0;

    private float damage = 0.5f;            // the amount of damage dealt to a tile per attack
    private int effect = 1;                 // the amount of tiles that can be attacked

    private List<Tile> options;

    internal void DoUpdate()
    {
        if(timer <= 0)
        {
            maxTimer = BASE_MAX_TIMER * power * 1.1f;
            timer = maxTimer;
            Attack();
        }

        timer -= Time.deltaTime;
    }

    private void Attack()
    {
        // TODO: enable different kinds of attacks omg so cool

        FindOptions();

        // for as much effect as I have
        for (int i = 0; i < effect; i++)
        {
            // pick one and remove it from the options
            Tile toAttack = options[Random.Range(0, options.Count)];
            options.Remove(toAttack);

            toAttack.DealDamage(damage);
        }
    }

    private void FindOptions()
    {
        if (options == null)
            options = new List<Tile>();

        options.Clear();
        options = Main.Instance.worldManager.worldMap.PotentialTilesToDestory();
    }

    


}
