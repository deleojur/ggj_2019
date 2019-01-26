using Assets.Utils;
using PhantomGrammar.BaseClasses;
using PhantomGrammar.GrammarCore;
using PhantomGrammar.Voronoi;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class WorldMap
{
    internal Vector3 spawnLocation;
    internal int mapWidth;
    internal int mapHeight;

    internal PhRandom random;

    private GameObject mapParent;
    private Material mapMaterial;   // TODO: differentiate

    internal Expression worldMapData;
    private List<VoronoiCell> cells;
    private Tile[] tiles;

    internal void Initialize()
    {
        random = new PhRandom(Main.Instance.seed);

        mapParent = Main.Instance.transform.Find("MapParent").gameObject;
        mapMaterial = Resources.Load<Material>("Materials/BaseMaterial");
    }

    internal List<Tile> PotentialTilesToDestory()
    {
        List<Tile> options = new List<Tile>();

        for (int i = 0; i < tiles.Length; i++)
        {
            if (tiles[i].faction < 1f && tiles[i].NeighborOfType(1f))
                options.Add(tiles[i]);
        }

        return options;
    }

    internal void Build(Expression worldMapData)
    {
        this.worldMapData = worldMapData;
        mapWidth = worldMapData.Width;
        mapHeight = worldMapData.Height;

        // TODO: define camera bounds

        // create!
        CreateVoronoiData(worldMapData);
        CreateVisualMap(worldMapData);

        // set colors
        for(int i = 0; i < tiles.Length; i++)
        {
            tiles[i].SetColor();
        }

        // obtain start
        for(int i = 0; i < tiles.Length; i++)
        {
            if (tiles[i].symbol.Label == "start")
                spawnLocation = tiles[i].gameObject.transform.position;
        }
    }

    private void CreateVoronoiData(Expression worldMapData)
    {
        // define voronoi and vertices
        VoronoiCore voronoi = new VoronoiCore();
        List<Vertex> vertices = new List<Vertex>();

        // define empty lists for the x, y coordinates
        List<float> xs = new List<float>();
        List<float> ys = new List<float>();
        for(int y = 0; y < mapHeight; y++)
        {
            for (int x = 0; x < mapWidth; x++)
            {
                xs.Add(0);
                ys.Add(0);
            }
        }

        // noise the positions
        for (int y = 0; y < mapHeight; y++)
        {
            for (int x = 0; x < mapWidth; x++)
            {
                Symbol tile = worldMapData.Symbols[x + (mapHeight - 1 - y) * mapWidth];
                int index = x + y * mapWidth;

                //so many magic numbers smh
                float a = 0.4f;
                xs[index] = (Mathf.PerlinNoise((float)x * a + 123.1f, (float)y * a + 765.1f) - 0.5f) * 1f;
                ys[index] = (Mathf.PerlinNoise((float)x * a + 932.1f, (float)y * a - 497.1f) - 0.5f) * 1f;

                xs[index] += (random.NextFloat() - 0.5f) * 0.2f;
                ys[index] += (random.NextFloat() - 0.5f) * 0.2f;

                xs[index] = x + Mathf.Clamp(xs[index], -0.4f, 0.4f);
                ys[index] = y + Mathf.Clamp(ys[index], -0.4f, 0.4f);

                xs[index] += (random.NextFloat() - 0.5f) * 0.01f;
                ys[index] += (random.NextFloat() - 0.5f) * 0.01f;

                xs[index] = Mathf.Clamp(xs[index], -0.9f, mapWidth - 0.1f);
                ys[index] = Mathf.Clamp(ys[index], -0.9f, mapHeight - 0.1f);

                // add the vertex
                vertices.Add(new Vertex(xs[index], ys[index], x + y * mapWidth));
            }
        }

        for (int i = 0; i < vertices.Count; i++)
        {
            vertices[i].Y += i * 0.000001f; //save guard to prevent voronoi cells to have the exact same Y value (which causes crashes)
        }

        // compute voronoi
        voronoi.Compute(vertices, new Boundary(-1, -1, mapWidth, mapHeight));

        // add all voronoi cells to a list
        cells = new List<VoronoiCell>();
        cells.Clear();
        cells.AddRange(voronoi.Cells);
    }

    private void CreateVisualMap(Expression worldMapData)
    {
        tiles = new Tile[mapWidth * mapHeight];

        VoronoiCell[] orderedCells = new VoronoiCell[cells.Count];
        for(int i = 0; i < cells.Count; i++)
        {
            if (cells[i].NodeIndex >= 0)
                orderedCells[cells[i].NodeIndex] = cells[i];
        }


        // create all poly's
        for (int i = 0; i < orderedCells.Length; i++)
        {
            CreateBasePolygon(orderedCells[i], worldMapData, i);
        }

        // find all neighbours
        for (int z = 0; z < mapHeight; z++)
        {
            for (int x = 0; x < mapWidth; x++)
            {
                int index = x + z * mapWidth;
                for (int i = 0; i < tiles[index].cell.HalfEdges.Count; i++)
                {
                    if (tiles[index].cell.HalfEdges[i].NeighbourCell != null)
                        tiles[index].AddNeighbor(tiles[tiles[index].cell.HalfEdges[i].NeighbourCell.NodeIndex]);
                    else
                        tiles[index].AddNeighbor(null);
                }
            }
        }
    }

    private Tile CreateBasePolygon(VoronoiCell cell, Expression worldMapData, int index)
    {
        // create the game object and add a component
        GameObject go = new GameObject("tile");
        Tile tile = go.AddComponent<Tile>();
        tiles[index] = tile;

        // obtain map position
        Vector3 p = XYPositionToMapPosition((float)cell.X, (float)cell.Y);

        go.transform.SetParent(mapParent.transform);
        go.transform.localPosition = p;
        go.transform.localScale = new Vector3(1, 1, 1);

        // calculate poly and create voronoi node
        Vector3[] poly = new Vector3[cell.CellPoints.Count + 1];
        poly[0] = Vector3.zero;
        int c = cell.CellPoints.Count;
        for (int i = 0; i < c; i++)
        {
            poly[c - i] = XYPositionToMapPosition(cell.CellPoints[i].X, cell.CellPoints[i].Y) - p;
        }

        // create the voronoi node
        GraphicUtils.AddVoronoiPolygon(go, poly, Color.magenta, mapMaterial);
        tile.poly = poly;

        // add components
        go.AddComponent<MeshCollider>();

        tile.Initialize(cell, worldMapData.Symbols[index], poly);

        if (worldMapData.Symbols[index].GetMemberValue<bool>("goal", false))
            tile.faction = 1f;

        return tile;
    }

    #region MAP COORDS AND FINDERS
    private Vector3 XYPositionToMapPosition(double x, double y, float newY = 0)
    {
        Vector3 result = new Vector3((float)x, 0, worldMapData.Height - (float)y);
        result *= Main.Instance.worldScale;
        result.y = newY;
        return result;
    }

    internal Tile GetValidPowerUpTile()
    {
        List<Tile> options = new List<Tile>();

        for (int i = 0; i < tiles.Length; i++)
        {
            if (tiles[i].faction == 0 && !tiles[i].NeighborOfType(1f))
                options.Add(tiles[i]);
        }

        return options[Random.Range(0, options.Count - 1)];
    }

    internal Tile GetTileAt(Vector3 position)
    {
        Tile tile = GetTileQuick(position);
        float dx = tile.transform.position.x - position.x;
        float dz = tile.transform.position.z - position.z;
        float dist = (dx * dx) + (dz * dz);
        Tile best = tile;
        for (int i = 0; i < tile.neighbors.Count; i++)
        {
            dx = tile.neighbors[i].transform.position.x - position.x;
            dz = tile.neighbors[i].transform.position.z - position.z;
            float d = (dx * dx) + (dz * dz);
            if (d < dist)
            {
                dist = d;
                best = tile.neighbors[i];
            }
        }

        return best;
    }

    internal Tile GetTileQuick(Vector3 position)
    {
        int tx = Mathf.RoundToInt(position.x / Main.Instance.worldScale);
        tx = Mathf.Min(Mathf.Max(tx, 0), mapWidth - 1);
        int ty = Mathf.RoundToInt(mapHeight - position.z / Main.Instance.worldScale);
        ty = Mathf.Min(Mathf.Max(ty, 0), mapHeight - 1);
        return tiles[tx + ty * mapWidth];
    }
    #endregion

}
