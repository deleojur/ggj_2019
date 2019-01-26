using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using MEC;

public class CameraShakes : MonoBehaviour
{
    [SerializeField]
    private float _shakeMagnitude;

    private float _startTime;

    private Camera _camera;
    private Transform _transform;

    private Vector3 _originalPosition;

    private void Awake()
    {
        _camera = GetComponent<Camera>();
        _transform = GetComponent<Transform>();
        _originalPosition = _transform.localPosition;
    }

    internal void Shake(float duration)
    {
        Timing.RunCoroutine(ShakeCamera(duration));
    }

    private IEnumerator<float> ShakeCamera(float duration)
    {
        float elapsedTime = 0f;

        while (elapsedTime < duration)
        {
            yield return 0;

            float x = _originalPosition.x + Random.Range(-1f, 1f) * _shakeMagnitude;
            float y = _originalPosition.y + Random.Range(-1f, 1f) * _shakeMagnitude;

            transform.localPosition = new Vector3(x, y, _originalPosition.z);

            elapsedTime += Time.deltaTime;
        }

        transform.localPosition = _originalPosition;
    }
}