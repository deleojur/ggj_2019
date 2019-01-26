using PhantomGrammar.GrammarCore;
using PhantomGrammar.Voronoi;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public enum PowerUpType { None = 0, Speed }

public class Tile : MonoBehaviour
{
    internal int tx;
    internal int tz;
    
    internal Vector3[] poly;
    internal MeshRenderer render;

    internal VoronoiCell cell;
    internal Symbol symbol;
    internal List<Tile> neighbors;
    internal List<Tile> neighborsIncludingNull;

    internal PowerUpType powerUpType = PowerUpType.None;
    internal float faction = 0f;

    internal float hp;

    internal void Initialize(VoronoiCell cell, Symbol symbol, Vector3[] poly)
    {
        this.cell = cell;
        this.symbol = symbol;
        this.poly = poly;

        render = this.GetComponent<MeshRenderer>();

        neighbors = new List<Tile>();
        neighborsIncludingNull = new List<Tile>();

        // TODO: obtain powerup from symbol!

        if (symbol.Label == "open")
            faction = 0f;
        else if (symbol.Label == "closed")
            faction = 1f;

        hp = 1f;
    }

    // TODO: damage methodes!
    internal void DealDamage(float damage)
    {
        Debug.LogError("Deal damage!");
        hp -= damage;
        StartCoroutine("LerpColor");
    }

    private IEnumerator LerpColor()
    {
        float start = faction;
        float end = 1 - hp;

        float elapsed = 0.0f;
        float total = 1.0f;
        while (elapsed < total)
        {
            elapsed += Time.deltaTime;
            SetColor((end - start) + end * elapsed);
            yield return new WaitForEndOfFrame();
        }

        faction = 1 - hp;
        Debug.LogError("new faction: " + faction);
        yield return null;
    }

    internal void SetColor()
    {
        render.material.color = Color.Lerp(Color.white, Color.black, faction);
    }

    internal void SetColor(float value)
    {
        render.material.color = Color.Lerp(Color.white, Color.black, value);
    }

    internal void AddNeighbor(Tile neighbor)
    {
        neighborsIncludingNull.Add(neighbor);

        if (neighbor != null)
            neighbors.Add(neighbor);
    }

    internal bool NeighborOfType(float faction)
    {
        for(int i = 0; i < neighbors.Count; i++)
        {
            if (neighbors[i].faction == faction)
                return true;
        }

        return false;
    }
}
