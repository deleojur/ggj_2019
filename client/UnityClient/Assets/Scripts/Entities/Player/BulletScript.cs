using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BulletScript : MonoBehaviour
{
    public GameObject explosionObject, explosionClone;
    private Rigidbody rb;

    private void Start()
    {
        rb = GetComponent<Rigidbody>();
        rb.AddForce(transform.up * 1000);
    }

    private void OnTriggerEnter(Collider other)
    {
        if (other.gameObject.CompareTag("Player"))
        {
            explosionClone = Instantiate(explosionObject, transform.position, Quaternion.identity);
            Destroy(explosionClone, .5f);
            Destroy(gameObject);            
        }
    }
}
