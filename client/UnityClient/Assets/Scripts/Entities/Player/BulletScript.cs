using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BulletScript : MonoBehaviour
{
    public GameObject impactPrefab;
    private Rigidbody rb;

    private const float HEAL = 0.25f;

    internal Tile prevTile;
    internal Tile currentTile;

    private void Start()
    {
        Debug.Log(transform.rotation);
        rb = GetComponent<Rigidbody>();
        rb.AddForce(transform.forward * 1000);
    }

    private void Update()
    {
        prevTile = currentTile;
        currentTile = Main.Instance.worldManager.worldMap.GetTileAt(gameObject.transform.position);
        Debug.Log(currentTile.faction);
        currentTile.render.material.color = Color.red;
        Impact();
    }

    private void Impact()
    {
        // something to change about this tile!
        if (currentTile.faction > 0.0f)
        {
            currentTile.DealDamage(-HEAL);
            Die();
        }
    }

    private void Die()
    {
        Instantiate(impactPrefab, transform.position, Quaternion.identity);
        Destroy(gameObject);
    }

    /*private void OnTriggerEnter(Collider other)
    {
        if (collision.gameObject.CompareTag("Player"))
        {
            Destroy(gameObject);
            explosionClone = Instantiate(explosionObject, transform.position, Quaternion.identity);
            Destroy(explosionClone, .5f);
            Destroy(gameObject);            
        }
    }*/
}
