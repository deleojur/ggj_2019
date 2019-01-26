using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using PhantomGrammar.GrammarCore;

public enum GeneratorState { None, Prepared, Generating, Done, DoneWithErrors }

public class Generator 
{
    internal GenerationSystem system;
    internal Expression result;
    internal GeneratorState state;
    internal float progress;

    public Generator()
    {
        string file = "Grammars/WorldMap/WorldMap.lsp";
        system = new GenerationSystem();

        string fullPath = System.IO.Path.Combine(Application.streamingAssetsPath, file);
        system.OpenFromFile(fullPath);

        Debug.Log(fullPath);
        Debug.Log(system);
    }

    public virtual void Prepare()
    {
        system.Reset();
        state = GeneratorState.Prepared;
        progress = 0;
    }

    public float GetProgress()
    {
        progress = (float)system.GetTotalProgress() / 100f;
        return progress;
    }

    public virtual void Generate()
    {
        state = GeneratorState.Generating;
        system.Execute();
        result = system.Output.Clone();

        state = GeneratorState.Done;
        progress = 1f;
        if (system.Errors.Count > 0)
        {
            Debug.Log("There were generation errors!");
            for (int i = 0; i < system.Errors.Count; i++)
                Debug.Log(system.Errors[i]);

            state = GeneratorState.DoneWithErrors;
        }
    }
}
