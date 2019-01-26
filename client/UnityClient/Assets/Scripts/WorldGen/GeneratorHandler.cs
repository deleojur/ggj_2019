using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using System.Threading;
using PhantomGrammar.GrammarCore;

public delegate void GeneratorCallback(Expression world);

public class GeneratorHandler : MonoBehaviour
{
    // TODO: generation UI

    private float progress;

    private Thread thread;
    private Generator generator;
    private GeneratorCallback callback;

    internal void Initialize()
    {
        // TODO: UI

        generator = new Generator();
    }

    internal void StartGenerating(GeneratorCallback callback)
    {
        // TODO: UI

        // set registers
        // TOOD: do we want to do this with a register or just some noise? noise huh?
        generator.system.SetRegister("infected", Main.Instance.infected);
        generator.system.SetRegister("width", Main.Instance.width);
        generator.system.SetRegister("height", Main.Instance.height);

        generator.Prepare();

        this.callback = callback;
        progress = 0f;

        thread = new Thread(StartThread);
        thread.Start();
    }

    public void StartThread()
    {
        generator.Generate();
    }

    public void DoUpdate()
    {
        if(thread != null)
        {
            if (thread.IsAlive)
            {
                float p = generator.GetProgress();
                SetProgress(p);
            }
            else
            {
                SetProgress(1f);
                Done();
            }
        }
        /*else
        {
            progress += Time.unscaledDeltaTime;
            if (progress < 1f)
                SetProgress(progress);
            else
                Done();

        }*/
    }

    public void Done()
    {
        callback?.Invoke(generator.result);
        thread = null;
    }

    private void SetProgress(float p)
    {
        Debug.Log(p);
        if ((p > progress || progress == 1) && p <= 1f && p >= 0f)
        {
            progress = p;

            // TODO: ui!!
        }
    }
}
