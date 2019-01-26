using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Main : MonoBehaviour
{
    [Header("World")]
    [SerializeField] internal int seed = 100;
    [SerializeField] internal float worldScale = 1f;

    [Header("Registers")]
    [SerializeField] internal float infected = 0.1f;

    internal GeneratorHandler generatorHandler;
    internal WorldManager worldManager;

    private static Main instance;
    internal static Main Instance
    {
        get
        {
            if (instance == null)
                instance = FindObjectOfType<Main>();
            return instance;
        }
    }

    // THIS IS THE ONLY START IN THE WHOLE PROJECT!!
    // all other classes and scripts should implement a Initialize() methode
    // which is to be called by this Start() method
    public void Start()
    {
        // create and set up the generator
        generatorHandler = this.gameObject.GetComponent<GeneratorHandler>();
        generatorHandler.Initialize();

        worldManager = this.gameObject.GetComponent<WorldManager>();
        worldManager.Initialize();
    }

    // idem Start() comments!!
    public void Update()
    {
        generatorHandler.DoUpdate();
        worldManager.DoUpdate();
    }

    public void ClickGenerate()
    {
        generatorHandler.StartGenerating(worldManager.ProcessWorldMap);
    }


}

