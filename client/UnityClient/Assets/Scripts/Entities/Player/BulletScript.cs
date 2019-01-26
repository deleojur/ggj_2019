using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BulletScript : MonoBehaviour
{
    private Rigidbody rb;

    private void Start()
    {
        Debug.Log(transform.rotation);
        rb = GetComponent<Rigidbody>();
        rb.AddForce(transform.forward * 1000);
    }

    private void OnCollisionEnter(Collision collision)
    {
        if (collision.gameObject.CompareTag("Player"))
        {
            Destroy(gameObject);
        }
    }
}
