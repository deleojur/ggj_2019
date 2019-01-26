using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PlayerController : MonoBehaviour
{
    public float forwardSpeed;
    public float rotationSpeed;

    public GameObject bullet, bulletClone, bulletImpact, muzzleFlash;
    public Transform firePoint;

    public GameObject explosionObject, explosionClone;

    public float expPower, expRadius;

    Rigidbody playerRb;

    void Start()
    {
        playerRb = GetComponent<Rigidbody>();
    }

    void Update()
    {
        Movement();

        if (Input.GetKeyDown(KeyCode.Space))
        {
            Fire();
        }
    }

    void Movement()
    {
        if (Input.GetKey(KeyCode.W))
        {
            playerRb.AddForce(transform.up * forwardSpeed);
        }
        else if (Input.GetKey(KeyCode.S))
        {
            playerRb.AddForce(-transform.up * forwardSpeed);
        }
        else
        {
            playerRb.velocity = Vector3.Lerp(playerRb.velocity, Vector3.zero, Time.deltaTime);
        }

        playerRb.angularVelocity = Vector3.zero;


        if (Input.GetKey(KeyCode.A))
        {
            transform.Rotate(transform.rotation.x, transform.rotation.y, transform.rotation.z + rotationSpeed);
        }
        if (Input.GetKey(KeyCode.D))
        {
            transform.Rotate(transform.rotation.x, transform.rotation.y, transform.rotation.z - rotationSpeed);
        }
    }

    void Fire()
    {
        //Particle Effects
        GameObject muzzleClone = Instantiate(muzzleFlash, firePoint.transform.position, Quaternion.Euler(-90, firePoint.transform.rotation.y, firePoint.transform.rotation.z));
        bulletClone = Instantiate(bullet, firePoint.transform.position, Quaternion.identity);

        //Firing bullet
        Rigidbody bulletRb = bulletClone.GetComponent<Rigidbody>();
        bulletRb.AddForce(transform.up * 1000); //1000 = bulletSpeed

        //Destroy instantiated objects
        Destroy(muzzleClone, 1f);
        Destroy(bulletClone, 10f);        
    }

    private void OnCollisionEnter(Collision collision)
    {
        //Explosion On Collision
        Debug.Log("Boem");
        ContactPoint contact = collision.contacts[0];
        Debug.Log(contact.point);

        Vector3 pos = contact.point;

        explosionClone = Instantiate(explosionObject, pos, Quaternion.identity);
        Destroy(explosionClone, 1f);
        //Collider[] colliders = Physics.OverlapSphere(pos, 5f);
        //foreach (Collider hit in colliders)
        //{
        //    Rigidbody rb = hit.GetComponent<Rigidbody>();

        //    if (rb != null)
        //    {
        //        rb.AddExplosionForce(expPower, pos, expRadius);
        //    }
        //}
    }
}
