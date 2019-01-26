using Entities;
using System;
using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;

public class Main : MonoBehaviour
{
    [Header("World")]
    [SerializeField] internal int seed = 100;
    [SerializeField] internal float worldScale = 1f;

    [Header("Registers")]
    [SerializeField] internal float infected = 0.1f;
    [SerializeField] internal int width = 10;
    [SerializeField] internal int height = 5;

    internal GeneratorHandler generatorHandler;
    internal WorldManager worldManager;
    internal EnvironmentalAI environmentalAI;

    internal PlayerManager playerManager;

    // TODO: is false you are not allowed to join
    internal bool canJoin = false;

    // powerup legacy system
    List<PowerupBaseClass> currentRoundPowerUps;

    // UI
    public GameObject roundSequenceUI;
    public TextMeshProUGUI roundSequenceText;

    internal static event Action OnGameRoundStarted;
    internal static event Action OnGameRoundEnded;

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

        environmentalAI = new EnvironmentalAI();

        StartRound();
    }

    // idem Start() comments!!
    public void Update()
    {
        generatorHandler.DoUpdate();
        worldManager.DoUpdate();

        if(canJoin)
            environmentalAI.DoUpdate();
    }

    internal void StartRound()
    {
        // show introduction round UI
        roundSequenceUI.SetActive(true);
        roundSequenceText.text = "Generating problematic worlds... ";

        currentRoundPowerUps = new List<PowerupBaseClass>();
        generatorHandler.StartGenerating(worldManager.ProcessWorldMap);
    }

    internal void IntroduceRound()
    {
        StartCoroutine("WaitForActivateRound");
    }

    private IEnumerator WaitForActivateRound()
    {
        roundSequenceText.text = "Ready?!";

        for (int i = 3; i > 0; i--)
        {
            yield return new WaitForSeconds(1);
            roundSequenceText.text = i.ToString();
        }

        yield return new WaitForSeconds(1);
        roundSequenceText.text = "GO!";

        yield return new WaitForSeconds(1);
        roundSequenceUI.SetActive(false);

        // players may join now!
        canJoin = true;

        OnGameRoundStarted?.Invoke();

        yield return null;
    }

    internal void EndRound()
    {
        canJoin = false;

        // TODO: call when AI beats the freaking game

        // TODO: process powerups, prepare registers.

        // Reload the scene

        OnGameRoundEnded?.Invoke();
    }

    internal static Color ChangeColorBrightness(Color color, float correctionFactor)
    {
        float red = color.r;
        float green = color.g;
        float blue = color.b;

        if (correctionFactor < 0)
        {
            correctionFactor = 1 + correctionFactor;
            red *= correctionFactor;
            green *= correctionFactor;
            blue *= correctionFactor;
        }
        else
        {
            red = (1 - red) * correctionFactor + red;
            green = (1 - green) * correctionFactor + green;
            blue = (1 - blue) * correctionFactor + blue;
        }

        return new Color(red, green, blue, color.a);
    }

    internal void PlayerUpdate()
    {
        if (playerManager == null)
            playerManager = FindObjectOfType<PlayerManager>();

        environmentalAI.PlayerUpdate();
    }
}

