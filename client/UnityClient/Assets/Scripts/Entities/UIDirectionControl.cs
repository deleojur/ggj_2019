using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class UIDirectionControl : MonoBehaviour
{
    private Quaternion m_RelativeRotation;          // The local rotatation at the start of the scene.


    private void Start()
    {
        m_RelativeRotation = transform.parent.localRotation;
    }


    private void Update()
    {
        transform.rotation = m_RelativeRotation;
    }
}
