using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BulletScript : MonoBehaviour
{
    public GameObject impactPrefab;
    private Rigidbody rb;
    private Color color; 
    private const float HEAL = 0.5f;

    internal Tile prevTile;
    internal Tile currentTile;

    internal void Initialize(Color color)
    {
        rb = GetComponent<Rigidbody>();
        rb.AddForce(transform.forward * 5000);

        this.color = color;
        transform.Find("Sphere").GetComponent<MeshRenderer>().material.color = color;
        transform.Find("ExtraGlow").GetComponent<ParticleSystem>().startColor = color;
    }

    private void Update()
    {
        prevTile = currentTile;
        currentTile = Main.Instance.worldManager.worldMap.GetTileAt(gameObject.transform.position);
        currentTile.SetColor(color);
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

    private void OnTriggerEnter(Collider collision)
    {
        if (collision.gameObject.CompareTag("Player"))
        {
            collision.gameObject.GetComponent<PlayerController>().ChangeFireColor(color);
            Die();
        }
    }
}
