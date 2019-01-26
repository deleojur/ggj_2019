using System.Collections;
using System.Collections.Generic;
using Entities;
using UnityEngine;
using UnityEngine.UI;

public class PlayerController : MonoBehaviour
{
    [SerializeField] private float m_Speed = 12f;                 // How fast the tank moves forward and back.
    [SerializeField] private float m_TurnSpeed = 180f;            // How fast the tank turns in degrees per second.
    [SerializeField] private AudioSource m_MovementAudio;         // Reference to the audio source used to play engine sounds. NB: different to the shooting audio source.
    [SerializeField] private AudioClip m_EngineIdling;            // Audio to play when the tank isn't moving.
    [SerializeField] private AudioClip m_EngineDriving;           // Audio to play when the tank is moving.
    [SerializeField] private float m_PitchRange = 0.2f;           // The amount by which the pitch of the engine noises can vary.
    [SerializeField] private Rigidbody m_Rigidbody;              // Reference used to move the tank.
    [SerializeField] private Renderer[] _renderers;

    internal float Speed { get { return m_Speed; } set { m_Speed = value; } }
    internal Rigidbody Rigidbody { get { return m_Rigidbody; } set { m_Rigidbody = value; } }

    private string m_MovementAxisName;          // The name of the input axis for moving forward and back.
    private string m_TurnAxisName;              // The name of the input axis for turning.
    private float m_MovementInputValue;         // The current value of the movement input.
    private float m_TurnInputValue;             // The current value of the turn input.
    private float m_OriginalPitch;              // The pitch of the audio source at the start of the scene.
    private ParticleSystem[] m_particleSystems; // References to all the particles systems used by the Tanks

    public GameObject muzzleFlash, muzzleFlashClone;
    public GameObject bullet, bulletClone;
    public Transform firePoint;
    public bool canFire = true;
    public bool tripleShot = false;
    public bool machineGun = false;
    public float fireRate;

    internal Tile prevTile;
    internal Tile currentTile;

    internal bool dead = false;

    private bool _isDebugging;
    internal PlayerManager.DebugKeys _debugKeys;

    private Color _color;
    internal Color Color
    {
        get
        {
            return _color;
        }
        set
        {
            _color = value;
            for (int i = 0; i < _renderers.Length; i++)
            {
                _renderers[i].material.color = value;
            }
        }
    }

    private void Awake()
    {
        m_Rigidbody = GetComponent<Rigidbody>();
    }

    private void OnEnable()
    {
        // When the tank is turned on, make sure it's not kinematic.
        m_Rigidbody.isKinematic = false;

        // Also reset the input values.
        m_MovementInputValue = 0f;
        m_TurnInputValue = 0f;

        // We grab all the Particle systems child of that Tank to be able to Stop/Play them on Deactivate/Activate
        // It is needed because we move the Tank when spawning it, and if the Particle System is playing while we do that
        // it "think" it move from (0,0,0) to the spawn point, creating a huge trail of smoke
        m_particleSystems = GetComponentsInChildren<ParticleSystem>();
        for (int i = 0; i < m_particleSystems.Length; ++i)
        {
            m_particleSystems[i].Play();
        }
    }

    private void OnDisable()
    {
        // When the tank is turned off, set it to kinematic so it stops moving.
        m_Rigidbody.isKinematic = true;

        // Stop all particle system so it "reset" it's position to the actual one instead of thinking we moved when spawning
        for (int i = 0; i < m_particleSystems.Length; ++i)
        {
            m_particleSystems[i].Stop();
        }
    }

    internal void FixedUpdate()
    {
        if (_isDebugging)
        {
            if (Input.GetKey(_debugKeys.Forward))
                Move();
            if (Input.GetKey(_debugKeys.MoveLeft))
                Turn(-10);
            if (Input.GetKey(_debugKeys.MoveRight))
                Turn(10);
            if (Input.GetKey(_debugKeys.Shoot))
                Fire();
        }

        prevTile = currentTile;
        currentTile = Main.Instance.worldManager.worldMap.GetTileAt(gameObject.transform.position);

        if (DeathByGap())
            return;
    }

    private bool DeathByGap()
    {
        if (currentTile.faction >= 1.0f)
        {
            dead = true;
            StartCoroutine("Die");
            return true;
        }
            
        return false;
    }

    private void Die()
    {
        // todo: wait for dying, do a funny animation
        Destroy(gameObject);
    }

    private void EngineAudio()
    {
        // If there is no input (the tank is stationary)...
        if (Mathf.Abs(m_MovementInputValue) < 0.1f && Mathf.Abs(m_TurnInputValue) < 0.1f)
        {
            // ... and if the audio source is currently playing the driving clip...
            if (m_MovementAudio.clip == m_EngineDriving)
            {
                // ... change the clip to idling and play it.
                m_MovementAudio.clip = m_EngineIdling;
                m_MovementAudio.pitch = Random.Range(m_OriginalPitch - m_PitchRange, m_OriginalPitch + m_PitchRange);
                m_MovementAudio.Play();
            }
        }
        else
        {
            // Otherwise if the tank is moving and if the idling clip is currently playing...
            if (m_MovementAudio.clip == m_EngineIdling)
            {
                // ... change the clip to driving and play.
                m_MovementAudio.clip = m_EngineDriving;
                m_MovementAudio.pitch = Random.Range(m_OriginalPitch - m_PitchRange, m_OriginalPitch + m_PitchRange);
                m_MovementAudio.Play();
            }
        }
    }

    internal void ActivateDebugMode(PlayerManager.DebugKeys keys)
    {
        _debugKeys = keys;
        _isDebugging = true;
    }

    internal void Move()
    {
        // Create a vector in the direction the tank is facing with a magnitude based on the input, speed and the time between frames.
        Vector3 movement = transform.forward * m_Speed * Time.deltaTime;

        // Apply this movement to the rigidbody's position.
        m_Rigidbody.MovePosition(m_Rigidbody.position + movement);
    }


    internal void Turn(float beta)
    {
        // Determine the number of degrees to be turned based on the input, speed and time between frames.
        float turn = beta * m_TurnSpeed * Time.fixedDeltaTime;

        // Make this into a rotation in the y axis.
        Quaternion turnRotation = Quaternion.Euler(0f, turn, 0f);

        // Apply this rotation to the rigidbody's rotation.
        m_Rigidbody.MoveRotation(m_Rigidbody.rotation * turnRotation);
    }

    public void Fire()
    {
        if (tripleShot && canFire)
        {
            StartCoroutine(TripleShot());
        }
        else if (machineGun && canFire)
        {
            StartCoroutine(MachineGun());
        }
        else if (canFire)
        {
            StartCoroutine(NormalShot());
        }
    }

    IEnumerator TripleShot()
    {
        canFire = false;
        Vector3 rotation = firePoint.transform.rotation.eulerAngles;
        float offSet = -20;
        for (int i = 0; i < 3; i++)
        {
            GameObject muzzleClone = Instantiate(muzzleFlash, firePoint.transform.position, Quaternion.Euler(-90, rotation.y, rotation.z + offSet));
            bulletClone = Instantiate(bullet, firePoint.transform.position, Quaternion.Euler(
                90,
                rotation.y,
                rotation.z + offSet));

            offSet += 20;

            Destroy(muzzleClone, 1f);
            Destroy(bulletClone, 3f);
        }
        yield return new WaitForSeconds(fireRate);
        canFire = true;
    }

    IEnumerator MachineGun()
    {
        canFire = false;
        Vector3 rotation = firePoint.transform.rotation.eulerAngles;
        float offSet = Random.Range(-30, 30);
        muzzleFlashClone = Instantiate(muzzleFlash, firePoint.transform.position, Quaternion.Euler(-90, rotation.y, rotation.z));
        bulletClone = Instantiate(bullet, firePoint.transform.position, Quaternion.Euler(90, rotation.y, rotation.z + offSet));

        Destroy(muzzleFlashClone, 1f);
        Destroy(bulletClone, 3f);

        yield return new WaitForSeconds(fireRate/5);
        canFire = true;
    }

    IEnumerator NormalShot()
    {
        canFire = false;
        muzzleFlashClone = Instantiate(muzzleFlash, firePoint.transform.position, Quaternion.Euler(-90, firePoint.transform.rotation.y, firePoint.transform.rotation.z));
        bulletClone = Instantiate(bullet, firePoint.transform.position, firePoint.transform.rotation);

        Destroy(muzzleFlashClone, 1f);
        Destroy(bulletClone, 3f);

        yield return new WaitForSeconds(fireRate);
        canFire = true;
    }
}
