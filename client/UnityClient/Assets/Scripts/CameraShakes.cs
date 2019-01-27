using UnityEngine;
using System.Collections;

public class CameraShakes : MonoBehaviour
{
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

    internal void Shake(float duration, float magnitude)
    {
        StartCoroutine(ShakeCamera(duration, magnitude));
    }

    private IEnumerator ShakeCamera(float duration, float magnitude)
    {
        float elapsedTime = 0f;

        while (elapsedTime < duration)
        {
            yield return 0;

            float x = _originalPosition.x + Random.Range(-1f, 1f) * magnitude;
            float y = _originalPosition.y + Random.Range(-1f, 1f) * magnitude;

            transform.localPosition = new Vector3(x, y, _originalPosition.z);

            elapsedTime += Time.deltaTime;
        }

        transform.localPosition = _originalPosition;
    }
}