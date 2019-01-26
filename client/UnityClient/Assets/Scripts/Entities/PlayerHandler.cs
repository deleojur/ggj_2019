using UnityEngine;
using System.Collections;

namespace Entities
{
    public class PlayerHandler : MonoBehaviour
    {
        private string _name;
        private string _id;
        private Transform _transform;

        [SerializeField]
        private float _rotationThreshold;

        [SerializeField]
        private float _rotationMultiplier;

        [SerializeField]
        private float _moveMultiplier;

        private void Awake()
        {
            _transform = transform;
        }

        internal void Initialize(string name, string id)
        {
            _name = name;
            _id = id;
        }

        internal void MoveForward()
        {
            _transform.Translate(_transform.forward * _moveMultiplier);
        }

        internal void Shoot()
        {
             
        }

        internal void UpdateRotation(float angle)
        {
            if (Mathf.Abs(angle) > _rotationThreshold)
            {
                _transform.RotateAround(_transform.position, _transform.up, angle * _rotationMultiplier);
            }
        }
    }
}
