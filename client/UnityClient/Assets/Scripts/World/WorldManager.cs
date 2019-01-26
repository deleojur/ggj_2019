using PhantomGrammar.GrammarCore;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;

public class WorldManager : MonoBehaviour
{
    internal WorldMap worldMap;

    internal void Initialize()
    {
        worldMap = new WorldMap();
        worldMap.Initialize();
    }

    internal void DoUpdate()
    {

    }

    internal void ProcessWorldMap(Expression worldMapData)
    {
        // save map data
        if (!Directory.Exists("SaveData"))
            Directory.CreateDirectory("SaveData");

        string path = "SaveData/worldmap.xpr";
        worldMapData.SaveFile(path);

        worldMap.Build(worldMapData);

        // TODO: activate game state

        // TODO: enable joining the world and placing units

    }
}
