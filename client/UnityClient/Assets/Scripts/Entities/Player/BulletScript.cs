using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public enum BulletType { Small, Normal, Big }

public class BulletScript : MonoBehaviour
{
    public GameObject impactPrefab;
    private Rigidbody rb;
    private Color color; 
    private const float HEAL = 1f;

    internal Tile prevTile;
    internal Tile currentTile;

    internal BulletType type;

    internal void Initialize(Color color, BulletType type)
    {
        rb = GetComponent<Rigidbody>();
        rb.AddForce(transform.forward * 5000);

        this.type = type;

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
            if (type == BulletType.Big)
                currentTile.Heal(HEAL, 3);
            else if (type == BulletType.Normal)
                currentTile.Heal(HEAL);
            else if (type == BulletType.Small)
                currentTile.Heal(HEAL, 0);
            Die();
        }
    }

    private void Die()
    {
        GameObject impactClone = Instantiate(impactPrefab, transform.position, Quaternion.identity);
        Destroy(impactClone, 1f);
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
