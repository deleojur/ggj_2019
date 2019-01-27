using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class EnvironmentalAI 
{   
    private float power = 1f;                    // increases over time
    private float maxPower = 300f;
    private float powerPercent { get { return power / Main.Instance.maxPower; } }

    private float maxTimer = 5f;                 // recalculated when required based on power
    private float timer = 0;

    private float minDamage = 0.5f;            // the amount of damage dealt to a tile per attack
    private float maxDamage = 0.5f;

    private int effect = 1;                 // the amount of tiles that can be attacked

    private List<Tile> options;

    internal void PlayerUpdate()
    {
        // TODO: better player update
        //int n = Main.Instance.playerManager.PlayerAmount;
        //maxPower = MAX_POWER * n;
    }

    internal void DoUpdate()
    {
        if(timer <= 0)
        {
            maxTimer = Mathf.Lerp(Main.Instance.startTimer, Main.Instance.endTimer, powerPercent);
            timer = maxTimer;
            Attack();
        }

        power += Time.deltaTime;
        power = Mathf.Clamp(power, 0, maxPower);

        effect = Mathf.CeilToInt(Mathf.Lerp(Main.Instance.startEffect, Main.Instance.endEffect, powerPercent));

        minDamage = Mathf.Lerp(Main.Instance.startMinDmg, Main.Instance.endMinDmg, powerPercent);
        maxDamage = Mathf.Lerp(Main.Instance.startMaxDmg, Main.Instance.endMaxDmg, powerPercent);

        timer -= Time.deltaTime;
    }

    private void Attack()
    {
        // TODO: enable different kinds of attacks omg so cool
        FindOptions();

        if (options == null)
            return;

        // for as much effect as I have
        for (int i = 0; i < effect; i++)
        {
            // pick one and remove it from the options
            Tile toAttack = options[Random.Range(0, options.Count - 1)];
            options.Remove(toAttack);

            toAttack.DealDamage(Random.Range(minDamage, maxDamage + 0.1f));
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
