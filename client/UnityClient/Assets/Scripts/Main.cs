using Entities;
using System;
using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;

public enum GameState { Room = 0, Start, Game, End }

public class Main : MonoBehaviour
{
    [SerializeField] internal int maxPlayers = 4;

    [Header("AI")]
    [SerializeField] internal float maxPower = 300f;
    [SerializeField] internal float startTimer = 1.7f;
    [SerializeField] internal float endTimer = 0.02f;
    [SerializeField] internal float startMinDmg = .2f;
    [SerializeField] internal float startMaxDmg = .6f;
    [SerializeField] internal float endMinDmg = .8f;
    [SerializeField] internal float endMaxDmg = 1f;
    [SerializeField] internal float startEffect = 10f;
    [SerializeField] internal float endEffect = 30f;

    [Header("World")]
    [SerializeField] internal int seed = 100;
    [SerializeField] internal float worldScale = 1f;

    [Header("Registers")]
    [SerializeField] internal int width = 10;
    [SerializeField] internal int height = 5;

    internal GeneratorHandler generatorHandler;
    internal WorldManager worldManager;
    internal EnvironmentalAI environmentalAI;

    internal PlayerManager playerManager;

    internal int state = 0;

    // powerup legacy system
    List<PowerupBaseClass> currentRoundPowerUps;

    // UI
    public GameObject roomUI;
    public TextMeshProUGUI roomPlayerAmountText;

    public GameObject roundSequenceUI;
    public TextMeshProUGUI roundSequenceText;

    public GameObject endUI;
    public TextMeshProUGUI endText;

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

        state = (int)GameState.Room;
        OpenRoom();
    }

    // idem Start() comments!!
    public void Update()
    {
        switch ((GameState)state)
        {
            case GameState.Room:
                break;

            case GameState.Start:
                generatorHandler.DoUpdate();
                break;

            case GameState.Game:
                environmentalAI.DoUpdate();
                break;

            case GameState.End:
                break;
        }
    }

    internal void NextState()
    {
        state++;

        // end prev, start current
        switch ((GameState)state)
        {
            case GameState.Room:
                endUI.SetActive(false);
                OpenRoom();
                break;

            case GameState.Start:
                roomUI.SetActive(false);
                StartRound();
                break;

            case GameState.Game:
                roundSequenceUI.SetActive(false);
                playerManager.ActivateClients();
                // TODO: maybe start a corountine with some explanations?
                break;

            case GameState.End:
                DetermineWinner();
                break;
        }
    }

    internal void DetermineWinner()
    {
        int[] scores = new int[maxPlayers];
        int winner = 0;
        int highest = 0;

        for (int i = 0; i < maxPlayers; i++)
        {
            scores[i] = worldManager.worldMap.TilesWithColor(playerManager._colors[i], 0.4f);

            if(scores[i] > highest)
            {
                highest = scores[i];
                winner = i;
            }
        }

        string winnerName = "";
        if (highest == 0)
            winnerName = "No one";
        else
        {
            switch (playerManager._colors[winner].ToString())
            {
                case "RGBA(1.000, 0.000, 0.046, 0.000)":
                    winnerName = "Red";
                    break;
                case "RGBA(1.000, 0.925, 0.000, 0.000)":
                    winnerName = "Yellow";
                    break;
                case "RGBA(0.000, 1.000, 0.101, 0.000)":
                    winnerName = "Green";
                    break;
                case "RGBA(0.000, 0.980, 1.000, 0.000)":
                    winnerName = "Blue";
                    break;
            }
        }

        endUI.SetActive(true);
        endText.text = winnerName + " won with " + highest + " tiles!";

        // start happy confetti particle or something!

        StartCoroutine(EndGame());
    }

    internal IEnumerator EndGame()
    {
        yield return new WaitForSeconds(3);

        endText.text = "Wew that was exciting wasn't it?";
        yield return new WaitForSeconds(1);
        endText.text = "Thank you for playing and see you next round!";
        yield return new WaitForSeconds(1);
        endText.text = "DE STEKKERDOOS";
        yield return new WaitForSeconds(2);

        playerManager.RemoveAllClients();
        OnGameRoundEnded?.Invoke();

        UnityEngine.SceneManagement.SceneManager.LoadScene(0);

        yield return null;
    }

    internal void OpenRoom()
    {
        roomUI.SetActive(true);
        roomPlayerAmountText.text = "0/"+maxPlayers+" players";
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

        // players may join now!
        NextState();

        OnGameRoundStarted?.Invoke();

        yield return null;
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

    internal void PlayerJoined()
    {
        if (playerManager == null)
            playerManager = FindObjectOfType<PlayerManager>();

        if(state == (int)GameState.Room)
        {
            roomPlayerAmountText.text = playerManager.PlayerAmount + "/"+maxPlayers+" players";
            if (playerManager.PlayerAmount == maxPlayers)
                NextState();
        }

        if(state == (int)GameState.Game)
        {
            if(playerManager.PlayerAmount == 0)
                NextState();
        }
            
        environmentalAI.PlayerUpdate();
    }

    internal int playerDeaths = 0;
    internal void PlayerDied()
    {
        if(state == (int)GameState.Game)
        {
            playerDeaths++;
            if (playerDeaths == maxPlayers)
                NextState();
        }
    }
}

