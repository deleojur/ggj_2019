using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class BarScript : MonoBehaviour {

    private RectTransform barTransform;
    private float maxWidth;
    private float height;

    private Text caption;
    private Image fill;

    public void Initialize()
    {
        barTransform = transform.Find("Bar").Find("Foreground").GetComponent<RectTransform>();
        
        fill = barTransform.GetComponentInChildren<Image>();

        maxWidth = barTransform.sizeDelta.x;
        height = barTransform.sizeDelta.y;

        caption = this.gameObject.GetComponentInChildren<Text>();
    }

    public void SetColor(Color color)
    {
        fill.color = color;
    }

    public void SetValue(float value, float maxValue)
    {
        if (barTransform == null)
            Initialize();

        barTransform.sizeDelta = new Vector2((value / maxValue) * maxWidth, height);
    }

    public void SetValue(float value, float maxValue, string caption)
    {
        if (barTransform == null)
            Initialize();
        
        barTransform.sizeDelta = new Vector2((value / maxValue) * maxWidth, height);
        this.caption.text = caption;
    }

    public void ResetValue()
    {
        barTransform.sizeDelta = new Vector2(maxWidth, height);
    }
}
