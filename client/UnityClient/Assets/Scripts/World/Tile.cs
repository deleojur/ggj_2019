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


    internal void SetColor()
    {
        render.material.color = Color.Lerp(Color.white, Color.black, faction);
    }

    internal void AddNeighbor(Tile neighbor)
    {
        neighborsIncludingNull.Add(neighbor);

        if (neighbor != null)
            neighbors.Add(neighbor);
    }
}
