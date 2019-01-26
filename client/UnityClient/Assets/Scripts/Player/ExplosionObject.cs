using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ExplosionObject : MonoBehaviour
{
    public float expPower, expRadius;

    void Start()
    {
        Explosion();   
    }

    void Explosion()
    {
        Collider[] colliders = Physics.OverlapSphere(transform.position, expRadius);
        foreach (Collider hit in colliders)
        {
            Rigidbody rb = hit.GetComponent<Rigidbody>();

            if (rb != null)
            {
                rb.AddExplosionForce(expPower, transform.position, expRadius);
            }
        }
    }
}
