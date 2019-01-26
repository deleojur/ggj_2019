using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PlayerController : MonoBehaviour
{
    [SerializeField]
    private float _rotationThreshold;

    [SerializeField]
    private float _maxSpeed;

    [SerializeField]
    public float _forwardSpeed;

    [SerializeField]
    private float _rotationSpeed;

    [SerializeField]
    private float _minAngle, _maxAngle;

    [SerializeField]
    private float _shootTimer;
    private bool _canShoot = true;

    private Transform _transform;

    public GameObject bullet, bulletClone, bulletImpact, muzzleFlash;
    public Transform firePoint;

    public GameObject explosionObject, explosionClone;

    public float expPower, expRadius;

    Rigidbody playerRb;

    void Start()
    {
        _transform = transform;
        playerRb = GetComponent<Rigidbody>();
    }

    internal void UpdateRotation(float angle)
    {
        if (Mathf.Abs(angle) > _rotationThreshold)
        {
            _transform.RotateAround(_transform.position, _transform.forward, -angle * _rotationSpeed);
        }
    }

    internal void StopMoving()
    {
        playerRb.velocity = Vector3.zero;
        //slowly stop rotating
    }

    internal void Move()
    {
        playerRb.velocity = transform.up.normalized * _maxSpeed;
        //playerRb.AddForce(transform.up * forwardSpeed, ForceMode.Acceleration);

        if (playerRb.velocity.magnitude > _maxSpeed)
            playerRb.velocity = playerRb.velocity.normalized * _maxSpeed;
    }

    internal void Fire()
    {
        if (_canShoot)
        {
            _canShoot = false;
            //Particle Effects
            GameObject muzzleClone = Instantiate(muzzleFlash, firePoint.transform.position, Quaternion.Euler(-90, firePoint.transform.rotation.y, firePoint.transform.rotation.z));
            bulletClone = Instantiate(bullet, firePoint.transform.position, Quaternion.identity);

            //Firing bullet
            Rigidbody bulletRb = bulletClone.GetComponent<Rigidbody>();
            bulletRb.AddForce(transform.up * 1000);

            //Destroy instantiated objects
            Destroy(muzzleClone, 1f);
            Destroy(bulletClone, 10f);
            StartCoroutine(SetCanShoot());
        }
    }

    private IEnumerator SetCanShoot()
    {
        yield return new WaitForSeconds(_shootTimer);
        _canShoot = true;
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
