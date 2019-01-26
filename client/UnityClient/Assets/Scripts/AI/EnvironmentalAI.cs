using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class EnvironmentalAI 
{   
    private float power = 1f;                    // increases over time
    private const float MAX_POWER = 300f;
    private float maxPower = 300f;
    private float powerPercent { get { return power / MAX_POWER; } }

    private const float START_TIMER = 1.7f;
    private const float END_TIMER = 0.02f;
    private float maxTimer = 5f;                 // recalculated when required based on power
    private float timer = 0;

    private const float START_MIN_DMG = 0.2f;
    private const float START_MAX_DMG = 0.6f;
    private const float END_MIN_DMG = 0.8f;
    private const float END_MAX_DMG = 1.0f;
    private float minDamage = 0.5f;            // the amount of damage dealt to a tile per attack
    private float maxDamage = 0.5f;

    private const float START_EFFECT = 10f;
    private const float END_EFFECT = 30f;
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
            maxTimer = Mathf.Lerp(START_TIMER, END_TIMER, powerPercent);
            timer = maxTimer;
            Attack();
        }

        power += Time.deltaTime;
        power = Mathf.Clamp(power, 0, maxPower);

        effect = Mathf.CeilToInt(Mathf.Lerp(START_EFFECT, END_EFFECT, powerPercent));

        minDamage = Mathf.Lerp(START_MIN_DMG, END_MIN_DMG, powerPercent);
        maxDamage = Mathf.Lerp(START_MAX_DMG, END_MAX_DMG, powerPercent);

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
